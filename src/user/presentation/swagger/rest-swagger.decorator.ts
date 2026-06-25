import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { ApiErrorResponseTemplate } from 'src/common/swagger/response/api-error-response';
import { ApiOkResponseTemplate } from 'src/common/swagger/response/api-ok-response';
import { CreateUserProfileDto } from '../dto/request/create-user-profile.dto';
import { ApiCreatedResponseTemplate } from 'src/common/swagger/response/api-created-response';
import { HttpUserErrorConstants } from '../../application/helper/http-error-object';
import { ApiNoContentResponseTemplate } from 'src/common/swagger/response/api-no-content-response';
import { UpdateUserProfileDto } from '../dto/request/update-user-profile.dto';
import { ProfileResponseDto } from '../dto/response/profile.response.dto';
import { UserWithProfileResponseDto } from '../dto/response/user-with-profile.response.dto';
import { UserProfileWithInviteResponseDto } from '../dto/response/user-profile-with-invite.response.dto';

//? Withdraw
export const WithdrawUserDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '회원탈퇴',
      description: [
        '- 유저를 회원탈퇴 시킨다.',
        '- 유저와 연관된 데이터를 모두 제거한다.',
        '- 프론트 화면: [화면 (Figma)](https://www.figma.com/design/AtU0tCeeJ6GKP0M7X3fFO0/%EB%8B%A4%EC%9D%B4%EB%85%B8%EC%8A%A4-%EA%B0%9C%EB%B0%9C?node-id=201-7069&t=zRtKYhIbdF799Dtl-0)',
      ].join('\n'),
    }),
    ApiNoContentResponseTemplate({
      description: '회원탈퇴 성공',
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
    ]),
  );
};

//? Find By User Profile
export const FindByProfileWithInviteInfoDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: `유저의 프로필 정보 및 초대코드 & 친구 요청수 & 나의 친구수 & 작성한 리뷰수 일괄조회 `,
      description: [
        '- token에 담긴 userId 값을 기반으로 유저 프로필 정보 조회',
        '- userId 값을 base로 사용자의 프로필 정보, 초대코드, 친구 요청건수, 나의 친구수, 작성한 리뷰수를 일괄로 조회한다.',
        '- 프론트 화면: [화면 조정 필요 (Figma)](https://www.figma.com/design/AtU0tCeeJ6GKP0M7X3fFO0/%EB%8B%A4%EC%9D%B4%EB%85%B8%EC%8A%A4-%EA%B0%9C%EB%B0%9C?node-id=201-6565&t=zRtKYhIbdF799Dtl-0)',
      ].join('\n'),
    }),
    ApiOkResponseTemplate({
      description: '유저의 프로필 정보 및 초대코드 & 친구 요청수 조회 성공',
      type: UserProfileWithInviteResponseDto,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
      {
        status: StatusCodes.NOT_FOUND,
        errorFormatList: [HttpUserErrorConstants.NOT_FOUND_PROFILE],
      },
    ]),
  );
};

//? Create User Profile
export const CreateUserProfileDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '유저 프로필 생성',
      description: [
        '- 유저 프로필을 생성한다.',
        '- 유저 프로필 생성시, nickname은 필수값이고, 나머지 항목은 선택적으로 요청을 보내야한다.',
        '- 유저 프로필은 계정 생성시 디폴트로 생성되기 때문에 별도로 화면 연결은 없음. patch를 사용',
      ].join('\n'),
    }),
    ApiBody({
      type: CreateUserProfileDto,
    }),
    ApiCreatedResponseTemplate({
      description: '유저 프로필 생성 성공',
      type: ProfileResponseDto,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.CONFLICT,
        errorFormatList: [HttpUserErrorConstants.CONFLICT_USER_PROFILE],
      },
      {
        status: StatusCodes.NOT_FOUND,
        errorFormatList: [HttpUserErrorConstants.NOT_FOUND_USER],
      },
    ]),
  );
};

//? Update User Profile
export const UpdateUserProfileDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '유저 프로필 수정',
      description: [
        '- 유저 프로필을 수정한다.',
        '- Bearer AccessToken의 userId를 기반으로 프로필을 조회하여 수정한다.',
        '- 유저 프로필 수정시, nickname은 필수값이고, 나머지 항목은 선택적으로 요청을 보내야한다.',
        '- 프론트 화면: [화면 (Figma)](https://www.figma.com/design/AtU0tCeeJ6GKP0M7X3fFO0/%EB%8B%A4%EC%9D%B4%EB%85%B8%EC%8A%A4-%EA%B0%9C%EB%B0%9C?node-id=201-6441&t=zRtKYhIbdF799Dtl-0)',
      ].join('\n'),
    }),
    ApiBody({
      type: UpdateUserProfileDto,
    }),
    ApiOkResponseTemplate({
      description: '유저 프로필 수정 성공',
      type: ProfileResponseDto,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.NOT_FOUND,
        errorFormatList: [HttpUserErrorConstants.NOT_FOUND_PROFILE],
      },
    ]),
  );
};

//? Find By Invite Code
export const FindByInviteCodeDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '초대코드 기반 유저정보 조회',
      description: [
        '- 최초가입시 유저별로 할당되는 초대코드를 기반으로 유저의 기본정보를 조회한다.',
        '- 가입시, name(이름)은 nullable 하기 때문에, name으로 화면에 표기할지, nickname을 표기할지는 별도로 논의가 필요함.',
        '- 프론트 화면: [화면 (Figma)](https://www.figma.com/design/AtU0tCeeJ6GKP0M7X3fFO0/%EB%8B%A4%EC%9D%B4%EB%85%B8%EC%8A%A4-%EA%B0%9C%EB%B0%9C?node-id=201-6909&t=zRtKYhIbdF799Dtl-0)',
      ].join('\n'),
    }),
    ApiOkResponseTemplate({
      description: '초대코드 기반 유저 조회 성공',
      type: UserWithProfileResponseDto,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.NOT_FOUND,
        errorFormatList: [HttpUserErrorConstants.NOT_FOUND_USER],
      },
    ]),
  );
};
