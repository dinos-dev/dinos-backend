import { Injectable } from '@nestjs/common';
import { detectPlatform } from './utils/client.util';
import { UserRepository } from 'src/domains/user/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ENV_CONFIG } from 'src/common/const/env-keys.const';
import { User } from 'src/domains/user/entities/user.entity';
import { SocialUserDto } from '../user/dto/social-user.dto';
import { LoginResponseDto } from './dtos/login-response.dto';

// import { LoginUserDto } from './dtos/login-user.dto';
// import { HttpErrorConstants } from 'src/core/http/http-error-objects';
// import { validatedPassword } from 'src/core/utils/password.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
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
    const agent = detectPlatform(userAgent);
    console.log('agent info: logging target->', agent);
    const user = await this.userRepository.findOrCreate(dto);

    const { accessToken, refreshToken } = await this.generatedTokens(user);

    return { accessToken, refreshToken };
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
   * 토큰 발행 함수
   * @param user
   * @param isRefreshToken  true -> refresh, false -> access
   */
  async issueToken(user: User, isRefreshToken: boolean) {
    const refreshTokenSecret = this.configService.get<string>(ENV_CONFIG.AUTH.REFRESH_SECRET);
    const accessTokeknSecret = this.configService.get<string>(ENV_CONFIG.AUTH.ACCESS_SECRET);

    return await this.jwtService.signAsync(
      {
        sub: user.id,
        type: isRefreshToken ? 'rt' : 'at',
      },
      {
        secret: isRefreshToken ? refreshTokenSecret : accessTokeknSecret,
        expiresIn: isRefreshToken
          ? this.configService.get<string>(ENV_CONFIG.AUTH.EXPOSE_REFRESH_TK)
          : this.configService.get<string>(ENV_CONFIG.AUTH.EXPOSE_ACCESS_TK),
      },
    );
  }

  // /**
  //  * 로그인시 유저의 이메일과 패스워드 검증
  //  * @param email
  //  * @param password
  //  * @returns User
  //  */
  // async authenticate(email: string, password: string): Promise<User> {
  //   const user = await this.userRepository.findOne({
  //     where: {
  //       email: email,
  //     },
  //   });

  //   if (!user) {
  //     throw new UnauthorizedException(HttpErrorConstants.UNAUTHORIZED_USER);
  //   }

  //   const passOk = await validatedPassword(password, user.password);

  //   if (!passOk) {
  //     throw new UnauthorizedException(HttpErrorConstants.UNAUTHORIZED_USER);
  //   }

  //   return user;
  // }

  /**
   * @param userAgent
   * @param dto LoginUserDto
   * @returns Login Info
   */
  // async login(userAgent: string, dto: LoginUserDto) {
  //   // 유저 Agent detect
  //   const agent = detectPlatform(userAgent);
  //   console.log('agent ->', agent);

  //   const user = await this.authenticate(dto.email, dto.password);

  //   return {
  //     refreshToken: await this.issueToken(user, true),
  //     accessToken: await this.issueToken(user, false),
  //   };
  // }
}
