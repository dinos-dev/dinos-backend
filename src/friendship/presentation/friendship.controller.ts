import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FriendshipService } from '../application/friendship.service';
import { SendFriendRequestDto } from './dto/request/send-friend-request.dto';
import { HttpResponse } from 'src/common/http/http-response';
import { UserId } from 'src/common/decorator/user-id.decorator';
import { RequestFriendshipCommand } from '../application/command/request-friendship.command';
import { SendFriendRequestResponseDto } from './dto/response/send-friend-response.dto';
import {
  FindAllFriendshipDocs,
  FindByReceiveIdDocs,
  RemoveFriendshipDocs,
  RespondToFriendRequestDocs,
  SendFriendRequestDocs,
} from './swagger/rest-swagger.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/common/swagger/response/api-error-common-response';
import { HttpFriendshipErrorConstants } from '../application/helper/http-error-object';
import { FriendRequestResponseDto } from './dto/response/friend-request.response.dto';
import { RespondToFriendRequestDto } from './dto/request/respond-friend-request.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';
import { PaginatedFriendListResponseDto } from './dto/response/friend-with-activity.response.dto';

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
  async findByReceiveId(@UserId() userId: number): Promise<HttpResponse<FriendRequestResponseDto[]>> {
    const receivedFriendRequests = await this.friendshipService.findByReceiveId(userId);
    const result = receivedFriendRequests.map(FriendRequestResponseDto.fromResult);
    return HttpResponse.ok(result);
  }

  //? 친구 요청에 대한 응답 ( 수락, 거절 )
  @RespondToFriendRequestDocs()
  @Patch('requests/:id')
  async respondToFriendRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RespondToFriendRequestDto,
    @UserId() userId: number,
  ): Promise<HttpResponse<string>> {
    const respondToFriendRequest = await this.friendshipService.respondToFriendRequest(id, dto.status, userId);
    return HttpResponse.ok(respondToFriendRequest);
  }

  //? 나의 친구 리스트 조회
  @FindAllFriendshipDocs()
  @Get('mine')
  async findAllFriendship(
    @UserId() userId: number,
    @Query() query: PaginationQueryDto,
  ): Promise<HttpResponse<PaginatedFriendListResponseDto>> {
    const paginationOptions =
      query.page || query.limit
        ? {
            page: query.page || 1,
            limit: query.limit || 20,
          }
        : undefined;
    const friendshipResult = await this.friendshipService.findAllFriendship(userId, paginationOptions);

    const responseData = PaginatedFriendListResponseDto.fromFriendshipResult(friendshipResult);
    return HttpResponse.ok(responseData);
  }

  //? 친구제거
  @RemoveFriendshipDocs()
  @Delete(':id')
  async removeFriendship(@Param('id', ParseIntPipe) id: number, @UserId() userId: number): Promise<HttpResponse<void>> {
    await this.friendshipService.removeFriendship(id, userId);
    return HttpResponse.noContent();
  }
}
