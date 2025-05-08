import { Controller, Delete, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/core/swagger/response/api-error-common-response';
import { FindByIdDocs, WithdrawUserDocs } from './swagger/rest-swagger.decorator';
import { HttpResponse } from 'src/core/http/http-response';
import { UserId } from './decorator/user-id.decorator';

@ApiTags('User - 회원관리')
@ApiCommonErrorResponseTemplate()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @WithdrawUserDocs()
  @Delete()
  async withdrawUser(@UserId() userId: number) {
    await this.userService.withdrawUser(userId);
    return HttpResponse.noContent();
  }

  @FindByIdDocs()
  @Get()
  async findById(@UserId() userId: number) {
    const user = await this.userService.findById(userId);
    return HttpResponse.ok(user);
  }
}
