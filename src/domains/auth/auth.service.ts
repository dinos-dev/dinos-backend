import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { detectPlatform } from './utils/client.util';
import { UserRepository } from 'src/domains/user/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ENV_CONFIG } from 'src/common/const/env-keys.const';
import { User } from 'src/domains/user/entities/user.entity';
import { SocialUserDto } from '../user/dto/social-user.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { TokenPayload } from './interfaces/token-payload.interface';

// import { LoginUserDto } from './dtos/login-user.dto';
// import { HttpErrorConstants } from 'src/core/http/http-error-objects';
// import { validatedPassword } from 'src/core/utils/password.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * @param userAgent
   * @param dto SocialUserDto
   * @returns Login Info
   */
  async socialLogin(userAgent: string, dto: SocialUserDto): Promise<LoginResponseDto> {
    // 유저 Agent detect
    const agent = await detectPlatform(userAgent);
    console.log('agent info: logging target->', agent);
    const user = await this.userRepository.findOrCreate(dto);
    // 토큰 발급
    const { accessToken, refreshToken } = await this.generatedTokens(user);
    // 토큰 정보 추가 or 업데이트
    await this.refreshTokenRepository.updateOrCreateRefToken(user, refreshToken, agent);

    return { accessToken, refreshToken };
  }

  /**
   * Refresh 토큰으로 Access 재발급
   * @param rawToken
   * @returns accessToken
   */
  async rotateAccessToken(rawToken: string): Promise<string> {
    const payLoad = await this.parseBearerToken(rawToken, true);
    const user = await this.userRepository.findOne({
      where: {
        id: payLoad.sub,
      },
    });

    if (!user) {
      throw new NotFoundException(HttpErrorConstants.NOT_FOUND_USER);
    }

    const accessToken = await this.issueToken(user, false);

    return accessToken;
  }

  /**
   * 토큰 발행 함수
   * @param user
   * @param isRefreshToken  true -> refresh, false -> access
   */
  async issueToken(user: User, isRefreshToken: boolean) {
    const refreshTokenSecret = this.configService.get<string>(ENV_CONFIG.AUTH.REFRESH_SECRET);
    const accessTokeknSecret = this.configService.get<string>(ENV_CONFIG.AUTH.ACCESS_SECRET);

    const payload = await this.createPayload(user, isRefreshToken);

    return await this.jwtService.signAsync(payload, {
      secret: isRefreshToken ? refreshTokenSecret : accessTokeknSecret,
      expiresIn: isRefreshToken
        ? this.configService.get<string>(ENV_CONFIG.AUTH.EXPOSE_REFRESH_TK)
        : this.configService.get<string>(ENV_CONFIG.AUTH.EXPOSE_ACCESS_TK),
    });
  }

  /**
   * Bearer 토큰 검증 및 payload 반환 메서드
   * @param rawToken 토큰
   * @param isRefreshToken
   * @returns PayLoad
   */
  async parseBearerToken(rawToken: string, isRefreshToken: boolean): Promise<TokenPayload> {
    const bearerTokenSplit = rawToken.split(' ');

    if (bearerTokenSplit.length !== 2) {
      throw new BadRequestException(HttpErrorConstants.INVALID_TOKEN);
    }

    const [bearer, token] = bearerTokenSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException(HttpErrorConstants.INVALID_TOKEN);
    }

    const payload = await this.verifyAsyncToken(token, isRefreshToken);

    return payload;
  }

  /**
   * AT & RT 토큰 검증 메서드
   * @param token: Access & Refresh
   */
  async verifyAsyncToken(rawToken: string, isRefreshToken: boolean) {
    try {
      return await this.jwtService.verifyAsync(rawToken, {
        secret: isRefreshToken
          ? this.configService.get<string>(ENV_CONFIG.AUTH.REFRESH_SECRET)
          : this.configService.get<string>(ENV_CONFIG.AUTH.ACCESS_SECRET),
      });
    } catch (error) {
      console.error('token verify exception error ->', error.name);
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(HttpErrorConstants.EXPIRED_TOKEN);
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(HttpErrorConstants.INVALID_TOKEN);
      }
    }
  }

  /**
   * access & refresh Token 발행 메서드
   * @param user
   */
  private async generatedTokens(user: User) {
    const accessToken = await this.issueToken(user, false);
    const refreshToken = await this.issueToken(user, true);
    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * 토큰 페이로드 생성 메서드
   * @param user
   * @param isRefreshToken
   * @returns TokenPayload
   */
  private async createPayload(user: User, isRefreshToken: boolean): Promise<TokenPayload> {
    if (isRefreshToken) {
      return { sub: user.id }; // 최소 정보만 포함
    }
    return { sub: user.id, email: user.email, name: user.userName }; // 추가 정보 포함
  }
}
