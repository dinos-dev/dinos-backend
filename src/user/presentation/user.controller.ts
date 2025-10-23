import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/common/swagger/response/api-error-common-response';
import {
  CreateUserProfileDocs,
  FindByInviteCodeDocs,
  FindByProfileWithInviteInfoDocs,
  UpdateUserProfileDocs,
  WithdrawUserDocs,
} from './swagger/rest-swagger.decorator';
import { HttpResponse } from 'src/common/http/http-response';
import { UserId } from '../../common/decorator/user-id.decorator';
import { CreateUserProfileDto } from './dto/request/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/request/update-user-profile.dto';
import { ProfileResponseDto } from './dto/response/profile.response.dto';
import { UserProfileMapper } from './dto/mapper/user-profile.mapper';
import { UserWithProfileResponseDto } from './dto/response/user-with-profile.response.dto';
import { UserProfileWithInviteResponseDto } from './dto/response/user-profile-with-invite.response.dto';

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
  ): Promise<HttpResponse<ProfileResponseDto>> {
    const command = UserProfileMapper.toCreateCommand(userId, dto);
    const profile = await this.userService.createProfile(command);

    const result = ProfileResponseDto.fromResult(profile);

    return HttpResponse.created(result);
  }

  //? 유저 프로필 수정
  @UpdateUserProfileDocs()
  @Patch('profile/:id')
  async updateProfile(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<HttpResponse<ProfileResponseDto>> {
    const command = UserProfileMapper.toUpdateCommand(userId, dto);

    const profile = await this.userService.updateProfile(id, command);

    const result = ProfileResponseDto.fromResult(profile);
    return HttpResponse.ok(result);
  }

  //? userId 기반 프로필 & 초대코드 & 요청 정보 조회
  @FindByProfileWithInviteInfoDocs()
  @Get('/mine/profile')
  async findByProfileWithInviteInfo(@UserId() userId: number): Promise<HttpResponse<UserProfileWithInviteResponseDto>> {
    const profile = await this.userService.findByProfileWithInviteInfo(userId);

    const result = UserProfileWithInviteResponseDto.fromDto(profile);

    return HttpResponse.ok(result);
  }

  //? 회원탈퇴
  @WithdrawUserDocs()
  @Delete()
  async withdrawUser(@UserId() userId: number): Promise<HttpResponse<void>> {
    await this.userService.withdrawUser(userId);
    return HttpResponse.noContent();
  }

  //? 초대코드 기반 유저 조회
  @FindByInviteCodeDocs()
  @Get('invite-code/:inviteCode')
  async findByInviteCode(@Param('inviteCode') inviteCode: string): Promise<HttpResponse<UserWithProfileResponseDto>> {
    const userByProfile = await this.userService.findByInviteCode(inviteCode);
    const result = UserWithProfileResponseDto.fromResult(userByProfile.user, userByProfile.profile);
    return HttpResponse.ok(result);
  }
}
