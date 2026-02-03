import { ApiProperty } from '@nestjs/swagger';
import { PinType } from 'src/pin/domain/const/pin.enum';
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

  @ApiProperty({ description: '핀 타입', enum: PinType, example: PinType.PLANNED })
  pinType: PinType;

  @ApiProperty({ description: '핀 생성일', example: '2026-01-28T12:00:00Z', type: Date })
  pinnedAt: Date;

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
    response.pinType = dto.pinType;
    response.pinnedAt = dto.pinnedAt;
    return response;
  }
}
