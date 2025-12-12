import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/auth/presentation/auth.controller';
import { AuthService } from 'src/auth/application/auth.service';
import { Request } from 'express';
import { CreateUserDto } from 'src/user/presentation/dto/request/create-user.dto';
import { Provider } from 'src/user/domain/const/provider.enum';
import { OAuthPayLoad } from 'src/auth/domain/interface/token-payload.interface';
import { LocalUserCommand } from 'src/auth/application/command/local-user.command';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockRequest = {
    get: jest.fn().mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
  } as any as Request;

  const mockOAuthPayload: OAuthPayLoad = {
    email: 'test@example.com',
    provider: Provider.GOOGLE,
    providerId: '1234567890',
    name: 'Test User',
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123',
    toCommand: () => new LocalUserCommand('test@example.com', 'Test User', 'password123'),
  } as CreateUserDto;

  const mockLoginResponse = {
    accessToken: 'access.token',
    refreshToken: 'refresh.token',
  };

  const mockRotateTokenResponse = {
    accessToken: 'new.access.token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            socialLogin: jest.fn(),
            localLogin: jest.fn(),
            rotateAccessToken: jest.fn(),
            removeRefToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('naverLogin', () => {
    it('네이버 소셜 로그인을 성공적으로 처리한다.', async () => {
      // given
      const mockPayload: OAuthPayLoad = {
        email: 'test@example.com',
        provider: Provider.NAVER,
        providerId: '1234567890',
        name: 'Test User',
      };
      authService.socialLogin.mockResolvedValue(mockLoginResponse);

      // when
      const result = await controller.naverLogin(mockRequest, mockPayload);

      // then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(201);
      expect(authService.socialLogin).toHaveBeenCalledWith(
        mockRequest.get('user-agent').toLowerCase(),
        expect.objectContaining({
          email: mockPayload.email,
          provider: mockPayload.provider,
          providerId: mockPayload.providerId,
          name: mockPayload.name,
        }),
      );
    });

    it('AuthService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // given
      const error = new Error('Service error');
      authService.socialLogin.mockRejectedValue(error);

      // when & then
      await expect(controller.naverLogin(mockRequest, mockOAuthPayload)).rejects.toThrow(error);
    });
  });

  describe('googleLogin', () => {
    it('구글 소셜 로그인을 성공적으로 처리한다.', async () => {
      // given
      authService.socialLogin.mockResolvedValue(mockLoginResponse);

      // when
      const result = await controller.googleLogin(mockRequest, mockOAuthPayload);

      // then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(201);
      expect(authService.socialLogin).toHaveBeenCalledWith(
        mockRequest.get('user-agent').toLowerCase(),
        expect.objectContaining({
          email: mockOAuthPayload.email,
          provider: mockOAuthPayload.provider,
          providerId: mockOAuthPayload.providerId,
          name: mockOAuthPayload.name,
        }),
      );
    });

    it('AuthService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // given
      const error = new Error('Service error');
      authService.socialLogin.mockRejectedValue(error);

      // when & then
      await expect(controller.googleLogin(mockRequest, mockOAuthPayload)).rejects.toThrow(error);
    });
  });

  describe('appleLogin', () => {
    it('애플 소셜 로그인을 성공적으로 처리한다.', async () => {
      // given
      const mockPayload: OAuthPayLoad = {
        email: 'test@example.com',
        provider: Provider.APPLE,
        providerId: '1234567890',
        name: 'Test User',
      };
      authService.socialLogin.mockResolvedValue(mockLoginResponse);

      // when
      const result = await controller.appleLogin(mockRequest, mockPayload);

      // then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(201);
      expect(authService.socialLogin).toHaveBeenCalledWith(
        mockRequest.get('user-agent').toLowerCase(),
        expect.objectContaining({
          email: mockPayload.email,
          provider: mockPayload.provider,
          providerId: mockPayload.providerId,
          name: mockPayload.name,
        }),
      );
    });

    it('AuthService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // given
      const error = new Error('Service error');
      authService.socialLogin.mockRejectedValue(error);

      // when & then
      await expect(controller.appleLogin(mockRequest, mockOAuthPayload)).rejects.toThrow(error);
    });
  });

  describe('localLogin', () => {
    it('로컬 로그인을 성공적으로 처리한다.', async () => {
      // given
      authService.localLogin.mockResolvedValue(mockLoginResponse);

      // when
      const result = await controller.localLogin(mockRequest, mockCreateUserDto);

      // then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(201);
      expect(authService.localLogin).toHaveBeenCalledWith(
        mockRequest.get('user-agent').toLowerCase(),
        expect.objectContaining({
          email: mockCreateUserDto.email,
          name: mockCreateUserDto.name,
          password: mockCreateUserDto.password,
        }),
      );
    });

    it('AuthService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // given
      const error = new Error('Service error');
      authService.localLogin.mockRejectedValue(error);

      // when & then
      await expect(controller.localLogin(mockRequest, mockCreateUserDto)).rejects.toThrow(error);
    });
  });

  describe('rotateAccessToken', () => {
    const mockUserId = 1;
    const mockToken = 'Bearer valid.refresh.token';

    it('액세스 토큰 재발급을 성공적으로 처리한다.', async () => {
      // given
      authService.rotateAccessToken.mockResolvedValue(mockRotateTokenResponse.accessToken);

      // when
      const result = await controller.rotateAccessToken(mockUserId, mockToken);

      // then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(201);
      expect(authService.rotateAccessToken).toHaveBeenCalledWith(mockUserId, mockToken);
    });

    it('AuthService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // given
      const error = new Error('Service error');
      authService.rotateAccessToken.mockRejectedValue(error);

      // when & then
      await expect(controller.rotateAccessToken(mockUserId, mockToken)).rejects.toThrow(error);
    });
  });

  describe('logOut', () => {
    const mockUserId = 1;

    it('로그아웃을 성공적으로 처리한다.', async () => {
      // given
      authService.removeRefToken.mockResolvedValue(1);

      // when
      const result = await controller.logOut(mockUserId);

      // then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(204);
      expect(authService.removeRefToken).toHaveBeenCalledWith(mockUserId);
    });

    it('AuthService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // given
      const error = new Error('Service error');
      authService.removeRefToken.mockRejectedValue(error);

      // when & then
      await expect(controller.logOut(mockUserId)).rejects.toThrow(error);
    });
  });

  describe('user-agent handling', () => {
    it('user-agent가 없는 경우에도 정상적으로 처리한다.', async () => {
      // given
      const requestWithoutUserAgent = {
        get: jest.fn().mockReturnValue(''),
      } as any as Request;
      authService.socialLogin.mockResolvedValue(mockLoginResponse);

      // when
      const result = await controller.googleLogin(requestWithoutUserAgent, mockOAuthPayload);

      // then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(201);
      expect(authService.socialLogin).toHaveBeenCalledWith(
        '',
        expect.objectContaining({
          email: mockOAuthPayload.email,
        }),
      );
    });
  });
});
