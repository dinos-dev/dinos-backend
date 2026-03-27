import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { KakaoStrategy } from 'src/auth/infrastructure/strategy/kakao.strategy';
import { Provider } from 'src/user/domain/const/provider.enum';

describe('KakaoStrategy', () => {
  let strategy: KakaoStrategy;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  const KAKAO_AUTH_URL = 'https://kapi.kakao.com/v2/user/me';

  beforeEach(() => {
    httpService = {
      get: jest.fn(),
    } as any;

    configService = {
      get: jest.fn().mockReturnValue(KAKAO_AUTH_URL),
    } as any;

    strategy = new KakaoStrategy(httpService, configService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    const mockKakaoResponse = {
      data: {
        id: 123456789,
        kakao_account: {
          email: 'kakao@example.com',
          profile: {
            nickname: '카카오사용자',
          },
        },
      },
    };

    it('유효한 토큰으로 OAuthPayLoad를 반환한다.', async () => {
      // given
      const req = { body: { token: 'valid_kakao_access_token' } };
      httpService.get.mockReturnValue(of(mockKakaoResponse) as any);

      // when
      const result = await strategy.validate(req);

      // then
      expect(result).toEqual({
        email: 'kakao@example.com',
        name: '카카오사용자',
        provider: Provider.KAKAO,
        providerId: '123456789',
      });
      expect(httpService.get).toHaveBeenCalledWith(KAKAO_AUTH_URL, {
        headers: { Authorization: 'Bearer valid_kakao_access_token' },
      });
    });

    it('providerId는 number → string으로 변환된다.', async () => {
      // given
      const req = { body: { token: 'valid_token' } };
      httpService.get.mockReturnValue(of(mockKakaoResponse) as any);

      // when
      const result = await strategy.validate(req);

      // then
      expect(result.providerId).toBe('123456789');
      expect(typeof result.providerId).toBe('string');
    });

    it('닉네임이 없으면 name을 null로 반환한다.', async () => {
      // given
      const req = { body: { token: 'valid_token' } };
      const responseWithoutNickname = {
        data: {
          id: 123456789,
          kakao_account: {
            email: 'kakao@example.com',
            profile: {},
          },
        },
      };
      httpService.get.mockReturnValue(of(responseWithoutNickname) as any);

      // when
      const result = await strategy.validate(req);

      // then
      expect(result.name).toBeNull();
    });

    it('토큰이 없으면 UnauthorizedException을 발생시킨다.', async () => {
      // given
      const req = { body: {} };

      // when & then
      await expect(strategy.validate(req)).rejects.toThrow(UnauthorizedException);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('이메일이 null이면 UnauthorizedException을 발생시킨다. (이메일 미동의 케이스)', async () => {
      // given
      const req = { body: { token: 'valid_token' } };
      const responseWithoutEmail = {
        data: {
          id: 123456789,
          kakao_account: {
            email: null,
            profile: { nickname: '카카오사용자' },
          },
        },
      };
      httpService.get.mockReturnValue(of(responseWithoutEmail) as any);

      // when & then
      await expect(strategy.validate(req)).rejects.toThrow(UnauthorizedException);
    });

    it('kakao_account 자체가 없으면 UnauthorizedException을 발생시킨다.', async () => {
      // given
      const req = { body: { token: 'valid_token' } };
      const responseWithoutKakaoAccount = {
        data: { id: 123456789 },
      };
      httpService.get.mockReturnValue(of(responseWithoutKakaoAccount) as any);

      // when & then
      await expect(strategy.validate(req)).rejects.toThrow(UnauthorizedException);
    });

    it('카카오 API 호출 실패 시 InternalServerErrorException을 발생시킨다.', async () => {
      // given
      const req = { body: { token: 'valid_token' } };
      httpService.get.mockReturnValue(throwError(() => new Error('Kakao API Error')) as any);

      // when & then
      await expect(strategy.validate(req)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
