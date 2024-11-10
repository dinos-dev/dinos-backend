import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from './dtos/login-user.dto';
import { detectPlatform } from './utils/client.util';
import { UserRepository } from 'src/domains/user/repositories/user.repository';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { validatedPassword } from 'src/core/utils/password.utils';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ENV_CONFIG } from 'src/common/const/env-keys.const';
import { User } from 'src/domains/user/entities/user.entity';
import { AuthTokenType } from './consts/token-type.const';
import { SocialLoginDto } from './dtos/social-login.dto';
import { SocialAuthService } from '../social-auth/social-auth.service';
import { SocialUserType } from './consts/social-type.const';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly socialAuthService: SocialAuthService,
  ) {}

  /**
   * AT 재발급
   * @param rawToken
   * @return accessToken
   * */
  async parseBearerToken(rawToken: string) {
    // -> 추후 모두 Guard로 추출
    const tokenSplit = rawToken.split(' ');

    // 토큰 포맷 에러
    if (tokenSplit.length !== 2) {
      throw new BadRequestException(HttpErrorConstants.INVALID_TOKEN);
    }

    const [bearer, token] = tokenSplit;

    // bearer 타입이 아닐경우 핸들링
    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException(HttpErrorConstants.INVALID_BEARER_TOKEN);
    }

    // token 검증 및 payload 조회
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>(ENV_CONFIG.AUTH.REFRESH_SECRET),
    });

    // 토큰 타입이 REFESH가 아닌경우 핸들링
    if (payload.type !== AuthTokenType.REFRESH_TOKEN) {
      throw new UnauthorizedException(HttpErrorConstants.INVALID_TOKEN);
    }
    // 추후 인 메모리 기반 RT 값을 저장시키고 비교할 경우, 별도로 아래 로직추가.

    return payload;
  }

  /**
   * 로그인시 유저의 이메일과 패스워드 검증
   * @param email
   * @param password
   * @returns User
   */
  async authenticate(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new UnauthorizedException(HttpErrorConstants.UNAUTHORIZED_USER);
    }

    const passOk = await validatedPassword(password, user.password);

    if (!passOk) {
      throw new UnauthorizedException(HttpErrorConstants.UNAUTHORIZED_USER);
    }

    return user;
  }

  /**
   * @param userAgent
   * @param dto LoginUserDto
   * @returns Login Info
   */
  async login(userAgent: string, dto: LoginUserDto) {
    // 유저 Agent detect
    const agent = detectPlatform(userAgent);
    console.log('agent ->', agent);

    const user = await this.authenticate(dto.email, dto.password);

    return {
      refreshToken: await this.issueToken(user.email, true),
      accessToken: await this.issueToken(user.email, false),
    };
  }

  /**
   * 소셜 로그인
   * @param userAgent
   * @param dto LoginUserDto
   * @returns Login Info
   */
  async socialLogin(userAgent: string, dto: SocialLoginDto) {
    // 유저 Agent detect
    const agent = detectPlatform(userAgent);
    console.log('agent ->', agent);
    switch (dto.type) {
      case SocialUserType.GOOGLE:
        //handling;
        break;
      case SocialUserType.APPLE:
        // handling;
        break;
      case SocialUserType.NAVER:
        //handling;
        break;
      case SocialUserType.KAKAO:
        //handling
        break;
    }
  }

  /**
   * 토큰 발행 함수
   * @param email
   * @param isRefreshToken  true -> refresh, false -> access
   */
  async issueToken(email: string, isRefreshToken: boolean) {
    const refreshTokenSecret = this.configService.get<string>(ENV_CONFIG.AUTH.REFRESH_SECRET);
    const accessTokeknSecret = this.configService.get<string>(ENV_CONFIG.AUTH.ACCESS_SECRET);

    return await this.jwtService.signAsync(
      {
        sub: email,
        type: isRefreshToken ? AuthTokenType.REFRESH_TOKEN : AuthTokenType.ACCESS_TOKEN,
      },
      {
        secret: isRefreshToken ? refreshTokenSecret : accessTokeknSecret,
        expiresIn: isRefreshToken
          ? this.configService.get<string>(ENV_CONFIG.AUTH.EXPOSE_REFRESH_TK)
          : this.configService.get<string>(ENV_CONFIG.AUTH.EXPOSE_ACCESS_TK),
      },
    );
  }
}
