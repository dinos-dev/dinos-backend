import { Body, Controller, Post, Req, Res, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/core/swagger/api-error-common-response';

import { Response, Request } from 'express';
import HttpResponse from 'src/core/http/http-response';
import { SocialUserDto } from '../user/dto/social-user.dto';
import { SocialLoginDocs } from './swagger/rest-swagger.decorator';
// import { SocialUserDto } from './dtos/social-user.dto';
// import { LoginUserDto } from './dtos/login-user.dto';

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

  @Post('logout')
  async logOut(@Res() res: Response) {
    return HttpResponse.ok(res);
  }

  /**
   * Todo:// Guard 모듈 추가
   * 토큰을 엔드포인트에서 바로 헤더로 받는것이 아니라 Guard or Middleware에서 받아서 처리되도록 핸들링
   */
  @Post('token/access')
  async rotateAccessToken(@Res() res: Response, @Headers('authorization') token: string) {
    const accessToken = await this.authService.rotateAccessToken(token);
    return HttpResponse.ok(res, accessToken);
  }

  // // 타 인증서버를 거치지 않는 일반 로그인
  // @Post('login')
  // async login(@Req() req: Request, @Res() res: Response, @Body() dto: LoginUserDto) {
  //   const token = await this.authService.login(req.get('user-agent').toLowerCase(), dto);
  //   return HttpResponse.created(res, { body: token });
  // }
}
