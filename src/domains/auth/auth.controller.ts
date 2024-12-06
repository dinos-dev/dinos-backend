import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/core/swagger/api-error-common-response';

import { Request } from 'express';

import { SocialUserDto } from '../user/dto/social-user.dto';
import { LogOutDocs, RotateAccessTokenDocs, SocialLoginDocs } from './swagger/rest-swagger.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { Authorization } from './deocorators/authorization.decorator';
import { HttpResponse } from 'src/core/http/http-response';

@ApiTags('Auth - 인증')
@ApiCommonErrorResponseTemplate()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 소셜 가입 & 로그인
  @SocialLoginDocs()
  @Post('social-login')
  async socialLogin(@Req() req: Request, @Body() dto: SocialUserDto) {
    const token = await this.authService.socialLogin(req.get('user-agent').toLowerCase(), dto);
    return HttpResponse.created(token);
  }

  // 토큰 재발급
  @RotateAccessTokenDocs()
  @UseGuards(RefreshTokenGuard)
  @Post('token/access')
  async rotateAccessToken(@Req() req: Request, @Authorization() token: string) {
    const payload = req.user;
    const accessToken = await this.authService.rotateAccessToken(payload, token);
    return HttpResponse.created({ accessToken });
  }

  // 로그아웃
  @LogOutDocs()
  @Post('logout')
  @HttpCode(204)
  async logOut(@Req() req: Request) {
    const payload = req.user;
    await this.authService.removeRefToken(payload);
    return HttpResponse.noContent();
  }
}
