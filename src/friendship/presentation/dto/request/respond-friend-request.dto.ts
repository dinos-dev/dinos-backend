import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { FriendRequestStatus } from 'src/friendship/domain/const/friend-request.enum';

export class RespondToFriendRequestDto {
  @IsNotEmpty()
  @IsEnum(FriendRequestStatus)
  @ApiProperty({
    description: '친구 요청 응답 ( 수락(ACCEPTED), 거절(REJECTED) )',
    example: 'ACCEPTED',
    required: true,
    enum: FriendRequestStatus,
  })
  status: FriendRequestStatus;
}
