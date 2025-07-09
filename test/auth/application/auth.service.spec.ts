// import { Test, TestingModule } from '@nestjs/testing';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';
// import {
//   ConflictException,
//   InternalServerErrorException,
//   NotFoundException,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { TOKEN_REPOSITORY, USER_REPOSITORY } from 'src/core/config/common.const';
// import { AuthService } from 'src/domain/auth/auth.service';
// import { ITokenRepository } from 'src/domain/auth/interface/token.repository.interface';
// import { IUserRepository } from 'src/domain/user/interface/user.repository.interface';
// import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
// import { mockPrismaService, MockPrismaService } from '../__mocks__/prisma.service.mock';
// import { SocialUserDto } from 'src/domain/user/dto/request/social-user.dto';
// import { CreateUserDto } from 'src/domain/user/dto/request/create-user.dto';
// import { Provider } from 'src/domain/auth/constant/provider.enum';
// import { createMockUser, createMockUserWithTokens } from '../user/user.factory';
// import { createMockToken } from './token.factory';
// import { WinstonLoggerService } from 'src/core/logger/winston-logger.service';
// import { detectPlatform } from 'src/domain/auth/util/client.util';
// import { DateUtils } from 'src/core/utils/date-util';

// // Mock external dependencies
// jest.mock('src/domain/auth/util/client.util');
// jest.mock('src/core/utils/date-util');

// const mockDetectPlatform = detectPlatform as jest.MockedFunction<typeof detectPlatform>;
// const mockDateUtils = DateUtils as jest.Mocked<typeof DateUtils>;

// describe('AuthService', () => {
//   let service: AuthService;
//   let userRepository: jest.Mocked<IUserRepository>;
//   let tokenRepository: jest.Mocked<ITokenRepository>;
//   let prismaService: MockPrismaService;
//   let jwtService: jest.Mocked<JwtService>;
//   let configService: jest.Mocked<ConfigService>;
//   let logger: jest.Mocked<WinstonLoggerService>;

//   beforeEach(async () => {
//     // Mock implementations
//     userRepository = {
//       findOrCreateSocialUser: jest.fn(),
//       findOrCreateLocalUser: jest.fn(),
//       findAllRefToken: jest.fn(),
//     } as any;

//     tokenRepository = {
//       updateOrCreateRefToken: jest.fn(),
//     } as any;

//     jwtService = {
//       signAsync: jest.fn(),
//       verifyAsync: jest.fn(),
//     } as any;

//     configService = {
//       get: jest.fn(),
//     } as any;

//     logger = {
//       log: jest.fn(),
//       error: jest.fn(),
//     } as any;

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthService,
//         {
//           provide: USER_REPOSITORY,
//           useValue: userRepository,
//         },
//         {
//           provide: TOKEN_REPOSITORY,
//           useValue: tokenRepository,
//         },
//         {
//           provide: PrismaService,
//           useValue: mockPrismaService(),
//         },
//         {
//           provide: JwtService,
//           useValue: jwtService,
//         },
//         {
//           provide: ConfigService,
//           useValue: configService,
//         },
//         {
//           provide: WinstonLoggerService,
//           useValue: logger,
//         },
//       ],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//     prismaService = module.get<MockPrismaService>(PrismaService);

