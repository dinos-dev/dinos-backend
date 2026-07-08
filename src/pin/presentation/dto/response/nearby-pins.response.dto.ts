import { ApiProperty } from '@nestjs/swagger';
// import { PinType } from 'src/pin/domain/const/pin.enum';
import { PinWithRestaurantDto } from 'src/pin/application/dto/pin-with-restaurant.dto';

export class NearbyPinResponseDto {
  @ApiProperty({ description: '핀 ID', example: 1, type: Number })
  pinId: number;

  @ApiProperty({ description: '레스토랑 ID', example: 10, type: Number })
  restaurantId: number;

  @ApiProperty({ description: '레스토랑 이름', example: '맛집', type: String })
  restaurantName: string;

  @ApiProperty({ description: '위도', example: 37.5665, type: Number })
  latitude: number;

  @ApiProperty({ description: '경도', example: 126.978, type: Number })
  longitude: number;

  @ApiProperty({ description: '주소', example: '서울특별시 강남구', type: String })
  address: string;

  @ApiProperty({ description: '카테고리', example: '한식', nullable: true, type: String })
  category: string | null;

  @ApiProperty({ description: '사용자로부터 거리 (km)', example: 1.5, type: Number })
  distanceKm: number;

  // @ApiProperty({ description: '핀 타입', enum: PinType, example: PinType.PLANNED })
  // pinType: PinType;

  @ApiProperty({ description: '핀 생성일', example: '2026-01-28T12:00:00Z', type: Date })
  pinnedAt: Date;

  @ApiProperty({
    description: '가게 대표 썸네일 이미지 URL (없으면 null)',
    example: 'https://cdn.dinos.com/restaurants/10/primary.jpg',
    nullable: true,
    type: String,
  })
  primaryImageUrl: string | null;

  @ApiProperty({
    description: '내가 이 가게에 작성한 최신 리뷰 내용 (없으면 null)',
    example: '분위기 좋고 재방문 의사 있음',
    nullable: true,
    type: String,
  })
  myReviewContent: string | null;

  @ApiProperty({ description: '이 가게를 나와 동일하게 핀한 친구 수', example: 3, type: Number })
  friendPinCount: number;

  static fromDto(dto: PinWithRestaurantDto): NearbyPinResponseDto {
    const response = new NearbyPinResponseDto();
    response.pinId = dto.pinId;
    response.restaurantId = dto.restaurantId;
    response.restaurantName = dto.restaurantName;
    response.latitude = dto.latitude;
    response.longitude = dto.longitude;
    response.address = dto.address;
    response.category = dto.category;
    response.distanceKm = dto.distanceKm;
    // response.pinType = dto.pinType;
    response.pinnedAt = dto.pinnedAt;
    response.primaryImageUrl = dto.primaryImageUrl;
    response.myReviewContent = dto.myReviewContent;
    response.friendPinCount = dto.friendPinCount;
    return response;
  }
}
