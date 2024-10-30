import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from './dtos/login-user.dto';
import { detectPlatform } from './utils/client.util';
import { UserRepository } from 'src/user/repositories/user.repository';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { validatedPassword } from 'src/core/utils/password.utils';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ENV_CONFIG } from 'src/common/const/env-keys.const';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * @param userAgent
   * @param dto LoginUserDto
   * @returns Login Info
   */
  async login(userAgent: string, dto: LoginUserDto) {
    // 유저 Agent detect
    const agent = detectPlatform(userAgent);
    console.log('agent ->', agent);

    const user = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException(HttpErrorConstants.UNAUTHORIZED_USER);
    }

    const passOk = await validatedPassword(dto.password, user.password);

    if (!passOk) {
      throw new UnauthorizedException(HttpErrorConstants.UNAUTHORIZED_USER);
    }

    const refreshTokenSecret = this.configService.get<string>(ENV_CONFIG.AUTH.REFRESH_SECRET);
    const accessTokeknSecret = this.configService.get<string>(ENV_CONFIG.AUTH.ACCESS_SECRET);

    return {
      refreshToken: await this.jwtService.signAsync(
        {
          sub: user.id,
          type: 'rt',
        },
        {
          secret: refreshTokenSecret,
          expiresIn: this.configService.get<string>(ENV_CONFIG.AUTH.EXPOSE_REFRESH_TK),
        },
      ),
      accessToken: await this.jwtService.signAsync(
        {
          sub: user.id,
          type: 'at',
        },
        {
          secret: accessTokeknSecret,
          expiresIn: this.configService.get<string>(ENV_CONFIG.AUTH.EXPOSE_ACCESS_TK),
        },
      ),
    };
  }
}