//     // Setup default mocks
//     mockDetectPlatform.mockResolvedValue('WEB' as any);
//     mockDateUtils.calculateExpiresAt.mockReturnValue(new Date('2024-12-31'));
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('validateBearerToken', () => {
//     it('Bearer 토큰 형식이 올바르면 토큰을 반환한다.', async () => {
//       const token = await service.validateBearerToken('Bearer mock.token.value');
//       expect(token).toBe('mock.token.value');
//     });

//     it('토큰 형식이 올바르지 않으면 UnauthorizedException 예외를 발생시킨다.', async () => {
//       await expect(service.validateBearerToken('InvalidFormatToken')).rejects.toThrow(UnauthorizedException);
//     });

//     it('Bearer가 아닌 다른 스키마를 사용하면 UnauthorizedException 예외를 발생시킨다.', async () => {
//       await expect(service.validateBearerToken('Basic mock.token')).rejects.toThrow(UnauthorizedException);
//     });

//     it('토큰이 없으면 UnauthorizedException 예외를 발생시킨다.', async () => {
//       await expect(service.validateBearerToken('Bearer')).rejects.toThrow(UnauthorizedException);
//     });
//   });

//   describe('socialLogin', () => {
//     const mockSocialUserDto: SocialUserDto = {
//       email: 'test@example.com',
//       provider: Provider.GOOGLE,
//       providerId: '1234567890',
//       name: 'Test User',
//     };

//     const mockUser = createMockUser();
//     const mockTokens = {
//       accessToken: 'access.token',
//       refreshToken: 'refresh.token',
//       expiresAt: new Date('2024-12-31'),
//     };

//     beforeEach(() => {
//       // Setup default transaction mock
//       prismaService.$transaction.mockImplementation(async (cb) =>
//         cb({
//           user: { findUnique: jest.fn().mockResolvedValue(null) },
//         } as any),
//       );

//       // Setup default service mocks
//       jest.spyOn(service as any, 'generatedTokens').mockResolvedValue(mockTokens);
//       userRepository.findOrCreateSocialUser.mockResolvedValue(mockUser);
//       tokenRepository.updateOrCreateRefToken.mockResolvedValue(createMockToken());
//     });

//     it('새로운 소셜 사용자 로그인 시 토큰을 반환한다.', async () => {
//       const result = await service.socialLogin('Mozilla', mockSocialUserDto);

//       expect(result).toEqual({
//         accessToken: mockTokens.accessToken,
//         refreshToken: mockTokens.refreshToken,
//       });

//       expect(userRepository.findOrCreateSocialUser).toHaveBeenCalledWith(mockSocialUserDto);
//       expect(tokenRepository.updateOrCreateRefToken).toHaveBeenCalledWith(
//         mockUser,
//         mockTokens.refreshToken,
//         'WEB',
//         mockTokens.expiresAt,
//       );
//       expect(logger.log).toHaveBeenCalledWith(
//         `[소셜 로그인 & 가입]${mockSocialUserDto.email} 유저가 회원가입 or 로그인을 완료했습니다 🎉`,
//       );
//     });

//     it('기존 사용자가 다른 provider로 가입되어 있으면 ConflictException을 발생시킨다.', async () => {
//       const existingUser = createMockUser({ provider: Provider.NAVER });

//       prismaService.$transaction.mockImplementation(async (cb) =>
//         cb({
//           user: { findUnique: jest.fn().mockResolvedValue(existingUser) },
//         } as any),
//       );

//       await expect(service.socialLogin('Mozilla', mockSocialUserDto)).rejects.toThrow(ConflictException);
//     });

//     it('기존 사용자가 같은 provider로 가입되어 있으면 정상적으로 로그인한다.', async () => {
//       const existingUser = createMockUser({ provider: Provider.GOOGLE });

//       prismaService.$transaction.mockImplementation(async (cb) =>
//         cb({
//           user: { findUnique: jest.fn().mockResolvedValue(existingUser) },
//         } as any),
//       );

//       const result = await service.socialLogin('Mozilla', mockSocialUserDto);

//       expect(result).toEqual({
//         accessToken: mockTokens.accessToken,
//         refreshToken: mockTokens.refreshToken,
//       });
//     });

//     it('예상치 못한 에러 발생 시 InternalServerErrorException을 발생시킨다.', async () => {
//       prismaService.$transaction.mockRejectedValue(new Error('Database error'));

//       await expect(service.socialLogin('Mozilla', mockSocialUserDto)).rejects.toThrow(InternalServerErrorException);
//     });
//   });

//   describe('localLogin', () => {
//     const mockCreateUserDto: CreateUserDto = {
//       email: 'test@example.com',
//       password: 'password123',
//       name: 'Test User',
//     };

//     const mockUser = createMockUser({ provider: Provider.LOCAL });
//     const mockTokens = {
//       accessToken: 'access.token',
//       refreshToken: 'refresh.token',
//       expiresAt: new Date('2024-12-31'),
//     };

//     beforeEach(() => {
//       prismaService.$transaction.mockImplementation(async (cb) =>
//         cb({
//           user: { findUnique: jest.fn().mockResolvedValue(null) },
//         } as any),
//       );

//       jest.spyOn(service as any, 'generatedTokens').mockResolvedValue(mockTokens);
//       userRepository.findOrCreateLocalUser.mockResolvedValue(mockUser);
//       tokenRepository.updateOrCreateRefToken.mockResolvedValue(createMockToken());
//     });

//     it('새로운 로컬 사용자 로그인 시 토큰을 반환한다.', async () => {
//       const result = await service.localLogin('Mozilla', mockCreateUserDto);

//       expect(result).toEqual({
//         accessToken: mockTokens.accessToken,
//         refreshToken: mockTokens.refreshToken,
//       });

//       expect(userRepository.findOrCreateLocalUser).toHaveBeenCalledWith(mockCreateUserDto);
//       expect(tokenRepository.updateOrCreateRefToken).toHaveBeenCalledWith(
//         mockUser,
//         mockTokens.refreshToken,
//         'WEB',
//         mockTokens.expiresAt,
//       );
//       expect(logger.log).toHaveBeenCalledWith(
//         `[로컬 로그인 & 가입]${mockCreateUserDto.email} 유저가 회원가입 or 로그인을 완료했습니다 🎉`,
//       );
//     });

//     it('기존 사용자가 다른 provider로 가입되어 있으면 ConflictException을 발생시킨다.', async () => {
//       const existingUser = createMockUser({ provider: Provider.GOOGLE });

//       prismaService.$transaction.mockImplementation(async (cb) =>
//         cb({
//           user: { findUnique: jest.fn().mockResolvedValue(existingUser) },
//         } as any),
//       );

//       await expect(service.localLogin('Mozilla', mockCreateUserDto)).rejects.toThrow(ConflictException);
//     });
//   });

//   describe('rotateAccessToken', () => {
//     const mockToken = 'Bearer valid.refresh.token';
//     const mockAccessToken = { token: 'new.access.token', expiresAt: new Date() };

//     beforeEach(() => {
//       jest.spyOn(service, 'validateBearerToken').mockResolvedValue('valid.refresh.token');
//       jest.spyOn(service, 'issueToken').mockResolvedValue(mockAccessToken);
//     });

//     it('유효한 refresh token으로 새로운 access token을 발급한다.', async () => {
//       const mockUser = createMockUserWithTokens({
//         tokens: [{ ...createMockToken(), refToken: 'valid.refresh.token' }],
//       });
//       userRepository.findAllRefToken.mockResolvedValue(mockUser);

//       const result = await service.rotateAccessToken(1, mockToken);

//       expect(result).toBe(mockAccessToken.token);
//       expect(service.validateBearerToken).toHaveBeenCalledWith(mockToken);
//       expect(userRepository.findAllRefToken).toHaveBeenCalledWith(1);
//       expect(service.issueToken).toHaveBeenCalledWith(mockUser, false);
//     });

//     it('사용자를 찾을 수 없으면 NotFoundException을 발생시킨다.', async () => {
//       userRepository.findAllRefToken.mockResolvedValue(null);

//       await expect(service.rotateAccessToken(1, mockToken)).rejects.toThrow(NotFoundException);
//     });

//     it('유효하지 않은 refresh token이면 UnauthorizedException을 발생시킨다.', async () => {
//       const userWithInvalidToken = createMockUserWithTokens({
//         tokens: [{ ...createMockToken(), refToken: 'different.token' }],
//       });
//       userRepository.findAllRefToken.mockResolvedValue(userWithInvalidToken);

//       await expect(service.rotateAccessToken(1, mockToken)).rejects.toThrow(UnauthorizedException);
//     });
//   });

//   describe('issueToken', () => {
//     const mockUser = createMockUser();

//     beforeEach(() => {
//       configService.get.mockImplementation((key: string) => {
//         const config = {
//           REFRESH_SECRET: 'refresh-secret',
//           ACCESS_SECRET: 'access-secret',
//           EXPOSE_REFRESH_TK: '7d',
//           EXPOSE_ACCESS_TK: '1h',
//         };
//         return config[key];
//       });

//       jwtService.signAsync.mockResolvedValue('signed.token');
//     });

//     it('access token을 발급한다.', async () => {
//       const result = await service.issueToken(mockUser, false);

//       expect(result).toEqual({
//         token: 'signed.token',
//         expiresAt: new Date('2024-12-31'),
//       });

//       expect(jwtService.signAsync).toHaveBeenCalledWith(
//         { sub: mockUser.id, email: mockUser.email, name: mockUser.name },
//         {
//           secret: 'access-secret',
//           expiresIn: '1h',
//         },
//       );
//     });

//     it('refresh token을 발급한다.', async () => {
//       const result = await service.issueToken(mockUser, true);

//       expect(result).toEqual({
//         token: 'signed.token',
//         expiresAt: new Date('2024-12-31'),
//       });

//       expect(jwtService.signAsync).toHaveBeenCalledWith(
//         { sub: mockUser.id },
//         {
//           secret: 'refresh-secret',
//           expiresIn: '7d',
//         },
//       );
//     });
//   });

//   describe('parseBearerToken', () => {
//     const mockPayload = { sub: 1, email: 'test@example.com', name: 'Test User' };

//     beforeEach(() => {
//       jest.spyOn(service, 'verifyAsyncToken').mockResolvedValue(mockPayload);
//     });

//     it('토큰을 파싱하여 payload를 반환한다.', async () => {
//       const result = await service.parseBearerToken('valid.token', false);

//       expect(result).toEqual(mockPayload);
//       expect(service.verifyAsyncToken).toHaveBeenCalledWith('valid.token', false);
//     });
//   });

//   describe('verifyAsyncToken', () => {
//     beforeEach(() => {
//       configService.get.mockImplementation((key: string) => {
//         const config = {
//           REFRESH_SECRET: 'refresh-secret',
//           ACCESS_SECRET: 'access-secret',
//         };
//         return config[key];
//       });
//     });

//     it('유효한 토큰을 검증한다.', async () => {
//       const mockPayload = { sub: 1, email: 'test@example.com' };
//       jwtService.verifyAsync.mockResolvedValue(mockPayload);

//       const result = await service.verifyAsyncToken('valid.token', false);

//       expect(result).toEqual(mockPayload);
//       expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid.token', {
//         secret: 'access-secret',
//       });
//     });

//     it('만료된 토큰에 대해 UnauthorizedException을 발생시킨다.', async () => {
//       const expiredError = new Error('TokenExpiredError');
//       expiredError.name = 'TokenExpiredError';
//       jwtService.verifyAsync.mockRejectedValue(expiredError);

//       await expect(service.verifyAsyncToken('expired.token', false)).rejects.toThrow(UnauthorizedException);
//     });

//     it('잘못된 서명의 토큰에 대해 UnauthorizedException을 발생시킨다.', async () => {
//       const invalidSignatureError = new Error('JsonWebTokenError');
//       invalidSignatureError.name = 'JsonWebTokenError';
//       jwtService.verifyAsync.mockRejectedValue(invalidSignatureError);

//       await expect(service.verifyAsyncToken('invalid.token', false)).rejects.toThrow(UnauthorizedException);
//     });
//   });

//   describe('removeRefToken', () => {
//     it('사용자의 모든 refresh token을 삭제한다.', async () => {
//       await service.removeRefToken(1);

//       expect(prismaService.token.deleteMany).toHaveBeenCalledWith({
//         where: { userId: 1 },
//       });
//     });
//   });

//   describe('private methods', () => {
//     describe('generatedTokens', () => {
//       const mockUser = createMockUser();

//       beforeEach(() => {
//         jest.spyOn(service, 'issueToken').mockResolvedValue({
//           token: 'test.token',
//           expiresAt: new Date('2024-12-31'),
//         });
//       });

//       it('access token과 refresh token을 생성한다.', async () => {
//         const result = await (service as any).generatedTokens(mockUser);

//         expect(result).toEqual({
//           accessToken: 'test.token',
//           refreshToken: 'test.token',
//           expiresAt: new Date('2024-12-31'),
//         });

//         expect(service.issueToken).toHaveBeenCalledWith(mockUser, false);
//         expect(service.issueToken).toHaveBeenCalledWith(mockUser, true);
//       });
//     });

//     describe('createPayload', () => {
//       const mockUser = createMockUser();

//       it('refresh token용 payload를 생성한다.', async () => {
//         const result = await (service as any).createPayload(mockUser, true);

//         expect(result).toEqual({ sub: mockUser.id });
//       });

//       it('access token용 payload를 생성한다.', async () => {
//         const result = await (service as any).createPayload(mockUser, false);

//         expect(result).toEqual({
//           sub: mockUser.id,
//           email: mockUser.email,
//           name: mockUser.name,
//         });
//       });
//     });

//     describe('throwProviderConflictError', () => {
//       it('Google provider 충돌 시 적절한 에러를 발생시킨다.', () => {
//         expect(() => (service as any).throwProviderConflictError(Provider.GOOGLE)).toThrow(ConflictException);
//       });

//       it('Naver provider 충돌 시 적절한 에러를 발생시킨다.', () => {
//         expect(() => (service as any).throwProviderConflictError(Provider.NAVER)).toThrow(ConflictException);
//       });

//       it('Apple provider 충돌 시 적절한 에러를 발생시킨다.', () => {
//         expect(() => (service as any).throwProviderConflictError(Provider.APPLE)).toThrow(ConflictException);
//       });

//       it('Local provider 충돌 시 적절한 에러를 발생시킨다.', () => {
//         expect(() => (service as any).throwProviderConflictError(Provider.LOCAL)).toThrow(ConflictException);
//       });

//       it('Kakao provider 충돌 시 적절한 에러를 발생시킨다.', () => {
//         expect(() => (service as any).throwProviderConflictError(Provider.KAKAO)).toThrow(ConflictException);
//       });
//     });
//   });
// });
