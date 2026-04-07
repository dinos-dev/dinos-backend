import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Transactional } from '@nestjs-cls/transactional';

import { HttpErrorConstants, HttpErrorFormat } from 'src/common/http/http-error-objects';
import { detectPlatform } from './util/client.util';
import { TokenPayLoad } from 'src/auth/domain/interface/token-payload.interface';
import { WinstonLoggerService } from 'src/infrastructure/logger/winston-logger.service';

import { DateUtils } from 'src/common/utils/date-util';
import {
  INVITE_CODE_REPOSITORY,
  PROFILE_REPOSITORY,
  TOKEN_REPOSITORY,
  USER_REPOSITORY,
} from 'src/common/config/common.const';

import { Provider } from 'src/user/domain/const/provider.enum';
import { ITokenRepository } from 'src/auth/domain/repository/token.repository.interface';
import { IUserRepository } from 'src/user/domain/repository/user.repository.interface';
import { IProfileRepository } from 'src/user/domain/repository/profile.repository.interface';
import { IInviteCodeRepository } from 'src/user/domain/repository/invite-code.repository.interface';

import { UserEntity } from 'src/user/domain/entities/user.entity';
import { TokenEntity } from '../domain/entities/token.entity';
import { ProfileEntity } from 'src/user/domain/entities/profile.entity';
import { InviteCodeEntity } from 'src/user/domain/entities/invite-code.entity';

