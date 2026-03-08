import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { SharedPinsDto } from 'src/friendship/application/dto/shared-pins.dto';

export class SharedPinFriendProfileResponseDto {
  constructor(partial: Partial<SharedPinFriendProfileResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty({ description: '닉네임', example: '레드 다이노' })
  nickname: string;

  @Expose()
  @ApiProperty({ description: '프로필 소개', example: '맛집 탐방 중', nullable: true })
  comment: string | null;

  @Expose()
  @ApiProperty({ description: '헤더 ID', example: 3, nullable: true })
  headerId: number | null;

  @Expose()
  @ApiProperty({ description: '바디 ID', example: 4, nullable: true })
  bodyId: number | null;

  @Expose()
  @ApiProperty({ description: '헤더 색상', example: '#67F7D2', nullable: true })
  headerColor: string | null;

  @Expose()
  @ApiProperty({ description: '바디 색상', example: '#644909', nullable: true })
  bodyColor: string | null;
}

export class SharedPinFriendResponseDto {
  constructor(partial: Partial<SharedPinFriendResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty({ description: '친구 userId', example: 10 })
  userId: number;

  @Expose()
  @ApiProperty({ description: '친구 프로필 정보', type: SharedPinFriendProfileResponseDto, nullable: true })
  profile: SharedPinFriendProfileResponseDto | null;
}

export class SharedPinRestaurantResponseDto {
  constructor(partial: Partial<SharedPinRestaurantResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty({ description: '음식점 ID', example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ description: '음식점 이름', example: '맛있는 식당' })
  name: string;

  @Expose()
  @ApiProperty({ description: '음식점 주소', example: '서울시 강남구 테헤란로 123' })
  address: string;

  @Expose()
  @ApiProperty({ description: '음식점 위도', example: 37.5665 })
  latitude: number;

  @Expose()
  @ApiProperty({ description: '음식점 경도', example: 126.978 })
  longitude: number;

  @Expose()
  @ApiProperty({ description: '카테고리', example: '한식', nullable: true })
  category: string | null;

  @Expose()
  @ApiProperty({ description: '대표 이미지 URL', example: 'https://...', nullable: true })
  primaryImageUrl: string | null;
}

export class SharedPinsResponseDto {
  constructor(partial: Partial<SharedPinsResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty({ description: '음식점 정보', type: SharedPinRestaurantResponseDto })
  restaurant: SharedPinRestaurantResponseDto;

  @Expose()
  @ApiProperty({ description: '같은 음식점을 pin한 친구 목록', type: [SharedPinFriendResponseDto] })
  friends: SharedPinFriendResponseDto[];

  static fromResult(dto: SharedPinsDto): SharedPinsResponseDto {
    return plainToInstance(
      SharedPinsResponseDto,
      {
        restaurant: plainToInstance(SharedPinRestaurantResponseDto, dto.restaurant, {
          excludeExtraneousValues: true,
        }),
        friends: dto.friends.map((friend) =>
          plainToInstance(
            SharedPinFriendResponseDto,
            {
              userId: friend.userId,
              profile: friend.profile
                ? plainToInstance(SharedPinFriendProfileResponseDto, friend.profile, {
                    excludeExtraneousValues: true,
                  })
                : null,
            },
            { excludeExtraneousValues: true },
          ),
        ),
      },
      { excludeExtraneousValues: true },
    );
  }
}
