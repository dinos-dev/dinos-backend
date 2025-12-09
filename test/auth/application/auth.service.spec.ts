import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import {
  INVITE_CODE_REPOSITORY,
  PROFILE_REPOSITORY,
  TOKEN_REPOSITORY,
  USER_REPOSITORY,
} from 'src/common/config/common.const';

import { AuthService } from 'src/auth/application/auth.service';
import { WinstonLoggerService } from 'src/infrastructure/logger/winston-logger.service';

import { ITokenRepository } from 'src/auth/domain/repository/token.repository.interface';
import { IUserRepository } from 'src/user/domain/repository/user.repository.interface';
import { IProfileRepository } from 'src/user/domain/repository/profile.repository.interface';
import { IInviteCodeRepository } from 'src/user/domain/repository/invite-code.repository.interface';

import {
  createMockTokenEntity,
  createMockUserEntity,
  createMockUserEntityWithTokens,
} from '../../__mocks__/user.factory';

import { Provider } from 'src/user/domain/const/provider.enum';
import { DateUtils } from 'src/common/utils/date-util';
import { detectPlatform } from 'src/auth/application/util/client.util';
import { mockDeep } from 'jest-mock-extended';

import * as profileFactory from 'src/user/application/helper/profile.factory';
import { SocialUserCommand } from 'src/auth/application/command/social-user.command';
import { LocalUserCommand } from 'src/auth/application/command/local-user.command';

// Mock external dependencies
jest.mock('src/auth/application/util/client.util');
jest.mock('src/common/utils/date-util');
jest.mock('@nestjs-cls/transactional', () => ({
  ...jest.requireActual('@nestjs-cls/transactional'),
  Transactional: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    return descriptor;
  },
}));

