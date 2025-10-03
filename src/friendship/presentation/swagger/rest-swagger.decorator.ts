import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { SendFriendRequestDto } from '../dto/request/send-friend-request.dto';
import { ApiCreatedResponseTemplate } from 'src/common/swagger/response/api-created-response';
import { SendFriendRequestResponseDto } from '../dto/response/send-friend-response.dto';
import { ApiErrorResponseTemplate } from 'src/common/swagger/response/api-error-response';
import { StatusCodes } from 'http-status-codes';
import { HttpFriendshipErrorConstants } from 'src/friendship/application/helper/http-error-object';
import { ApiOkResponseTemplate } from 'src/common/swagger/response/api-ok-response';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { FriendRequestResponseDto } from '../dto/response/friend-request.response.dto';

//? Send Friend Request
export const SendFriendRequestDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '친구 요청',
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
