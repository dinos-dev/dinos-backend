import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { ApiErrorResponseTemplate } from 'src/common/swagger/response/api-error-response';
import { ApiOkResponseTemplate } from 'src/common/swagger/response/api-ok-response';
import { CreateUserProfileDto } from '../dto/request/create-user-profile.dto';
import { ApiCreatedResponseTemplate } from 'src/common/swagger/response/api-created-response';
import { HttpUserErrorConstants } from '../../application/helper/http-error-object';
import { ApiNoContentResponseTemplate } from 'src/common/swagger/response/api-no-content-response';
import { UpdateUserProfileDto } from '../dto/request/update-user-profile.dto';
import { UserProfileResponseDto } from '../dto/response/user-profile-response.dto';

//? Withdraw
export const WithdrawUserDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '회원탈퇴',
      description: `
        - 유저를 회원탈퇴 시킨다. 
        - 유저와 연관된 데이터를 모두 제거한다. 
        `,
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
export const FindByProfileDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: `유저 프로필 조회`,
      description: `
        - token에 담긴 userId 값을 기반으로 유저 프로필 정보 조회
        `,
    }),
    ApiOkResponseTemplate({
      description: '유저 프로필 조회 성공',
      type: UserProfileResponseDto,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
      {
        status: StatusCodes.NOT_FOUND,
        errorFormatList: [HttpErrorConstants.NOT_FOUND_USER],
      },
    ]),
  );
};

//? Create User Profile
export const CreateUserProfileDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '유저 프로필 생성',
      description: `
        - 유저 프로필을 생성한다.
        - 유저 프로필 생성시, nickName은 필수값이고, 나머지 항목은 선택적으로 요청을 보내야한다.
        `,
    }),
    ApiBody({
      type: CreateUserProfileDto,
    }),
    ApiCreatedResponseTemplate({
      description: '유저 프로필 생성 성공',
      type: UserProfileResponseDto,
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
      description: `
        - 유저 프로필을 수정한다.
        - 유저 프로필 수정시, nickName은 필수값이고, 나머지 항목은 선택적으로 요청을 보내야한다.
        `,
    }),
    ApiParam({
      description: '유저의 프로필 id',
      name: 'id',
      type: Number,
      required: true,
      example: 1,
    }),
    ApiBody({
      type: UpdateUserProfileDto,
    }),
    ApiOkResponseTemplate({
      description: '유저 프로필 수정 성공',
      type: UserProfileResponseDto,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.NOT_FOUND,
        errorFormatList: [HttpUserErrorConstants.NOT_FOUND_PROFILE],
      },
    ]),
  );
};