const mockDetectPlatform = detectPlatform as jest.MockedFunction<typeof detectPlatform>;
const mockDateUtils = DateUtils as jest.Mocked<typeof DateUtils>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<IUserRepository>;
  let tokenRepository: jest.Mocked<ITokenRepository>;
  let profileRepository: jest.Mocked<IProfileRepository>;
  let inviteCodeRepository: jest.Mocked<IInviteCodeRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let logger: jest.Mocked<WinstonLoggerService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    // Create mocks
    userRepository = mockDeep<IUserRepository>();
    tokenRepository = mockDeep<ITokenRepository>();
    profileRepository = mockDeep<IProfileRepository>();
    inviteCodeRepository = mockDeep<IInviteCodeRepository>();

    const mockTransactionHost = mockDeep<TransactionHost<TransactionalAdapterPrisma>>();

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
      warn: jest.fn(),
    } as any;

    eventEmitter = {
      emit: jest.fn(),
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
          provide: INVITE_CODE_REPOSITORY,
          useValue: inviteCodeRepository,
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
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
        {
          provide: TransactionHost,
          useValue: mockTransactionHost,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

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
    const mockCommand = new SocialUserCommand('test@example.com', 'Test User', Provider.GOOGLE, '1234567890');

    const mockUser = createMockUserEntity();
    const mockTokens = {
      accessToken: 'access.token',
      refreshToken: 'refresh.token',
      expiresAt: new Date('2025-10-15'),
    };

    beforeEach(() => {
      jest.spyOn(service as any, 'generatedTokens').mockResolvedValue(mockTokens);
    });

    it('새로운 소셜 사용자 로그인 시 토큰을 반환한다.', async () => {
      // given
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findOrCreateSocialUser.mockResolvedValue({ user: mockUser, isNew: true });
      tokenRepository.updateOrCreateRefToken.mockResolvedValue(createMockTokenEntity());
      profileRepository.createProfile.mockResolvedValue(undefined);
      inviteCodeRepository.isExistCode.mockResolvedValue(false);
      inviteCodeRepository.createInviteCode.mockResolvedValue(undefined);

      // when
      const result = await service.socialLogin('Mozilla', mockCommand);

      // then
      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });

      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockCommand.email);
      expect(userRepository.findOrCreateSocialUser).toHaveBeenCalled();
      expect(tokenRepository.updateOrCreateRefToken).toHaveBeenCalled();
      expect(profileRepository.createProfile).toHaveBeenCalled();
      expect(inviteCodeRepository.createInviteCode).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('user.registered', expect.any(Object));
      expect(logger.log).toHaveBeenCalledWith(`[소셜] ${mockCommand.email} 유저가 로그인 하였습니다 🎉`);
    });

    it('기존 사용자가 다른 provider로 가입되어 있으면 ConflictException을 발생시킨다.', async () => {
      // given
      const existingUser = createMockUserEntity({ provider: Provider.NAVER });
      userRepository.findByEmail.mockResolvedValue(existingUser);

      // when & then
      await expect(service.socialLogin('Mozilla', mockCommand)).rejects.toThrow(ConflictException);
      expect(userRepository.findOrCreateSocialUser).not.toHaveBeenCalled();
    });

    it('기존 사용자가 같은 provider로 가입되어 있으면 정상적으로 로그인한다.', async () => {
      // given
      const existingUser = createMockUserEntity({ provider: Provider.GOOGLE });
      userRepository.findByEmail.mockResolvedValue(existingUser);
      userRepository.findOrCreateSocialUser.mockResolvedValue({ user: existingUser, isNew: false });
      tokenRepository.updateOrCreateRefToken.mockResolvedValue(createMockTokenEntity());

      // when
      const result = await service.socialLogin('Mozilla', mockCommand);

      // then
      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });

      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockCommand.email);
      expect(userRepository.findOrCreateSocialUser).toHaveBeenCalled();
      expect(tokenRepository.updateOrCreateRefToken).toHaveBeenCalled();
      // 기존 유저는 프로필 생성 안함
      expect(profileRepository.createProfile).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('최초 소셜 가입 시 프로필과 초대코드를 생성하고 이벤트를 발행한다.', async () => {
      // given
      const mockDefaultProfile = {
        userId: 1,
        nickname: 'test-nick',
        comment: '소개를 작성해주세요',
        headerId: 1,
        bodyId: 2,
        headerColor: '#FFFFFF',
        bodyColor: '#000000',
      };

      jest.spyOn(profileFactory, 'buildDefaultProfile').mockReturnValue(mockDefaultProfile);

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findOrCreateSocialUser.mockResolvedValue({ user: mockUser, isNew: true });
      tokenRepository.updateOrCreateRefToken.mockResolvedValue(createMockTokenEntity());
      profileRepository.createProfile.mockResolvedValue(undefined);
      inviteCodeRepository.isExistCode.mockResolvedValue(false);
      inviteCodeRepository.createInviteCode.mockResolvedValue(undefined);

      // when
      const result = await service.socialLogin('Mozilla', mockCommand);

      // then
      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });

      expect(profileRepository.createProfile).toHaveBeenCalled();
      expect(inviteCodeRepository.isExistCode).toHaveBeenCalled();
      expect(inviteCodeRepository.createInviteCode).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.registered',
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
          registrationType: 'social',
        }),
      );
    });

    it('예상치 못한 에러 발생 시 InternalServerErrorException을 발생시킨다.', async () => {
      // given
      userRepository.findByEmail.mockRejectedValue(new Error('DB error'));

      // when & then
      await expect(service.socialLogin('Mozilla', mockCommand)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('localLogin', () => {
    const mockCommand = new LocalUserCommand('test@example.com', 'Test User', 'password123');

    const mockUser = createMockUserEntity({ provider: Provider.LOCAL });
    const mockTokens = {
      accessToken: 'access.token',
      refreshToken: 'refresh.token',
      expiresAt: new Date('2024-12-31'),
    };

    beforeEach(() => {
      jest.spyOn(service as any, 'generatedTokens').mockResolvedValue(mockTokens);
    });

    it('새로운 로컬 사용자 로그인 시 토큰을 반환한다.', async () => {
      // given
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findOrCreateLocalUser.mockResolvedValue({ user: mockUser, isNew: true });
      tokenRepository.updateOrCreateRefToken.mockResolvedValue(createMockTokenEntity());
      profileRepository.createProfile.mockResolvedValue(undefined);
      inviteCodeRepository.isExistCode.mockResolvedValue(false);
      inviteCodeRepository.createInviteCode.mockResolvedValue(undefined);

      // when
      const result = await service.localLogin('Mozilla', mockCommand);

      // then
      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });

      expect(userRepository.findByEmail).toHaveBeenCalledWith(mockCommand.email);
      expect(userRepository.findOrCreateLocalUser).toHaveBeenCalled();
      expect(tokenRepository.updateOrCreateRefToken).toHaveBeenCalled();
      expect(profileRepository.createProfile).toHaveBeenCalled();
      expect(inviteCodeRepository.createInviteCode).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('user.registered', expect.any(Object));
      expect(logger.log).toHaveBeenCalledWith(`[로컬] ${mockCommand.email} 유저가 로그인 하였습니다 🎉`);
    });

    it('기존 사용자가 다른 provider로 가입되어 있으면 ConflictException을 발생시킨다.', async () => {
      // given
      const existingUser = createMockUserEntity({ provider: Provider.GOOGLE });
      userRepository.findByEmail.mockResolvedValue(existingUser);

      // when & then
      await expect(service.localLogin('Mozilla', mockCommand)).rejects.toThrow(ConflictException);
      expect(userRepository.findOrCreateLocalUser).not.toHaveBeenCalled();
    });

    it('최초 로컬 가입 시 프로필과 초대코드를 생성하고 이벤트를 발행한다.', async () => {
      // given
      const mockDefaultProfile = {
        userId: 1,
        nickname: 'test-nick',
        comment: '소개를 작성해주세요',
        headerId: 1,
        bodyId: 2,
        headerColor: '#FFFFFF',
        bodyColor: '#000000',
      };

      jest.spyOn(profileFactory, 'buildDefaultProfile').mockReturnValue(mockDefaultProfile);

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.findOrCreateLocalUser.mockResolvedValue({ user: mockUser, isNew: true });
      tokenRepository.updateOrCreateRefToken.mockResolvedValue(createMockTokenEntity());
      profileRepository.createProfile.mockResolvedValue(undefined);
      inviteCodeRepository.isExistCode.mockResolvedValue(false);
      inviteCodeRepository.createInviteCode.mockResolvedValue(undefined);

      // when
      const result = await service.localLogin('Mozilla', mockCommand);

      // then
      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      });

      expect(profileRepository.createProfile).toHaveBeenCalled();
      expect(inviteCodeRepository.isExistCode).toHaveBeenCalled();
      expect(inviteCodeRepository.createInviteCode).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.registered',
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
          registrationType: 'local',
        }),
      );
      expect(logger.log).toHaveBeenCalledWith(`[로컬] ${mockCommand.email} 유저가 로그인 하였습니다 🎉`);
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
      // given
      const mockUserWithTokens = createMockUserEntityWithTokens({
        tokens: [{ refToken: 'valid.refresh.token' }],
      });
      userRepository.findAllRefToken.mockResolvedValue({
        user: mockUserWithTokens,
        tokens: mockUserWithTokens.tokens,
      });

      // when
      const result = await service.rotateAccessToken(1, mockToken);

      // then
      expect(result).toBe(mockAccessToken.token);
      expect(service.validateBearerToken).toHaveBeenCalledWith(mockToken);
      expect(userRepository.findAllRefToken).toHaveBeenCalledWith(1);
      expect(service.issueToken).toHaveBeenCalledWith(mockUserWithTokens, false);
    });

    it('사용자를 찾을 수 없으면 NotFoundException을 발생시킨다.', async () => {
      // given
      userRepository.findAllRefToken.mockResolvedValue({ user: null, tokens: [] });

      // when & then
      await expect(service.rotateAccessToken(1, mockToken)).rejects.toThrow(NotFoundException);
    });

    it('유효하지 않은 refresh token이면 UnauthorizedException을 발생시킨다.', async () => {
      // given
      const mockUserWithTokens = createMockUserEntityWithTokens({
        tokens: [{ refToken: 'different.token' }],
      });
      userRepository.findAllRefToken.mockResolvedValue({
        user: mockUserWithTokens,
        tokens: mockUserWithTokens.tokens,
      });

      // when & then
      await expect(service.rotateAccessToken(1, mockToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('issueToken', () => {
    const mockUser = createMockUserEntity();

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
      // when
      const result = await service.issueToken(mockUser, false);

      // then
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
      // when
      const result = await service.issueToken(mockUser, true);

      // then
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
      const mockUser = createMockUserEntity();

      beforeEach(() => {
        jest.spyOn(service, 'issueToken').mockResolvedValue({
          token: 'test.token',
          expiresAt: new Date('2024-12-31'),
        });
      });

      it('access token과 refresh token을 생성한다.', async () => {
        // when
        const result = await (service as any).generatedTokens(mockUser);

        // then
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
      const mockUser = createMockUserEntity();

      it('refresh token용 payload를 생성한다.', async () => {
        // when
        const result = await (service as any).createPayload(mockUser, true);

        // then
        expect(result).toEqual({ sub: mockUser.id });
      });

      it('access token용 payload를 생성한다.', async () => {
        // when
        const result = await (service as any).createPayload(mockUser, false);

        // then
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
