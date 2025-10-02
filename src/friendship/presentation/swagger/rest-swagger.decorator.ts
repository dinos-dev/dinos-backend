import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { SendFriendRequestDto } from '../dto/request/send-friend-request.dto';
import { ApiCreatedResponseTemplate } from 'src/common/swagger/response/api-created-response';
import { SendFriendRequestResponseDto } from '../dto/response/send-friend-response.dto';
import { ApiErrorResponseTemplate } from 'src/common/swagger/response/api-error-response';
import { StatusCodes } from 'http-status-codes';
import { HttpFriendshipErrorConstants } from 'src/friendship/application/helper/http-error-object';

//? Request Friendship
export const RequestFriendshipDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '친구 요청',
      description: `
      - 친구 요청 전송 엔드포인트 
      - receiverId는 친구 요청을 받는 사용자의 userId 값이고, 이전에 사용자가 거절했던 이력이 있더라도 Pending(대기) 상태로 upsert 된다.
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
    ]),
  );
};
