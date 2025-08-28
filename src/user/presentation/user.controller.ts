import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/common/swagger/response/api-error-common-response';
import {
  CreateUserProfileDocs,
  FindByProfileDocs,
  UpdateUserProfileDocs,
  WithdrawUserDocs,
} from './swagger/rest-swagger.decorator';
import { HttpResponse } from 'src/common/http/http-response';
import { UserId } from './decorator/user-id.decorator';
import { CreateUserProfileDto } from './dto/request/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/request/update-user-profile.dto';
import { UserProfileResponseDto } from './dto/response/user-profile-response.dto';
import { UserProfileMapper } from './dto/mapper/user-profile.mapper';

@ApiTags('User - 회원관리')
@ApiCommonErrorResponseTemplate()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //? 유저 프로필 생성
  @CreateUserProfileDocs()
  @Post('profile')
  async createProfile(
    @UserId() userId: number,
    @Body() dto: CreateUserProfileDto,
  ): Promise<HttpResponse<UserProfileResponseDto>> {
    const command = UserProfileMapper.toCreateCommand(userId, dto);
    const profile = await this.userService.createProfile(command);

    const result = UserProfileResponseDto.fromResult(profile);

    return HttpResponse.created(result);
  }

  //? 유저 프로필 수정
  @UpdateUserProfileDocs()
  @Patch('profile/:id')
  async updateProfile(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<HttpResponse<UserProfileResponseDto>> {
    const command = UserProfileMapper.toUpdateCommand(userId, dto);

    const profile = await this.userService.updateProfile(id, command);

    const result = UserProfileResponseDto.fromResult(profile);
    return HttpResponse.ok(result);
  }

  //? userId 기반 프로필 조회
  @FindByProfileDocs()
  @Get('/mine/profile')
  async findByProfile(@UserId() userId: number): Promise<HttpResponse<UserProfileResponseDto>> {
    const profile = await this.userService.findByProfile(userId);

    const result = UserProfileResponseDto.fromResult(profile);

    return HttpResponse.ok(result);
  }

  //? 회원탈퇴
  @WithdrawUserDocs()
  @Delete()
  async withdrawUser(@UserId() userId: number): Promise<HttpResponse<void>> {
    await this.userService.withdrawUser(userId);
    return HttpResponse.noContent();
  }
}
