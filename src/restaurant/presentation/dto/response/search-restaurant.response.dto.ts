import { ApiProperty } from '@nestjs/swagger';
import { RestaurantSearchResult } from 'src/restaurant/application/dto/restaurant-search.result';

export class SearchRestaurantResponseDto {
  @ApiProperty({ description: '레스토랑 ID', example: 10, type: Number })
  id: number;

  @ApiProperty({ description: '가게명', example: '서래돈까스', type: String })
  name: string;

  @ApiProperty({ description: '주소', example: '서울특별시 강남구 ...', type: String })
  address: string;

  @ApiProperty({ description: '위도', example: 37.5046, type: Number })
  latitude: number;

  @ApiProperty({ description: '경도', example: 127.0301, type: Number })
  longitude: number;

  @ApiProperty({ description: '카테고리', example: '돈까스', nullable: true, type: String })
  category: string | null;

  @ApiProperty({ description: '대표 이미지 URL', example: 'https://example.com/img.jpg', nullable: true, type: String })
  primaryImageUrl: string | null;

  @ApiProperty({ description: '검색 기준 좌표와의 거리(km)', example: 0.42, type: Number })
  distanceKm: number;

  static fromDto(dto: RestaurantSearchResult): SearchRestaurantResponseDto {
    const response = new SearchRestaurantResponseDto();
    response.id = dto.id;
    response.name = dto.name;
    response.address = dto.address;
    response.latitude = dto.latitude;
    response.longitude = dto.longitude;
    response.category = dto.category;
    response.primaryImageUrl = dto.primaryImageUrl;
    response.distanceKm = dto.distanceKm;
    return response;
  }
}
