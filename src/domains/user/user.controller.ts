import { Controller, Delete, Req, Get, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/core/swagger/api-error-common-response';

import { Request } from 'express';
import { FindByIdDocs, WithdrawUserDocs } from './swagger/rest-swagger.decorator';
import { HttpResponse } from 'src/core/http/http-response';

@ApiTags('User - 회원관리')
@UseInterceptors(ClassSerializerInterceptor) // 직렬화 인터셉터
@ApiCommonErrorResponseTemplate()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @WithdrawUserDocs()
  @Delete()
  async remove(@Req() req: Request) {
    const payLoad = req.user;
    await this.userService.withdrawUser(payLoad);
    return HttpResponse.noContent();
  }

  @FindByIdDocs()
  @Get()
  async findById(@Req() req: Request) {
    const payLoad = req.user;
    const user = await this.userService.findById(payLoad);
    return HttpResponse.ok(user);
  }
}
