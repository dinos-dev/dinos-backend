import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PROFILE_REPOSITORY, TOKEN_REPOSITORY, USER_REPOSITORY } from 'src/common/config/common.const';

import { AuthService } from 'src/auth/application/auth.service';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { WinstonLoggerService } from 'src/infrastructure/logger/winston-logger.service';

import { ITokenRepository } from 'src/auth/domain/repository/token.repository.interface';
import { IUserRepository } from 'src/user/domain/repository/user.repository.interface';

import { SocialUserDto } from 'src/user/presentation/dto/request/social-user.dto';
import { CreateUserDto } from 'src/user/presentation/dto/request/create-user.dto';

import { mockPrismaService, MockPrismaService } from '../../__mocks__/prisma.service.mock';
import { createMockUser, createMockUserWithTokens } from '../../__mocks__/user.factory';
import { createMockToken } from '../../__mocks__/token.factory';

import { Provider } from 'src/auth/domain/constant/provider.enum';
import { DateUtils } from 'src/common/utils/date-util';
import { detectPlatform } from 'src/auth/application/util/client.util';
import { mockDeep } from 'jest-mock-extended';
import { IProfileRepository } from 'src/user/domain/repository/profile.repository.interface';
import { SlackService } from 'src/infrastructure/slack/slack.service';
import { SERVICE_CHANNEL } from 'src/infrastructure/slack/constant/channel.const';

import * as profileFactory from 'src/user/application/helper/profile.factory';

// Mock external dependencies
jest.mock('src/auth/application/util/client.util');
jest.mock('src/common/utils/date-util');

