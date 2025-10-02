import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { FriendRequestEntity } from 'src/friendship/domain/entities/friend-request.entity';

export class SendFriendRequestResponseDto {
  constructor(partial: Partial<SendFriendRequestResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty({
    description: '친구 요청 ID',
    example: 1,
    type: Number,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '요청을 보낸 사용자 ID',
    example: 123,
    type: Number,
  })
  senderId: number;

  @Expose()
  @ApiProperty({
    description: '요청을 받은 사용자 ID',
    example: 456,
    type: Number,
  })
  receiverId: number;

  @Expose()
  @ApiProperty({
    description: '친구 요청 상태',
    example: 'PENDING',
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED'],
    type: String,
  })
  status: string;

  //   @Expose()
  @ApiProperty({
    description: '친구 요청 생성 시간',
    example: '2025-09-29T10:30:00.000Z',
    type: String,
  })
  createdAt: string;

  //   @Expose()
  @ApiProperty({
    description: '친구 요청 만료 시간',
    example: '2025-10-06T10:30:00.000Z',
    type: String,
    nullable: true,
  })
  expiresAt: string | null;

  //   @Expose()
  @ApiProperty({
    description: '요청 응답 시간',
    example: '2025-09-29T11:00:00.000Z',
    type: String,
    nullable: true,
  })
  respondedAt: string | null;

  static fromResult(entity: FriendRequestEntity): SendFriendRequestResponseDto {
    return plainToInstance(
      SendFriendRequestResponseDto,
      {
        id: entity.id,
        senderId: entity.senderId,
        receiverId: entity.receiverId,
        status: entity.status,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
