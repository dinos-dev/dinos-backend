import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { FriendshipService } from '../application/friendship.service';
import { SendFriendRequestDto } from './dto/request/send-friend-request.dto';
import { HttpResponse } from 'src/common/http/http-response';
import { UserId } from 'src/common/decorator/user-id.decorator';
import { RequestFriendshipCommand } from '../application/command/request-friendship.command';
import { SendFriendRequestResponseDto } from './dto/response/send-friend-response.dto';
import { FindByReceiveIdDocs, SendFriendRequestDocs } from './swagger/rest-swagger.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/common/swagger/response/api-error-common-response';
import { HttpFriendshipErrorConstants } from '../application/helper/http-error-object';
import { FriendUserResponseDto } from './dto/response/friend-user.response.dto';

@ApiTags('Friendship - 친구관리')
@ApiCommonErrorResponseTemplate()
@Controller('friendships')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  //? 친구요청 전송
  @Post('requests')
  @SendFriendRequestDocs()
  async sendFriendRequest(
    @Body() dto: SendFriendRequestDto,
    @UserId() userId: number,
  ): Promise<HttpResponse<SendFriendRequestResponseDto>> {
    if (userId === dto.receiverId) {
      throw new BadRequestException(HttpFriendshipErrorConstants.SAME_USER_ID);
    }
    const command = new RequestFriendshipCommand(userId, dto.receiverId);
    const friendRequest = await this.friendshipService.requestFriendship(command);
    const responseData = SendFriendRequestResponseDto.fromResult(friendRequest);
    return HttpResponse.created(responseData);
  }

  //? 나에게 요청을 보낸 유저 정보 조회
  @FindByReceiveIdDocs()
  @Get('received')
  async findByReceiveId(@UserId() userId: number): Promise<HttpResponse<FriendUserResponseDto[]>> {
    const receivedFriendRequests = await this.friendshipService.findByReceiveId(userId);
    const result = receivedFriendRequests.map((receivedFriendRequest) =>
      FriendUserResponseDto.fromResult(receivedFriendRequest.user, receivedFriendRequest.profile),
    );
    return HttpResponse.ok(result);
  }
}
