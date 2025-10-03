import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { SendFriendRequestDto } from '../dto/request/send-friend-request.dto';
import { ApiCreatedResponseTemplate } from 'src/common/swagger/response/api-created-response';
import { SendFriendRequestResponseDto } from '../dto/response/send-friend-response.dto';
import { ApiErrorResponseTemplate } from 'src/common/swagger/response/api-error-response';
import { StatusCodes } from 'http-status-codes';
import { HttpFriendshipErrorConstants } from 'src/friendship/application/helper/http-error-object';
import { ApiOkResponseTemplate } from 'src/common/swagger/response/api-ok-response';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { FriendRequestResponseDto } from '../dto/response/friend-request.response.dto';
import { RespondToFriendRequestDto } from '../dto/request/respond-friend-request.dto';

//? Send Friend Request
export const SendFriendRequestDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '친구 요청 전송',
      description: `
      - 친구 요청 전송 엔드포인트 
      - receiverId는 친구 요청을 받는 사용자의 userId 값이고, 이전에 사용자가 거절했던 이력이 있더라도 Pending(대기) 상태로 upsert 된다.
      - 본인이 본인에게 친구 요청을 보내면 400 에러를 반환한다.
      `,
    }),
    ApiBody({
      type: SendFriendRequestDto,
    }),
    ApiCreatedResponseTemplate({
      description: '친구 요청 성공',
      type: SendFriendRequestResponseDto,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.NOT_FOUND,
        errorFormatList: [HttpFriendshipErrorConstants.NOT_FOUND_USER],
      },
      {
        status: StatusCodes.BAD_REQUEST,
        errorFormatList: [HttpFriendshipErrorConstants.SAME_USER_ID],
      },
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
    ]),
  );
};

//? Find By Receive Id
export const FindByReceiveIdDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '나에게 요청을 보낸 유저 정보 조회',
      description: `
      - 나에게 요청을 보낸 유저 정보를 조회한다.
      - 요청을 보낸 사용자가 없을 경우 빈 배열을 리턴한다.
      `,
    }),
    ApiOkResponseTemplate({
      description: '나에게 요청을 보낸 유저 정보 조회 성공',
      type: FriendRequestResponseDto,
      isArray: true,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
    ]),
  );
};

//? Respond To Friend Request
export const RespondToFriendRequestDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '친구 요청에 대한 사용자의 응답을 처리하는 엔드포인트',
      description: `
      - 상대방이 나에게 보낸 친구 요청을 수락(ACCEPTED) 또는 거절(REJECTED) 하기 위한 엔드포인트
      - 사용자의 Bearer Token의 user 정보를 기반으로 본인에게 온 요청인지 체크 후 403 에러를 반환
      - 친구 요청 id값이 불일치 하면 404 에러를 반환 
      - 사용자가 친구 요청을 수락(ACCEPTED) 또는 거절(REJECTED) 하면 친구 관계 테이블을 생성 또는 미생성한다. 
      - 거절 (REJECTED) 했을 경우, 기존 친구 요청 테이블에서 상태값이 REJECTED로 업데이트 되고, 나의 요청 목록에서 제거된다.
      - 친구 요청을 수락(ACCEPTED)시, http response의 result로 "친구 요청을 수락하였습니다." 
      - 친구 요청을 거절(REJECTED)시, http response의 result로 "친구 요청을 거절하였습니다."
      `,
    }),
    ApiParam({
      description: '친구 요청 id ( 내가 받은 친구요청 리스트를 조회 했을 때의 id ) ',
      name: 'id',
      type: Number,
      required: true,
      example: 1,
    }),
    ApiBody({
      type: RespondToFriendRequestDto,
    }),
    ApiOkResponseTemplate({
      description: '친구 요청 응답 성공',
      type: String,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.NOT_FOUND,
        errorFormatList: [HttpFriendshipErrorConstants.NOT_FOUND_FRIEND_REQUEST],
      },
      {
        status: StatusCodes.FORBIDDEN,
        errorFormatList: [HttpFriendshipErrorConstants.INVALID_FRIEND_REQUEST_RECEIVER],
      },
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
    ]),
  );
};
