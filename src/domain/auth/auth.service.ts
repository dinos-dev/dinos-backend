import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { HttpErrorConstants, HttpErrorFormat } from 'src/core/http/http-error-objects';
import { SocialUserDto } from '../user/dto/request/social-user.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { detectPlatform } from './util/client.util';
import { TokenPayLoad } from './interface/token-payload.interface';
import { DateUtils } from 'src/core/utils/date-util';
import { CreateUserDto } from '../user/dto/request/create-user.dto';
import { WinstonLoggerService } from 'src/core/logger/winston-logger.service';
import { IUserRepository } from '../user/interface/user.repository.interface';
import { ITokenRepository } from './interface/token.repository.interface';
import { TOKEN_REPOSITORY, USER_REPOSITORY } from 'src/core/config/common.const';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { Provider, Token, User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: ITokenRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: WinstonLoggerService,
  ) {}

  /**
   * 소셜 ( OAuth ) 로그인
   * @param userAgent
   * @param dto SocialUserDto
   * @returns Login Info
   */
  async socialLogin(userAgent: string, dto: SocialUserDto): Promise<LoginResponseDto> {
    const agent = await detectPlatform(userAgent);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1) 가입된 소셜 계정 및 자체 로그인 정보가 있는지 조회
        const existingUser = await tx.user.findUnique({
          where: { email: dto.email },
        });

        // 2) 가입된 정보가 있을 경우 핸들링
        if (existingUser && existingUser.provider !== dto.provider) {
          this.throwProviderConflictError(existingUser.provider);
        }

        // 3) 유저 생성 or 조회
        const user = await this.userRepository.findOrCreateSocialUser(dto);

        // 4) 토큰 발급
        const { accessToken, refreshToken, expiresAt } = await this.generatedTokens(user);

        // 5) 토큰 정보 추가 or 업데이트
        await this.tokenRepository.updateOrCreateRefToken(user, refreshToken, agent, expiresAt);

        return { accessToken, refreshToken };
      });

      this.logger.log(`[소셜 로그인 & 가입]${dto.email} 유저가 회원가입 or 로그인을 완료했습니다 🎉`);
      return result;
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err;
      }
      throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 자체 ( Local ) 로그인
   * @param dto CreateUserDto
   * @returns Login Info
   */
  async localLogin(userAgent: string, dto: CreateUserDto): Promise<LoginResponseDto> {
    const agent = await detectPlatform(userAgent);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // 1) 가입된 이메일 체크
        const existingUser = await tx.user.findUnique({
          where: { email: dto.email },
        });

        // 2) 가입된 정보가 있을 경우 핸들링
        if (existingUser && existingUser.provider !== Provider.LOCAL) {
          this.throwProviderConflictError(existingUser.provider);
        }

        // 3) 유저 생성 or 조회
        const user = await this.userRepository.findOrCreateLocalUser(dto);

        // 4) 토큰 발급
        const { accessToken, refreshToken, expiresAt } = await this.generatedTokens(user);

        // 5) 토큰 정보 추가 or 업데이트
        await this.tokenRepository.updateOrCreateRefToken(user, refreshToken, agent, expiresAt);

        return { accessToken, refreshToken };
      });

      this.logger.log(`[로컬 로그인 & 가입]${dto.email} 유저가 회원가입 or 로그인을 완료했습니다 🎉`);
      return result;
    } catch (err) {
      console.error('error->', err);
      if (err instanceof ConflictException) {
        throw err;
      }
      throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
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
    const user = await this.userRepository.findAllRefToken(userId);

    if (!user) {
      throw new NotFoundException(HttpErrorConstants.NOT_FOUND_USER);
    }

    // 리프레시 항목과 일치하는 정보가 없는지 체크
    const isValidToken = user.tokens.some((refToken: Token) => refToken.refToken === parseToken);

    if (!isValidToken) {
      throw new UnauthorizedException(HttpErrorConstants.INVALID_TOKEN);
    }

    const accessToken = await this.issueToken(user, false);

    return accessToken.token;
  }

  /**
   * 토큰 발행 함수
   * @param user
   * @param isRefreshToken  true -> refresh, false -> access
   */
  async issueToken(user: User, isRefreshToken: boolean): Promise<{ token: string; expiresAt: Date }> {
    const refreshTokenSecret = this.configService.get<string>('REFRESH_SECRET');
    const accessTokenSecret = this.configService.get<string>('ACCESS_SECRET');
    const expiresIn = isRefreshToken
      ? this.configService.get<string>('EXPOSE_REFRESH_TK')
      : this.configService.get<string>('EXPOSE_ACCESS_TK');

    const payload = await this.createPayload(user, isRefreshToken);

    const token = await this.jwtService.signAsync(payload, {
      secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
      expiresIn,
    });

    const expiresAt = DateUtils.calculateExpiresAt(expiresIn);

    return { token, expiresAt };
  }

  /**
   * BearerToken 검증
   * @param rawToken
   * @returns Separated Token(AT, RT)
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
          ? this.configService.get<string>('REFRESH_SECRET')
          : this.configService.get<string>('ACCESS_SECRET'),
      });
    } catch (error) {
      console.error('token verify exception error ->', error.name);
      if (error.name === 'TokenExpiredError') {
        // 토큰 만료 핸들링
        throw new UnauthorizedException(HttpErrorConstants.EXPIRED_TOKEN);
      }
      if (error.name === 'JsonWebTokenError') {
        // signature 불일치
        throw new UnauthorizedException(HttpErrorConstants.UNAUTHORIZED_INVALID_SIGNATURE);
      }
    }
  }

  /**
   * refToken을 제거
   * @param userId
   * @returns
   */
  async removeRefToken(userId: number): Promise<void> {
    await this.prisma.token.deleteMany({
      where: { userId },
    });
  }

  /**
   * access & refresh Token 발행 메서드
   * @param user
   */
  private async generatedTokens(user: User): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    const accessToken = await this.issueToken(user, false);
    const refreshToken = await this.issueToken(user, true);

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      expiresAt: refreshToken.expiresAt,
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
    return { sub: user.id, email: user.email, name: user.name }; // 추가 정보 포함
  }

  /**
   * OAuth & Local 타입에 맞춰 에러를 통합으로 핸들링
   * @param provider Provider
   */
  private throwProviderConflictError(provider: Provider): never {
    const errorMap: Record<Provider, HttpErrorFormat> = {
      [Provider.GOOGLE]: HttpErrorConstants.EXIST_GOOGLE_ACCOUNT,
      [Provider.NAVER]: HttpErrorConstants.EXIST_NAVER_ACCOUNT,
      [Provider.APPLE]: HttpErrorConstants.EXIST_APPLE_ACCOUNT,
      [Provider.LOCAL]: HttpErrorConstants.EXIST_LOCAL_ACCOUNT,
      [Provider.KAKAO]: HttpErrorConstants.EXIST_KAKAO_ACCOUNT,
    };

    throw new ConflictException(errorMap[provider]);
  }
}
