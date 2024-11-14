import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/core/swagger/api-error-common-response';

import { Response, Request } from 'express';
import HttpResponse from 'src/core/http/http-response';
import { SocialUserDto } from '../user/dto/social-user.dto';
// import { SocialUserDto } from './dtos/social-user.dto';
// import { LoginUserDto } from './dtos/login-user.dto';

@ApiTags('Auth - 인증')
@ApiCommonErrorResponseTemplate()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 소셜 로그인
  @Post('social-login')
  async socialLogin(@Req() req: Request, @Res() res: Response, @Body() dto: SocialUserDto) {
    const token = await this.authService.socialLogin(req.get('user-agent').toLowerCase(), dto);
    return HttpResponse.created(res, { body: token });
  }

  // // 타 인증서버를 거치지 않는 일반 로그인
  // @Post('login')
  // async login(@Req() req: Request, @Res() res: Response, @Body() dto: LoginUserDto) {
  //   const token = await this.authService.login(req.get('user-agent').toLowerCase(), dto);
  //   return HttpResponse.created(res, { body: token });
  // }
}
