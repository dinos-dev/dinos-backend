import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/core/swagger/response/api-error-common-response';
import {
  CreateUserProfileDocs,
  FindByProfileDocs,
  UpdateUserProfileDocs,
  WithdrawUserDocs,
} from './swagger/rest-swagger.decorator';
import { HttpResponse } from 'src/core/http/http-response';
import { UserId } from './decorator/user-id.decorator';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@ApiTags('User - 회원관리')
@ApiCommonErrorResponseTemplate()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //? ---------------------------------------------------------------------- ?//
  //? Create
  //? ---------------------------------------------------------------------- ?//

  //? 유저 프로필 생성
  @CreateUserProfileDocs()
  @Post('profile')
  async createProfile(@UserId() userId: number, @Body() dto: CreateUserProfileDto) {
    const profile = await this.userService.createProfile(userId, dto);
    return HttpResponse.created(profile);
  }

  //? ---------------------------------------------------------------------- ?//
  //? Update
  //? ---------------------------------------------------------------------- ?//

  //? 유저 프로필 수정
  @UpdateUserProfileDocs()
  @Patch('profile/:id')
  async updateProfile(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserProfileDto) {
    const profile = await this.userService.updateProfile(id, dto);
    return HttpResponse.ok(profile);
  }

  //? ---------------------------------------------------------------------- ?//
  //? Find
  //? ---------------------------------------------------------------------- ?//

  //? userId 기반 프로필 조회
  @FindByProfileDocs()
  @Get('/mine/profile')
  async findByProfile(@UserId() userId: number) {
    const user = await this.userService.findByProfile(userId);
    return HttpResponse.ok(user);
  }

  //? ---------------------------------------------------------------------- ?//
  //? Delete
  //? ---------------------------------------------------------------------- ?//

  //? 회원탈퇴
  @WithdrawUserDocs()
  @Delete()
  async withdrawUser(@UserId() userId: number) {
    await this.userService.withdrawUser(userId);
    return HttpResponse.noContent();
  }
}
