import { Body, Controller, Post } from '@nestjs/common';
import { FriendshipService } from '../application/friendship.service';
import { SendFriendRequestDto } from './dto/request/send-friend-request.dto';
import { HttpResponse } from 'src/common/http/http-response';
import { UserId } from 'src/common/decorator/user-id.decorator';
import { RequestFriendshipCommand } from '../application/command/request-friendship.command';
import { SendFriendRequestResponseDto } from './dto/response/send-friend-response.dto';
import { RequestFriendshipDocs } from './swagger/rest-swagger.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/common/swagger/response/api-error-common-response';

@ApiTags('Friendship - 친구관리')
@ApiCommonErrorResponseTemplate()
@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post('request')
  @RequestFriendshipDocs()
  async requestFriendship(
    @Body() dto: SendFriendRequestDto,
    @UserId() userId: number,
  ): Promise<HttpResponse<SendFriendRequestResponseDto>> {
    const command = new RequestFriendshipCommand(userId, dto.receiverId);
    const friendRequest = await this.friendshipService.requestFriendship(command);
    const responseData = SendFriendRequestResponseDto.fromResult(friendRequest);
    return HttpResponse.created(responseData);
  }
}
