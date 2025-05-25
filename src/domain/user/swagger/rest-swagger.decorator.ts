import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiNoContentResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { ApiErrorResponseTemplate } from 'src/core/swagger/response/api-error-response';
import { FindOneUserResponseDto } from '../dto/find-user.response.dto';
import { ApiOkResponseTemplate } from 'src/core/swagger/response/api-ok-response';
import { CreateUserProfileDto } from '../dto/create-user-profile.dto';
import { ApiCreatedResponseTemplate } from 'src/core/swagger/response/api-created-response';
import { HttpUserErrorConstants } from '../helper/http-error-object';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';

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
    ApiNoContentResponse({
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
      description: '유저 단일 조회 성공',
      type: FindOneUserResponseDto,
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
        `,
    }),
    ApiBody({
      type: CreateUserProfileDto,
    }),
    ApiCreatedResponseTemplate({
      description: '유저 프로필 생성 성공',
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
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.NOT_FOUND,
        errorFormatList: [HttpUserErrorConstants.NOT_FOUND_PROFILE],
      },
    ]),
  );
};