const mockDetectPlatform = detectPlatform as jest.MockedFunction<typeof detectPlatform>;
const mockDateUtils = DateUtils as jest.Mocked<typeof DateUtils>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: MockPrismaService;

  const userRepository: jest.Mocked<IUserRepository> = mockDeep<IUserRepository>();
  const tokenRepository: jest.Mocked<ITokenRepository> = mockDeep<ITokenRepository>();
  const profileRepository: jest.Mocked<IProfileRepository> = mockDeep<IProfileRepository>();
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let logger: jest.Mocked<WinstonLoggerService>;
  let slackService: jest.Mocked<SlackService>;

  beforeEach(async () => {
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as any;

    configService = {
      get: jest.fn(),
    } as any;

    logger = {
      log: jest.fn(),
      error: jest.fn(),
    } as any;

    slackService = {
      sendMessage: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: USER_REPOSITORY,
          useValue: userRepository,
        },
        {
          provide: TOKEN_REPOSITORY,
          useValue: tokenRepository,
        },
        {
          provide: PROFILE_REPOSITORY,
          useValue: profileRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService(),
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: WinstonLoggerService,
          useValue: logger,
        },
        {
          provide: SlackService,
          useValue: slackService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<MockPrismaService>(PrismaService);

    // Setup default mocks
    mockDetectPlatform.mockResolvedValue('WEB' as any);
    mockDateUtils.calculateExpiresAt.mockReturnValue(new Date('2024-12-31'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateBearerToken', () => {
    it('Bearer 토큰 형식이 올바르면 토큰을 반환한다.', async () => {
      const token = await service.validateBearerToken('Bearer mock.token.value');
      expect(token).toBe('mock.token.value');
    });

    it('토큰 형식이 올바르지 않으면 UnauthorizedException 예외를 발생시킨다.', async () => {
      await expect(service.validateBearerToken('InvalidFormatToken')).rejects.toThrow(UnauthorizedException);
    });

    it('Bearer가 아닌 다른 스키마를 사용하면 UnauthorizedException 예외를 발생시킨다.', async () => {
      await expect(service.validateBearerToken('Basic mock.token')).rejects.toThrow(UnauthorizedException);
    });

    it('토큰이 없으면 UnauthorizedException 예외를 발생시킨다.', async () => {
      await expect(service.validateBearerToken('Bearer')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('socialLogin', () => {
    const mockSocialUserDto: SocialUserDto = {
      email: 'test@example.com',
      provider: Provider.GOOGLE,
      providerId: '1234567890',
      name: 'Test User',
    };

    const mockUser = createMockUser();
    const mockTokens = {
      accessToken: 'access.token',
      refreshToken: 'refresh.token',
      expiresAt: new Date('2025-10-15'),
    };

    beforeEach(() => {
      jest.clearAllMocks();

      jest.spyOn(service as any, 'generatedTokens').mockResolvedValue(mockTokens);
      userRepository.findByUnique.mockReset();
      userRepository.findOrCreateSocialUser.mockReset();
      tokenRepository.updateOrCreateRefToken.mockReset();
      jest.spyOn(logger, 'log').mockImplementation(jest.fn());

      // detectPlatform은 외부 함수이므로 mock 처리 (정 필요하면 mock 파일 따로 분리해도 됨)
      jest.mocked(detectPlatform as any).mockResolvedValue('WEB');
    });

    it('새로운 소셜 사용자 로그인 시 토큰을 반환한다.', async () => {
      const tx = {} as any;

      userRepository.findByUnique.mockResolvedValue(null);
      userRepository.findOrCreateSocialUser.mockResolvedValue({ user: mockUser, isNew: true });
      tokenRepository.updateOrCreateRefToken.mockResolvedValue(createMockToken());

      prismaService.$transaction.mockImplementation(async (cb) => {
        return await cb(tx);
      });

      const result = await service.socialLogin('Mozilla', mockSocialUserDto);

      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });

      expect(userRepository.findByUnique).toHaveBeenCalledWith('email', mockSocialUserDto.email, tx);
      expect(userRepository.findOrCreateSocialUser).toHaveBeenCalledWith(mockSocialUserDto, tx);
      expect(tokenRepository.updateOrCreateRefToken).toHaveBeenCalledWith(
        mockUser,
        mockTokens.refreshToken,
        'WEB',
        mockTokens.expiresAt,
        tx,
      );
      expect(logger.log).toHaveBeenCalledWith(`[소셜] ${mockSocialUserDto.email} 유저가 로그인 하였습니다 🎉`);
    });

    it('기존 사용자가 다른 provider로 가입되어 있으면 ConflictException을 발생시킨다.', async () => {
      const tx = {} as any;
      const existingUser = createMockUser({ provider: Provider.NAVER });

      userRepository.findByUnique.mockResolvedValue(existingUser);

      prismaService.$transaction.mockImplementation(async (cb) => {
        return await cb(tx);
      });

      await expect(service.socialLogin('Mozilla', mockSocialUserDto)).rejects.toThrow(ConflictException);
    });

    it('기존 사용자가 같은 provider로 가입되어 있으면 정상적으로 로그인한다.', async () => {
      const tx = {} as any;
      const existingUser = createMockUser({ provider: Provider.GOOGLE });

      userRepository.findByUnique.mockResolvedValue(existingUser);
      userRepository.findOrCreateSocialUser.mockResolvedValue({ user: existingUser, isNew: false });
      tokenRepository.updateOrCreateRefToken.mockResolvedValue(createMockToken());

      prismaService.$transaction.mockImplementation(async (cb) => {
        return await cb(tx);
      });

      const result = await service.socialLogin('Mozilla', mockSocialUserDto);

      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });

      expect(userRepository.findByUnique).toHaveBeenCalledWith('email', mockSocialUserDto.email, tx);
      expect(userRepository.findOrCreateSocialUser).toHaveBeenCalledWith(mockSocialUserDto, tx);
      expect(tokenRepository.updateOrCreateRefToken).toHaveBeenCalledWith(
        existingUser,
        mockTokens.refreshToken,
        'WEB',
        mockTokens.expiresAt,
        tx,
      );
    });

    it('최초 소셜 가입을 했을 경우 SlackWebhook 발송과 Default Profile을 생성한다.', async () => {
      const tx = {} as any;

      const mockDefaultProfileDto = {
        nickname: 'test-nick',
        comment: '소개를 작성해주세요',
        headerId: 1,
        bodyId: 2,
        headerColor: '#FFFFFF',
        bodyColor: '#000000',
      };

      jest.spyOn(profileFactory, 'buildDefaultProfile').mockReturnValue(mockDefaultProfileDto);

      userRepository.findByUnique.mockResolvedValue(null);
      userRepository.findOrCreateSocialUser.mockResolvedValue({ user: mockUser, isNew: true });
      tokenRepository.updateOrCreateRefToken.mockResolvedValue(createMockToken());
      profileRepository.createProfile.mockResolvedValue(undefined);
      slackService.sendMessage.mockResolvedValue(undefined);

      prismaService.$transaction.mockImplementation(async (cb) => {
        return await cb(tx);
      });

      const result = await service.socialLogin('Mozilla', mockSocialUserDto);

      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });

      // 프로필 생성 및 슬랙 호출 여부 확인
      expect(profileRepository.createProfile).toHaveBeenCalledWith(mockDefaultProfileDto, mockUser.id, tx);
      expect(slackService.sendMessage).toHaveBeenCalledWith(
        SERVICE_CHANNEL,
        `[소셜 가입] ${mockSocialUserDto.email} 유저가 회원가입 하였습니다 🎉`,
      );
    });

    it('예상치 못한 에러 발생 시 InternalServerErrorException을 발생시킨다.', async () => {
      prismaService.$transaction.mockRejectedValue(new Error('DB error'));

      await expect(service.socialLogin('Mozilla', mockSocialUserDto)).rejects.toThrow(InternalServerErrorException);
    });
  });
  describe('localLogin', () => {
    const mockCreateUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const mockUser = createMockUser({ provider: Provider.LOCAL });
    const mockTokens = {
      accessToken: 'access.token',
      refreshToken: 'refresh.token',
      expiresAt: new Date('2024-12-31'),
    };

    const tx = {};

    beforeEach(() => {
      prismaService.$transaction.mockImplementation(async (cb) => cb(tx as any));

      userRepository.findByUnique.mockResolvedValue(null);
      userRepository.findOrCreateLocalUser.mockResolvedValue({ user: mockUser, isNew: true });
      tokenRepository.updateOrCreateRefToken.mockResolvedValue(createMockToken());

      jest.spyOn(service as any, 'generatedTokens').mockResolvedValue(mockTokens);
    });

    it('새로운 로컬 사용자 로그인 시 토큰을 반환한다.', async () => {
      const result = await service.localLogin('Mozilla', mockCreateUserDto);

      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });

      expect(userRepository.findOrCreateLocalUser).toHaveBeenCalledWith(mockCreateUserDto, tx);
      expect(tokenRepository.updateOrCreateRefToken).toHaveBeenCalledWith(
        mockUser,
        mockTokens.refreshToken,
        'WEB',
        mockTokens.expiresAt,
        tx,
      );
      expect(logger.log).toHaveBeenCalledWith(`[로컬] ${mockCreateUserDto.email} 유저가 로그인 하였습니다 🎉`);
    });

    it('기존 사용자가 다른 provider로 가입되어 있으면 ConflictException을 발생시킨다.', async () => {
      const existingUser = createMockUser({ provider: Provider.GOOGLE });

      userRepository.findByUnique.mockResolvedValue(existingUser);

      await expect(service.localLogin('Mozilla', mockCreateUserDto)).rejects.toThrow(ConflictException);
    });

    it('최초 로컬 가입 시 슬랙 알림 및 디폴트 프로필을 생성한다.', async () => {
      const mockTx = {};
      const mockUser = createMockUser({ provider: Provider.LOCAL });
      const mockTokens = {
        accessToken: 'access.token',
        refreshToken: 'refresh.token',
        expiresAt: new Date('2024-12-31'),
      };

      const mockDefaultProfileDto = {
        nickname: 'test-nick',
        comment: '소개를 작성해주세요',
        headerId: 1,
        bodyId: 2,
        headerColor: '#FFFFFF',
        bodyColor: '#000000',
      };

      jest.spyOn(profileFactory, 'buildDefaultProfile').mockReturnValue(mockDefaultProfileDto);

      // Prisma 트랜잭션 mock
      prismaService.$transaction.mockImplementation(async (cb) => cb(mockTx as any));

      // 유저는 없고 -> 신규 가입
      userRepository.findByUnique.mockResolvedValue(null);
      userRepository.findOrCreateLocalUser.mockResolvedValue({ user: mockUser, isNew: true });

      // 토큰 생성 mock
      jest.spyOn(service as any, 'generatedTokens').mockResolvedValue(mockTokens);

      // 토큰 저장 mock
      tokenRepository.updateOrCreateRefToken.mockResolvedValue(createMockToken());

      // 프로필 생성 mock
      profileRepository.createProfile.mockResolvedValue({ id: 1 } as any);

      // SlackService mock
      slackService.sendMessage = jest.fn();

      const result = await service.localLogin('Mozilla', mockCreateUserDto);

      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });

      expect(slackService.sendMessage).toHaveBeenCalledWith(
        SERVICE_CHANNEL,
        `[로컬 가입] ${mockCreateUserDto.email} 유저가 회원가입 하였습니다 🎉`,
      );

      expect(profileRepository.createProfile).toHaveBeenCalledWith(mockDefaultProfileDto, mockUser.id, tx);

      expect(logger.log).toHaveBeenCalledWith(`[로컬] ${mockCreateUserDto.email} 유저가 로그인 하였습니다 🎉`);
    });
  });

  describe('rotateAccessToken', () => {
    const mockToken = 'Bearer valid.refresh.token';
    const mockAccessToken = { token: 'new.access.token', expiresAt: new Date() };

    beforeEach(() => {
      jest.spyOn(service, 'validateBearerToken').mockResolvedValue('valid.refresh.token');
      jest.spyOn(service, 'issueToken').mockResolvedValue(mockAccessToken);
    });

    it('유효한 refresh token으로 새로운 access token을 발급한다.', async () => {
      const mockUser = createMockUserWithTokens({
        tokens: [{ ...createMockToken(), refToken: 'valid.refresh.token' }],
      });
      userRepository.findAllRefToken.mockResolvedValue(mockUser);

      const result = await service.rotateAccessToken(1, mockToken);

      expect(result).toBe(mockAccessToken.token);
      expect(service.validateBearerToken).toHaveBeenCalledWith(mockToken);
      expect(userRepository.findAllRefToken).toHaveBeenCalledWith(1);
      expect(service.issueToken).toHaveBeenCalledWith(mockUser, false);
    });

    it('사용자를 찾을 수 없으면 NotFoundException을 발생시킨다.', async () => {
      userRepository.findAllRefToken.mockResolvedValue(null);

      await expect(service.rotateAccessToken(1, mockToken)).rejects.toThrow(NotFoundException);
    });

    it('유효하지 않은 refresh token이면 UnauthorizedException을 발생시킨다.', async () => {
      const userWithInvalidToken = createMockUserWithTokens({
        tokens: [{ ...createMockToken(), refToken: 'different.token' }],
      });
      userRepository.findAllRefToken.mockResolvedValue(userWithInvalidToken);

      await expect(service.rotateAccessToken(1, mockToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('issueToken', () => {
    const mockUser = createMockUser();

    beforeEach(() => {
      configService.get.mockImplementation((key: string) => {
        const config = {
          REFRESH_SECRET: 'refresh-secret',
          ACCESS_SECRET: 'access-secret',
          EXPOSE_REFRESH_TK: '7d',
          EXPOSE_ACCESS_TK: '1h',
        };
        return config[key];
      });

      jwtService.signAsync.mockResolvedValue('signed.token');
    });

    it('access token을 발급한다.', async () => {
      const result = await service.issueToken(mockUser, false);

      expect(result).toEqual({
        token: 'signed.token',
        expiresAt: new Date('2024-12-31'),
      });

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email, name: mockUser.name },
        {
          secret: 'access-secret',
          expiresIn: '1h',
        },
      );
    });

    it('refresh token을 발급한다.', async () => {
      const result = await service.issueToken(mockUser, true);

      expect(result).toEqual({
        token: 'signed.token',
        expiresAt: new Date('2024-12-31'),
      });

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: mockUser.id },
        {
          secret: 'refresh-secret',
          expiresIn: '7d',
        },
      );
    });
  });

  describe('parseBearerToken', () => {
    const mockPayload = { sub: 1, email: 'test@example.com', name: 'Test User' };

    beforeEach(() => {
      jest.spyOn(service, 'verifyAsyncToken').mockResolvedValue(mockPayload);
    });

    it('토큰을 파싱하여 payload를 반환한다.', async () => {
      const result = await service.parseBearerToken('valid.token', false);

      expect(result).toEqual(mockPayload);
      expect(service.verifyAsyncToken).toHaveBeenCalledWith('valid.token', false);
    });
  });

  describe('verifyAsyncToken', () => {
    beforeEach(() => {
      configService.get.mockImplementation((key: string) => {
        const config = {
          REFRESH_SECRET: 'refresh-secret',
          ACCESS_SECRET: 'access-secret',
        };
        return config[key];
      });
    });

    it('유효한 토큰을 검증한다.', async () => {
      const mockPayload = { sub: 1, email: 'test@example.com' };
      jwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await service.verifyAsyncToken('valid.token', false);

      expect(result).toEqual(mockPayload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid.token', {
        secret: 'access-secret',
      });
    });

    it('만료된 토큰에 대해 UnauthorizedException을 발생시킨다.', async () => {
      const expiredError = new Error('TokenExpiredError');
      expiredError.name = 'TokenExpiredError';
      jwtService.verifyAsync.mockRejectedValue(expiredError);

      await expect(service.verifyAsyncToken('expired.token', false)).rejects.toThrow(UnauthorizedException);
    });

    it('잘못된 서명의 토큰에 대해 UnauthorizedException을 발생시킨다.', async () => {
      const invalidSignatureError = new Error('JsonWebTokenError');
      invalidSignatureError.name = 'JsonWebTokenError';
      jwtService.verifyAsync.mockRejectedValue(invalidSignatureError);

      await expect(service.verifyAsyncToken('invalid.token', false)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('removeRefToken', () => {
    it('사용자의 모든 refresh token을 삭제한다.', async () => {
      await service.removeRefToken(1);

      expect(tokenRepository.deleteManyByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe('private methods', () => {
    describe('generatedTokens', () => {
      const mockUser = createMockUser();

      beforeEach(() => {
        jest.spyOn(service, 'issueToken').mockResolvedValue({
          token: 'test.token',
          expiresAt: new Date('2024-12-31'),
        });
      });

      it('access token과 refresh token을 생성한다.', async () => {
        const result = await (service as any).generatedTokens(mockUser);

        expect(result).toEqual({
          accessToken: 'test.token',
          refreshToken: 'test.token',
          expiresAt: new Date('2024-12-31'),
        });

        expect(service.issueToken).toHaveBeenCalledWith(mockUser, false);
        expect(service.issueToken).toHaveBeenCalledWith(mockUser, true);
      });
    });

    describe('createPayload', () => {
      const mockUser = createMockUser();

      it('refresh token용 payload를 생성한다.', async () => {
        const result = await (service as any).createPayload(mockUser, true);

        expect(result).toEqual({ sub: mockUser.id });
      });

      it('access token용 payload를 생성한다.', async () => {
        const result = await (service as any).createPayload(mockUser, false);

        expect(result).toEqual({
          sub: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        });
      });
    });

    describe('throwProviderConflictError', () => {
      it('Google provider 충돌 시 적절한 에러를 발생시킨다.', () => {
        expect(() => (service as any).throwProviderConflictError(Provider.GOOGLE)).toThrow(ConflictException);
      });

      it('Naver provider 충돌 시 적절한 에러를 발생시킨다.', () => {
        expect(() => (service as any).throwProviderConflictError(Provider.NAVER)).toThrow(ConflictException);
      });

      it('Apple provider 충돌 시 적절한 에러를 발생시킨다.', () => {
        expect(() => (service as any).throwProviderConflictError(Provider.APPLE)).toThrow(ConflictException);
      });

      it('Local provider 충돌 시 적절한 에러를 발생시킨다.', () => {
        expect(() => (service as any).throwProviderConflictError(Provider.LOCAL)).toThrow(ConflictException);
      });

      it('Kakao provider 충돌 시 적절한 에러를 발생시킨다.', () => {
        expect(() => (service as any).throwProviderConflictError(Provider.KAKAO)).toThrow(ConflictException);
      });
    });
  });
});