import { buildDefaultProfile } from 'src/user/application/helper/profile.factory';
import { generateInviteCode } from 'src/user/application/helper/generated-invite-code';
import { SocialUserCommand } from './command/social-user.command';
import { LocalUserCommand } from './command/local-user.command';
import { UserRegisteredEvent } from './event/user-registered.event';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TOKEN_REPOSITORY)
    private readonly tokenRepository: ITokenRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: IProfileRepository,
    @Inject(INVITE_CODE_REPOSITORY)
    private readonly inviteCodeRepository: IInviteCodeRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: WinstonLoggerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * 소셜 ( OAuth ) 로그인
   * @param userAgent
   * @param command SocialUserCommand
   * @returns Login Info
   */
  @Transactional()
  async socialLogin(
    userAgent: string,
    command: SocialUserCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const agent = await detectPlatform(userAgent);

    try {
      // 1) 가입된 소셜 계정 및 자체 로그인 정보가 있는지 조회
      const existingUser = await this.userRepository.findByEmail(command.email);

      // 2) 가입된 정보가 있을 경우 핸들링
      if (existingUser && existingUser.provider !== command.provider) {
        this.throwProviderConflictError(existingUser.provider);
      }
      // 3) 유저 정보 Instance 생성
      const userEntity = UserEntity.create(command);

      // 4) 유저 생성 or 조회
      const { user, isNew } = await this.userRepository.findOrCreateSocialUser(userEntity);

      // 5) 토큰 발급
      const { accessToken, refreshToken, expiresAt } = await this.generatedTokens(user);

      // 6) 토큰 정보 추가 or 업데이트
      await this.tokenRepository.updateOrCreateRefToken(user, refreshToken, agent, expiresAt);

      // 7) 최초 가입일 경우 slack WebHook 알림, default 프로필 생성, 초대 코드 생성
      if (isNew) {
        await this.newAccountGeneratedHook(user, 'social');
      }

      this.logger.log(`[소셜] ${command.email} 유저가 로그인 하였습니다 🎉`);

      return { accessToken, refreshToken };
    } catch (err) {
      if (err instanceof ConflictException) {
        throw err;
      }
      throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 자체 ( Local ) 로그인
   * @param command LocalUserCommand
   * @returns Login Info
   */
  @Transactional()
  async localLogin(
    userAgent: string,
    command: LocalUserCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const agent = await detectPlatform(userAgent);

    try {
      // 1) 가입된 이메일 체크
      const existingUser = await this.userRepository.findByEmail(command.email);

      // 2) 가입된 정보가 있을 경우 핸들링
      if (existingUser && existingUser.provider !== Provider.LOCAL) {
        this.throwProviderConflictError(existingUser.provider);
      }

      const userEntity = UserEntity.create(command);

      // 3) 유저 생성 or 조회
      const { user, isNew } = await this.userRepository.findOrCreateLocalUser(userEntity);

      // 4) 토큰 발급
      const { accessToken, refreshToken, expiresAt } = await this.generatedTokens(user);

      // 5) 토큰 정보 추가 or 업데이트
      await this.tokenRepository.updateOrCreateRefToken(user, refreshToken, agent, expiresAt);

      // 6) 최초 가입일 경우 slack WebHook 알림, default 프로필 생성
      if (isNew) {
        await this.newAccountGeneratedHook(user, 'local');
      }

      this.logger.log(`[로컬] ${command.email} 유저가 로그인 하였습니다 🎉`);

      return { accessToken, refreshToken };
    } catch (err) {
      this.logger.error('로컬 로그인 처리 중 오류 발생', err.stack);
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
    const userEntity = await this.userRepository.findAllRefToken(userId);

    if (!userEntity.user) {
      throw new NotFoundException(HttpErrorConstants.NOT_FOUND_USER);
    }

    // 리프레시 항목과 일치하는 정보가 없는지 체크
    const isValidToken = userEntity.tokens.some((refToken: TokenEntity) => refToken.refToken === parseToken);

    if (!isValidToken) {
      throw new UnauthorizedException(HttpErrorConstants.INVALID_TOKEN);
    }

    const accessToken = await this.issueToken(userEntity.user, false);

    return accessToken.token;
  }

  /**
   * 토큰 발행 함수
   * @param user
   * @param isRefreshToken  true -> refresh, false -> access
   */
  async issueToken(user: UserEntity, isRefreshToken: boolean): Promise<{ token: string; expiresAt: Date }> {
    const refreshTokenSecret = this.configService.get<string>('REFRESH_SECRET');
    const accessTokenSecret = this.configService.get<string>('ACCESS_SECRET');
    const expiresIn = isRefreshToken
      ? this.configService.get<string>('EXPOSE_REFRESH_TK')
      : this.configService.get<string>('EXPOSE_ACCESS_TK');

    const payload = await this.createPayload(user, isRefreshToken);

    const token = await this.jwtService.signAsync(payload, {
      secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
      expiresIn: expiresIn as JwtSignOptions['expiresIn'],
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

    if (!token || token.trim() === '') {
      throw new UnauthorizedException(HttpErrorConstants.INVALID_TOKEN_FORMAT);
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
      this.logger.error('토큰 검증 오류', error.stack);
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
  async removeRefToken(userId: number): Promise<number> {
    return await this.tokenRepository.deleteManyByUserId(userId);
  }

  /**
   * access & refresh Token 발행 메서드
   * @param user
   */
  private async generatedTokens(
    user: UserEntity,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
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
  private async createPayload(user: UserEntity, isRefreshToken: boolean): Promise<TokenPayLoad> {
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

  /**
   * isNew account generated invite code & profile
   * @param user
   * @param type local | social
   */
  private async newAccountGeneratedHook(user: UserEntity, type: 'local' | 'social'): Promise<void> {
    // create default profile
    const defaultProfile = buildDefaultProfile(user.id);
    // create profile instance
    const profileEntity = ProfileEntity.create(defaultProfile);
    await this.profileRepository.createProfile(profileEntity);

    // generated invite code
    await this.createUniqueInviteCode(user.id);

    // event emit
    this.eventEmitter.emit('user.registered', new UserRegisteredEvent(user.id, user.email, type));
  }

  /**
   * 중복되지 않는 초대 코드 생성 및 저장
   * @param userId
   * @returns void
   */
  private async createUniqueInviteCode(userId: number): Promise<void> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      code = generateInviteCode();

      const existingCode = await this.inviteCodeRepository.isExistCode(code);

      if (!existingCode) {
        const inviteCodeEntity = InviteCodeEntity.create({ userId, code });
        await this.inviteCodeRepository.createInviteCode(inviteCodeEntity);
        return;
      }
      attempts++;
      this.logger.warn(`[초대 코드 생성] ${code}가 중복되었습니다. 다시 생성합니다. (attempts: ${attempts})`);
    }

    // 3번 실패시 rollback
    throw new ConflictException(HttpErrorConstants.CONFLICT_USER_INVITE_CODE);
  }
}
