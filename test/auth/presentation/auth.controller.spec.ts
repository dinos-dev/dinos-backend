import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/auth/presentation/auth.controller';
import { AuthService } from 'src/auth/application/auth.service';
import { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { SocialUserDto } from 'src/user/presentation/dto/request/social-user.dto';
import { CreateUserDto } from 'src/user/presentation/dto/request/create-user.dto';
import { Provider } from 'src/auth/domain/constant/provider.enum';
import { OAuthPayLoad } from 'src/auth/domain/interface/token-payload.interface';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { HttpResponse } from 'src/common/http/http-response';
import * as classTransformer from 'class-transformer';
import * as classValidator from 'class-validator';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockRequest = {
    get: jest.fn().mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
  } as any as Request;

  const mockSocialUserDto: SocialUserDto = {
    email: 'test@example.com',
    provider: Provider.GOOGLE,
    providerId: '1234567890',
    name: 'Test User',
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  };

  const mockOAuthPayload: OAuthPayLoad = {
    email: 'test@example.com',
    provider: Provider.GOOGLE,
    providerId: '1234567890',
    name: 'Test User',
  };

  const mockLoginResponse = {
    accessToken: 'access.token',
    refreshToken: 'refresh.token',
  };

  const mockRotateTokenResponse = {
    accessToken: 'new.access.token',
  };

  let plainToClassSpy: jest.SpyInstance;
  let validateSpy: jest.SpyInstance;

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

    // Setup default mocks
    plainToClassSpy = jest.spyOn(classTransformer, 'plainToClass').mockReturnValue(mockSocialUserDto as any);
    validateSpy = jest.spyOn(classValidator, 'validate').mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('naverLogin', () => {
    it('네이버 소셜 로그인을 성공적으로 처리한다.', async () => {
      // 1. given
      authService.socialLogin.mockResolvedValue(mockLoginResponse);

      // 2. when
      const result = await controller.naverLogin(mockRequest, mockOAuthPayload);

      // 3. then
      expect(result).toEqual(HttpResponse.created(mockLoginResponse));
      expect(plainToClassSpy).toHaveBeenCalledWith(SocialUserDto, mockOAuthPayload);
      expect(validateSpy).toHaveBeenCalledWith(mockSocialUserDto);
      expect(authService.socialLogin).toHaveBeenCalledWith(
        mockRequest.get('user-agent').toLowerCase(),
        mockSocialUserDto,
      );
    });

    it('유효하지 않은 OAuth payload에 대해 UnauthorizedException을 발생시킨다.', async () => {
      // 1. given
      const invalidOAuthPayload = {
        ...mockOAuthPayload,
        email: '', // 유효하지 않은 이메일
      };

      validateSpy.mockResolvedValueOnce([
        { property: 'email', constraints: { isEmail: '올바른 이메일 형식이 아닙니다.' } },
      ]);

      // 2. when & 3. then
      await expect(controller.naverLogin(mockRequest, invalidOAuthPayload)).rejects.toThrow(UnauthorizedException);
      expect(authService.socialLogin).not.toHaveBeenCalled();
    });
  });

  describe('googleLogin', () => {
    it('구글 소셜 로그인을 성공적으로 처리한다.', async () => {
      // 1. given
      authService.socialLogin.mockResolvedValue(mockLoginResponse);

      // 2. when
      const result = await controller.googleLogin(mockRequest, mockOAuthPayload);

      // 3. then
      expect(result).toEqual(HttpResponse.created(mockLoginResponse));
      expect(plainToClassSpy).toHaveBeenCalledWith(SocialUserDto, mockOAuthPayload);
      expect(validateSpy).toHaveBeenCalledWith(mockSocialUserDto);
      expect(authService.socialLogin).toHaveBeenCalledWith(
        mockRequest.get('user-agent').toLowerCase(),
        mockSocialUserDto,
      );
    });

    it('유효하지 않은 OAuth payload에 대해 UnauthorizedException을 발생시킨다.', async () => {
      // 1. given
      const invalidOAuthPayload = {
        ...mockOAuthPayload,
        providerId: '', // 유효하지 않은 providerId
      };

      validateSpy.mockResolvedValueOnce([
        { property: 'providerId', constraints: { isNotEmpty: 'providerId는 필수입니다.' } },
      ]);

      // 2. when & 3. then
      await expect(controller.googleLogin(mockRequest, invalidOAuthPayload)).rejects.toThrow(UnauthorizedException);
      expect(authService.socialLogin).not.toHaveBeenCalled();
    });
  });

  describe('appleLogin', () => {
    it('애플 소셜 로그인을 성공적으로 처리한다.', async () => {
      // 1. given
      authService.socialLogin.mockResolvedValue(mockLoginResponse);

      // 2. when
      const result = await controller.appleLogin(mockRequest, mockOAuthPayload);

      // 3. then
      expect(result).toEqual(HttpResponse.created(mockLoginResponse));
      expect(plainToClassSpy).toHaveBeenCalledWith(SocialUserDto, mockOAuthPayload);
      expect(validateSpy).toHaveBeenCalledWith(mockSocialUserDto);
      expect(authService.socialLogin).toHaveBeenCalledWith(
        mockRequest.get('user-agent').toLowerCase(),
        mockSocialUserDto,
      );
    });

    it('유효하지 않은 OAuth payload에 대해 UnauthorizedException을 발생시킨다.', async () => {
      // 1. given
      const invalidOAuthPayload = {
        ...mockOAuthPayload,
        name: undefined, // 유효하지 않은 name
      };

      validateSpy.mockResolvedValueOnce([
        { property: 'name', constraints: { isString: 'name은 문자열이어야 합니다.' } },
      ]);

      // 2. when & 3. then
      await expect(controller.appleLogin(mockRequest, invalidOAuthPayload)).rejects.toThrow(UnauthorizedException);
      expect(authService.socialLogin).not.toHaveBeenCalled();
    });
  });

  describe('localLogin', () => {
    it('로컬 로그인을 성공적으로 처리한다.', async () => {
      // 1. given
      authService.localLogin.mockResolvedValue(mockLoginResponse);

      // 2. when
      const result = await controller.localLogin(mockRequest, mockCreateUserDto);

      // 3. then
      expect(result).toEqual(HttpResponse.created(mockLoginResponse));
      expect(authService.localLogin).toHaveBeenCalledWith(
        mockRequest.get('user-agent').toLowerCase(),
        mockCreateUserDto,
      );
    });

    it('유효하지 않은 CreateUserDto에 대해 에러를 발생시킨다.', async () => {
      // 1. given
      const invalidCreateUserDto = {
        ...mockCreateUserDto,
        email: 'invalid-email', // 유효하지 않은 이메일
      };

      authService.localLogin.mockRejectedValue(new Error('Validation failed'));

      // 2. when & 3. then
      await expect(controller.localLogin(mockRequest, invalidCreateUserDto)).rejects.toThrow(Error);
    });
  });

  describe('rotateAccessToken', () => {
    const mockUserId = 1;
    const mockToken = 'Bearer valid.refresh.token';

    it('액세스 토큰 재발급을 성공적으로 처리한다.', async () => {
      // 1. given
      authService.rotateAccessToken.mockResolvedValue(mockRotateTokenResponse.accessToken);

      // 2. when
      const result = await controller.rotateAccessToken(mockUserId, mockToken);

      // 3. then
      expect(result).toEqual(HttpResponse.created(mockRotateTokenResponse));
      expect(authService.rotateAccessToken).toHaveBeenCalledWith(mockUserId, mockToken);
    });

    it('유효하지 않은 토큰에 대해 에러를 발생시킨다.', async () => {
      // 1. given
      authService.rotateAccessToken.mockRejectedValue(new UnauthorizedException(HttpErrorConstants.INVALID_TOKEN));

      // 2. when & 3. then
      await expect(controller.rotateAccessToken(mockUserId, 'invalid.token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logOut', () => {
    const mockUserId = 1;

    it('로그아웃을 성공적으로 처리한다.', async () => {
      // 1. given
      authService.removeRefToken.mockResolvedValue({ count: 1 } as any);

      // 2. when
      const result = await controller.logOut(mockUserId);

      // 3. then
      expect(result).toEqual(HttpResponse.noContent());
      expect(authService.removeRefToken).toHaveBeenCalledWith(mockUserId);
    });

    it('로그아웃 중 에러가 발생하면 에러를 전파한다.', async () => {
      // 1. given
      const error = new Error('Database error');
      authService.removeRefToken.mockRejectedValue(error);

      // 2. when & 3. then
      await expect(controller.logOut(mockUserId)).rejects.toThrow(Error);
    });
  });

  describe('validation scenarios', () => {
    it('OAuth payload에서 필수 필드가 누락된 경우 UnauthorizedException을 발생시킨다.', async () => {
      // 1. given
      const invalidOAuthPayload = {
        email: 'test@example.com',
        // provider와 providerId가 누락됨
      } as any;

      validateSpy.mockResolvedValueOnce([
        { property: 'provider', constraints: { isEnum: 'provider는 필수입니다.' } },
        { property: 'providerId', constraints: { isNotEmpty: 'providerId는 필수입니다.' } },
      ]);

      // 2. when & 3. then
      await expect(controller.googleLogin(mockRequest, invalidOAuthPayload)).rejects.toThrow(UnauthorizedException);
    });

    it('CreateUserDto에서 필수 필드가 누락된 경우 에러를 발생시킨다.', async () => {
      // 1. given
      const invalidCreateUserDto = {
        email: 'test@example.com',
        // password와 name이 누락됨
      } as any;

      authService.localLogin.mockRejectedValue(new Error('Validation failed'));

      // 2. when & 3. then
      await expect(controller.localLogin(mockRequest, invalidCreateUserDto)).rejects.toThrow(Error);
    });
  });

  describe('user-agent handling', () => {
    it('user-agent가 없는 경우에도 정상적으로 처리한다.', async () => {
      // 1. given
      const requestWithoutUserAgent = {
        get: jest.fn().mockReturnValue(''),
      } as any as Request;

      authService.socialLogin.mockResolvedValue(mockLoginResponse);

      // 2. when
      const result = await controller.googleLogin(requestWithoutUserAgent, mockOAuthPayload);

      // 3. then
      expect(result).toEqual(HttpResponse.created(mockLoginResponse));
      expect(authService.socialLogin).toHaveBeenCalledWith('', mockSocialUserDto);
    });

    it('user-agent가 빈 문자열인 경우에도 정상적으로 처리한다.', async () => {
      // 1. given
      const requestWithEmptyUserAgent = {
        get: jest.fn().mockReturnValue(''),
      } as any as Request;

      authService.socialLogin.mockResolvedValue(mockLoginResponse);

      // 2. when
      const result = await controller.googleLogin(requestWithEmptyUserAgent, mockOAuthPayload);

      // 3. then
      expect(result).toEqual(HttpResponse.created(mockLoginResponse));
      expect(authService.socialLogin).toHaveBeenCalledWith('', mockSocialUserDto);
    });
  });

  describe('error handling', () => {
    it('AuthService에서 ConflictException이 발생하면 그대로 전파한다.', async () => {
      // 1. given
      const conflictError = new Error('Conflict');
      conflictError.name = 'ConflictException';
      authService.socialLogin.mockRejectedValue(conflictError);

      // 2. when & 3. then
      await expect(controller.googleLogin(mockRequest, mockOAuthPayload)).rejects.toThrow(Error);
    });

    it('AuthService에서 InternalServerErrorException이 발생하면 그대로 전파한다.', async () => {
      // 1. given
      const internalError = new Error('Internal Server Error');
      internalError.name = 'InternalServerErrorException';
      authService.localLogin.mockRejectedValue(internalError);

      // 2. when & 3. then
      await expect(controller.localLogin(mockRequest, mockCreateUserDto)).rejects.toThrow(Error);
    });
  });
});
