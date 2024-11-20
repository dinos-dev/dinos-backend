import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/core/swagger/api-error-common-response';

import { Response, Request } from 'express';
import HttpResponse from 'src/core/http/http-response';
import { SocialUserDto } from '../user/dto/social-user.dto';
import { RotateAccessTokenDocs, SocialLoginDocs } from './swagger/rest-swagger.decorator';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { Authorization } from './deocorators/authorization.decorator';

@ApiTags('Auth - 인증')
@ApiCommonErrorResponseTemplate()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 소셜 가입 & 로그인
  @SocialLoginDocs()
  @Post('social-login')
  async socialLogin(@Req() req: Request, @Res() res: Response, @Body() dto: SocialUserDto) {
    const token = await this.authService.socialLogin(req.get('user-agent').toLowerCase(), dto);
    return HttpResponse.created(res, { body: token });
  }

  // 토큰 재발급
  @RotateAccessTokenDocs()
  @UseGuards(RefreshTokenGuard)
  @Post('token/access')
  async rotateAccessToken(@Res() res: Response, @Req() req: Request, @Authorization() token: string) {
    const payload = req.user;
    const accessToken = await this.authService.rotateAccessToken(payload, token);
    return HttpResponse.created(res, { body: accessToken });
  }

  // @Post('logout')
  // async logOut(@Res() res: Response) {
  //   return HttpResponse.ok(res);
  // }
}
