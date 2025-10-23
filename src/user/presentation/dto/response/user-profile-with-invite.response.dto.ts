import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { UserProfileWithInviteDto } from 'src/user/application/dto/user-profile-with-invite.dto';

export class UserProfileWithInviteResponseDto {
  constructor(partial: Partial<UserProfileWithInviteResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty({
    description: '유저 아이디',
    example: 1,
    type: Number,
  })
  userId: number;

  @Expose()
  @ApiProperty({
    description: '유저 이메일',
    example: 'user@example.com',
    type: String,
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: '유저 이름',
    example: '홍길동',
    type: String,
    nullable: true,
  })
  name: string | null;

  @Expose()
  @ApiProperty({
    description: '유저 프로필 정보',
    type: 'object',
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
      headerId: {
        type: 'number',
        description: '헤더 ID',
        example: 1,
        nullable: true,
      },
      bodyId: {
        type: 'number',
        description: '바디 ID',
        example: 1,
        nullable: true,
      },
      headerColor: {
        type: 'string',
        description: '헤더 색상',
        example: '#FF5733',
        nullable: true,
      },
      bodyColor: {
        type: 'string',
        description: '바디 색상',
        example: '#FF5733',
        nullable: true,
      },
    },
    nullable: true,
  })
  profile: {
    nickname: string;
    comment: string | null;
    headerId: number | null;
    bodyId: number | null;
    headerColor: string | null;
    bodyColor: string | null;
  } | null;

  @Expose()
  @ApiProperty({
    description: '친구 초대 코드',
    example: 'ABC123XYZ',
    type: String,
    nullable: true,
  })
  inviteCode: string | null;

  @Expose()
  @ApiProperty({
    description: '대기 중인 친구 요청 수',
    example: 3,
    type: Number,
  })
  pendingFriendRequestCount: number;

  static fromDto(dto: UserProfileWithInviteDto): UserProfileWithInviteResponseDto {
    return plainToInstance(
      UserProfileWithInviteResponseDto,
      {
        userId: dto.userId,
        email: dto.email,
        name: dto.name,
        profile: dto.profile
          ? {
              nickname: dto.profile.nickname,
              comment: dto.profile.comment,
              headerId: dto.profile.headerId,
              bodyId: dto.profile.bodyId,
              headerColor: dto.profile.headerColor,
              bodyColor: dto.profile.bodyColor,
            }
          : null,
        inviteCode: dto.inviteCode,
        pendingFriendRequestCount: dto.pendingFriendRequestCount,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
