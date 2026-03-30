import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { RecommendedRestaurantDto } from 'src/recommendation/application/dto/recommended-restaurant.dto';

export class RecommendationResponseDto {
  @ApiProperty({ description: '식당 ID', example: 105, type: Number })
  @Expose()
  restaurantId: number;

  @ApiProperty({ description: 'ML 추천 점수 (내림차순)', example: 1.4523, type: Number })
  @Expose()
  score: number;

  @ApiProperty({ description: '식당 이름', example: '맛있는 한식당', type: String })
  @Expose()
  name: string;

  @ApiProperty({ description: '주소', example: '서울특별시 강남구 테헤란로 123', type: String })
  @Expose()
  address: string;

  @ApiProperty({ description: '위도', example: 37.5665, type: Number })
  @Expose()
  latitude: number;

  @ApiProperty({ description: '경도', example: 126.978, type: Number })
  @Expose()
  longitude: number;

  @ApiProperty({ description: '카테고리', example: '한식', nullable: true, type: String })
  @Expose()
  category: string | null;

  @ApiProperty({ description: '대표 이미지 URL', example: 'https://...', nullable: true, type: String })
  @Expose()
  primaryImageUrl: string | null;

  static fromDto(dto: RecommendedRestaurantDto): RecommendationResponseDto {
    const response = new RecommendationResponseDto();
    response.restaurantId = dto.restaurantId;
    response.score = dto.score;
    response.name = dto.name;
    response.address = dto.address;
    response.latitude = dto.latitude;
    response.longitude = dto.longitude;
    response.category = dto.category;
    response.primaryImageUrl = dto.primaryImageUrl;
    return response;
  }
}
