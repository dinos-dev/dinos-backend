import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { PaginatedResponseDto } from 'src/common/dto/pagination.dto';

export class FriendProfileResponseDto {
  constructor(partial: Partial<FriendProfileResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty({
    description: '닉네임',
    example: '친구가 지정한 닉네임이 입력',
    type: String,
  })
  nickname: string;

  @Expose()
  @ApiProperty({
    description: '프로필 소개',
    example: '소개를 작성해주세요',
    type: String,
    nullable: true,
  })
  comment: string | null;

  @Expose()
  @ApiProperty({
    description: '헤더 ID',
    example: 3,
    type: Number,
    nullable: true,
  })
  headerId: number | null;

  @Expose()
  @ApiProperty({
    description: '바디 ID',
    example: 4,
    type: Number,
    nullable: true,
  })
  bodyId: number | null;

  @Expose()
  @ApiProperty({
    description: '헤더 색상',
    example: '#67F7D2',
    type: String,
    nullable: true,
  })
  headerColor: string | null;

  @Expose()
  @ApiProperty({
    description: '바디 색상',
    example: '#644909',
    type: String,
    nullable: true,
  })
  bodyColor: string | null;
}

export class FriendWithActivityResponseDto {
  constructor(partial: Partial<FriendWithActivityResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty({
    description: '친구 관계(friendship) ID',
    example: 5,
    type: Number,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '친구의 사용자(userId) ID',
    example: 4,
    type: Number,
  })
  friendUserId: number;

  @Expose()
  @ApiProperty({
    description: '친구 이메일',
    example: 'xxxx@gmail.com',
    type: String,
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: '친구 이름',
    example: '아무개32',
    type: String,
    nullable: true,
  })
  name: string | null;

  @Expose()
  @ApiProperty({
    description: '친구 프로필 정보',
    type: FriendProfileResponseDto,
    nullable: true,
  })
  friendProfile: FriendProfileResponseDto | null;

  @Expose()
  @ApiProperty({
    description: '친구와 함께 활동한 횟수',
    example: 0,
    type: Number,
  })
  activityCount: number;

  static fromResult(data: {
    id: number;
    friendId: number;
    friendEmail: string;
    friendName: string | null;
    friendProfile: {
      nickname: string;
      comment: string | null;
      headerId: number | null;
      bodyId: number | null;
      headerColor: string | null;
      bodyColor: string | null;
    } | null;
    activityCount: number;
  }): FriendWithActivityResponseDto {
    return plainToInstance(
      FriendWithActivityResponseDto,
      {
        id: data.id,
        friendUserId: data.friendId,
        email: data.friendEmail,
        name: data.friendName,
        friendProfile: data.friendProfile ? plainToInstance(FriendProfileResponseDto, data.friendProfile) : null,
        activityCount: data.activityCount,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}

export class PaginatedFriendListResponseDto extends PaginatedResponseDto<FriendWithActivityResponseDto> {
  constructor(partial: Partial<PaginatedFriendListResponseDto>) {
    super(partial);
  }
  @Expose()
  @ApiProperty({
    description: '친구 목록 데이터',
    type: [FriendWithActivityResponseDto],
  })
  data: FriendWithActivityResponseDto[];

  @Expose()
  @ApiProperty({
    description: '페이지네이션 메타데이터',
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  static fromFriendshipResult(result: {
    data: Array<{
      id: number;
      friendUserId: number;
      email: string;
      name: string | null;
      friendProfile: {
        nickname: string;
        comment: string | null;
        headerId: number | null;
        bodyId: number | null;
        headerColor: string | null;
        bodyColor: string | null;
      } | null;
      activityCount: number;
    }>;
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }): PaginatedFriendListResponseDto {
    const mappedData = result.data.map((item) =>
      FriendWithActivityResponseDto.fromResult({
        id: item.id,
        friendId: item.friendUserId,
        friendEmail: item.email,
        friendName: item.name,
        friendProfile: item.friendProfile,
        activityCount: item.activityCount,
      }),
    );

    return plainToInstance(
      PaginatedFriendListResponseDto,
      {
        data: mappedData,
        meta: result.meta,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
