import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { FriendRequestStatus } from '@prisma/client';
import { FriendRequestEntity } from 'src/friendship/domain/entities/friend-request.entity';

export class FriendRequestResponseDto {
  constructor(partial: Partial<FriendRequestResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty({
    description: '친구 요청을 다루는 기본 아이디',
    example: 1,
    type: Number,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '요청을 보낸 사용자 아이디(userId)',
    example: 1,
    type: Number,
  })
  senderId: number;

  @Expose()
  @ApiProperty({
    description: '요청을 받은 사용자 아이디(userId)',
    example: 4,
    type: Number,
  })
  receiverId: number;

  @Expose()
  @ApiProperty({
    description: '친구 요청 상태',
    example: 'PENDING',
    enum: FriendRequestStatus,
    type: String,
  })
  status: FriendRequestStatus;

  @Expose()
  @ApiProperty({
    description: '요청을 보낸 사용자 정보',
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: '사용자 아이디',
        example: 1,
      },
      email: {
        type: 'string',
        description: '사용자 이메일',
        example: 'user@example.com',
      },
      name: {
        type: 'string',
        description: '사용자 이름',
        example: '홍길동',
        nullable: true,
      },
      profile: {
        type: 'object',
        description: '사용자 프로필 정보',
        properties: {
          nickname: {
            type: 'string',
            description: '닉네임',
            example: '그린다이노',
          },
          comment: {
            type: 'string',
            description: '프로필 설명',
            example: '안녕하세요!',
            nullable: true,
          },
        },
      },
    },
    nullable: true,
  })
  sender: {
    id: number;
    email: string;
    name: string | null;
    profile: {
      nickname: string;
      comment: string | null;
    } | null;
  };

  static fromResult(friendRequest: FriendRequestEntity): FriendRequestResponseDto {
    return plainToInstance(
      FriendRequestResponseDto,
      {
        id: friendRequest.id,
        senderId: friendRequest.senderId,
        receiverId: friendRequest.receiverId,
        status: friendRequest.status,
        respondedAt: friendRequest.respondedAt,
        expiresAt: friendRequest.expiresAt,
        sender: {
          id: friendRequest.senderId,
          email: friendRequest.sender.email,
          name: friendRequest.sender.name,
          profile: friendRequest.sender.profile
            ? {
                nickname: friendRequest.sender.profile.nickname,
                comment: friendRequest.sender.profile.comment,
              }
            : null,
        },
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
