import { Controller, Post, Body, Res, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/core/swagger/api-error-common-response';

import { Response } from 'express';
import HttpResponse from 'src/core/http/http-response';

@ApiTags('User - 회원관리')
@ApiCommonErrorResponseTemplate()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**회원가입*/
  @Post()
  async register(@Body() dto: CreateUserDto, @Res() res: Response) {
    const user = await this.userService.register(dto);
    return HttpResponse.created(res, { body: user.id });
  }

  /**이메일 중복체크*/
  @Get('/check-email/:email')
  async checkExistEmail(@Res() res: Response, @Param('email') email: string) {
    const isExistEmail = await this.userService.checkExistEmail(email);
    return HttpResponse.ok(res, isExistEmail);
  }
}
