import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/core/swagger/api-error-common-response';

import { Response } from 'express';
import { LoginUserDto } from './dtos/login-user.dto';
import HttpResponse from 'src/core/http/http-response';

@ApiTags('Auth - 인증')
@ApiCommonErrorResponseTemplate()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Req() req, @Res() res: Response, @Body() dto: LoginUserDto) {
    const token = await this.authService.login(req.get('user-agent').toLowerCase(), dto);
    return HttpResponse.created(res, { body: token });
  }
}
