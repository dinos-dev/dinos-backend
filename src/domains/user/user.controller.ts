import { Controller, Res, Delete, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/core/swagger/api-error-common-response';

import { Response, Request } from 'express';
import HttpResponse from 'src/core/http/http-response';
import { WithdrawUserDocs } from './swagger/rest-swagger.decorator';

@ApiTags('User - 회원관리')
@ApiCommonErrorResponseTemplate()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @WithdrawUserDocs()
  @Delete()
  async remove(@Res() res: Response, @Req() req: Request) {
    const payLoad = req.user;
    await this.userService.withdrawUser(payLoad);
    return HttpResponse.noContent(res);
  }
  // /**회원가입*/
  // @Post()
  // async register(@Body() dto: CreateUserDto, @Res() res: Response) {
  //   const user = await this.userService.register(dto);
  //   return HttpResponse.created(res, { body: user.id });
  // }

  // /**이메일 중복체크*/
  // @Get('/check-email/:email')
  // async checkExistEmail(@Res() res: Response, @Param('email') email: string) {
  //   const isExistEmail = await this.userService.checkExistEmail(email);
  //   return HttpResponse.ok(res, isExistEmail);
  // }
}
