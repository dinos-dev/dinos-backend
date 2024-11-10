import { Body, Controller, Headers, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/core/swagger/api-error-common-response';

import { Response, Request } from 'express';
import { LoginUserDto } from './dtos/login-user.dto';
import HttpResponse from 'src/core/http/http-response';
import { SocialLoginDto } from './dtos/social-login.dto';

@ApiTags('Auth - 인증')
@ApiCommonErrorResponseTemplate()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**일반 로그인*/
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response, @Body() dto: LoginUserDto) {
    const token = await this.authService.login(req.get('user-agent').toLowerCase(), dto);
    return HttpResponse.created(res, { body: token });
  }

  /**소셜 로그인*/
  @Post('social/login')
  async socialLogin(@Req() req: Request, @Res() res: Response, @Body() dto: SocialLoginDto) {
    const token = await this.authService.socialLogin(req.get('user-agent').toLowerCase(), dto);
    return HttpResponse.created(res, { body: token });
  }

  /**Access Token 재발급*/
  @Post('token/access')
  async rotateAccessToken(@Headers('authorization') token: string, @Res() res: Response) {
    const payload = await this.authService.parseBearerToken(token);
    const accessToken = await this.authService.issueToken(payload.sub, false);
    return HttpResponse.created(res, { body: { accessToken } });
  }
}
