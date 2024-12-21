import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { TokenPayLoad } from './interfaces/token-payload.interface';
import { RefreshToken } from './entities/refresh-token.entity';
import { DataSource, DeleteResult } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
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
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const user = await this.userRepository.findOrCreate(dto, qr);
      // 토큰 발급
      const { accessToken, refreshToken } = await this.generatedTokens(user);

      // 토큰 정보 추가 or 업데이트
      await this.refreshTokenRepository.updateOrCreateRefToken(user, refreshToken, agent, qr);

      await qr.commitTransaction();

      return { accessToken, refreshToken };
    } catch (err) {
      await qr.rollbackTransaction();
      console.log('error->', err);
      throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
    } finally {
      await qr.release();
    }
  }

  /**
   * Refresh 토큰으로 Access 재발급
   * @param userId
   * @param token
   * @returns accessToken
   */
  async rotateAccessToken(userId: number, token: string): Promise<string> {
    const parseToken = await this.validateBearerToken(token);
    const user = await this.userRepository.findAllrefToken(userId);

    if (!user) {
      throw new NotFoundException(HttpErrorConstants.NOT_FOUND_USER);
    }

    // 리프레시 항목과 일치하는 정보가 없는지 체크
    const isValidToken = user.refToken.some((refToken: RefreshToken) => refToken.refToken === parseToken);

    if (!isValidToken) {
      throw new UnauthorizedException(HttpErrorConstants.INVALID_TOKEN);
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
   * BeaerToken 검증
   * @param rawToken
   * @returns Seperated Token(AT, RT)
   */
  async validateBearerToken(rawToken: string): Promise<string> {
    const bearerTokenSplit = rawToken.split(' ');

    if (bearerTokenSplit.length !== 2) {
      throw new UnauthorizedException(HttpErrorConstants.INVALID_TOKEN_FORMAT);
    }

    const [bearer, token] = bearerTokenSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new UnauthorizedException(HttpErrorConstants.INVALID_BEARER_TOKEN);
    }

    return token;
  }

  /**
   * Bearer 토큰 검증 및 payload 반환
   * @param token
   * @param isRefreshToken
   * @returns PayLoad
   */
  async parseBearerToken(token: string, isRefreshToken: boolean): Promise<TokenPayLoad> {
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
        // 토큰 만료 핸들링
        throw new UnauthorizedException(HttpErrorConstants.EXPIRED_TOKEN);
      }
      if (error.name === 'JsonWebTokenError') {
        // signature 불일치
        throw new UnauthorizedException(HttpErrorConstants.UNAUTHORIZED_INVALIE_SIGNATURE);
      }
    }
  }

  /**
   * refToken을 제거
   * @param userId
   * @returns
   */
  async removeRefToken(userId: number): Promise<DeleteResult> {
    return this.refreshTokenRepository.delete({
      user: { id: userId },
    });
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
   * @param user
   * @param isRefreshToken
   * @returns TokenPayload
   */
  private async createPayload(user: User, isRefreshToken: boolean): Promise<TokenPayLoad> {
    if (isRefreshToken) {
      return { sub: user.id }; // 최소 정보만 포함
    }
    return { sub: user.id, email: user.email, name: user.userName }; // 추가 정보 포함
  }
}
