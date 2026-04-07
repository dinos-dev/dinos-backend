import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { RecommendedRestaurantDto } from 'src/recommendation/application/dto/recommended-restaurant.dto';

export class SourceUserProfileResponseDto {
  @ApiProperty({ description: '닉네임', example: '맛집탐험가', type: String })
  @Expose()
  nickname: string;

  @ApiProperty({ description: '프로필 소개', example: '맛있는 걸 찾아다닙니다', nullable: true, type: String })
  @Expose()
  comment: string | null;

  @ApiProperty({ description: '헤더 ID', example: 3, nullable: true, type: Number })
  @Expose()
  headerId: number | null;

  @ApiProperty({ description: '바디 ID', example: 4, nullable: true, type: Number })
  @Expose()
  bodyId: number | null;

  @ApiProperty({ description: '헤더 색상', example: '#67F7D2', nullable: true, type: String })
  @Expose()
  headerColor: string | null;

  @ApiProperty({ description: '바디 색상', example: '#644909', nullable: true, type: String })
  @Expose()
  bodyColor: string | null;
}

export class RecommendationResponseDto {
  @ApiProperty({ description: '식당 ID', example: 105, type: Number })
  @Expose()
  restaurantId: number;

  @ApiProperty({ description: 'ML 추천 점수 (내림차순)', example: 0.4723, type: Number })
  @Expose()
  score: number;

  @ApiProperty({ description: 'ML match rate', example: 0.7212, type: Number })
  @Expose()
  matchRate: number;

  @ApiProperty({ description: '추천 기반이 된 사용자 ID', example: 6, type: Number })
  @Expose()
  sourceUserId: number;

  @ApiProperty({ description: '추천 기반이 된 리뷰 ID', example: 10, type: Number })
  @Expose()
  sourceReviewId: number;

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

  @ApiProperty({ description: '추천 기반 사용자 프로필', type: SourceUserProfileResponseDto, nullable: true })
  @Expose()
  sourceUserProfile: SourceUserProfileResponseDto | null;

  static fromDto(dto: RecommendedRestaurantDto): RecommendationResponseDto {
    const response = new RecommendationResponseDto();
    response.restaurantId = dto.restaurantId;
    response.score = dto.score;
    response.matchRate = dto.matchRate;
    response.sourceUserId = dto.sourceUserId;
    response.sourceReviewId = dto.sourceReviewId;
    response.name = dto.name;
    response.address = dto.address;
    response.latitude = dto.latitude;
    response.longitude = dto.longitude;
    response.category = dto.category;
    response.primaryImageUrl = dto.primaryImageUrl;
    response.sourceUserProfile = dto.sourceUserProfile ?? null;
    return response;
  }
}
