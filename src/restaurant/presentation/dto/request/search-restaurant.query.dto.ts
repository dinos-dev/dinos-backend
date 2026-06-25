import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsLatitude, IsLongitude, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

/**
 * 사용자 좌표 기반 음식점 키워드 검색 쿼리
 * - 현재 사용자 위치 또는 지도 중심 좌표를 기준으로 반경 내 식당명을 검색한다.
 */
export class SearchRestaurantQueryDto {
  @ApiProperty({ description: '검색 기준 위도', example: 37.506495, type: Number })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude: number;

  @ApiProperty({ description: '검색 기준 경도', example: 126.715521, type: Number })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude: number;

  @ApiProperty({
    description: '검색 키워드 (가게명 부분일치)',
    example: '돈까스',
    type: String,
    maxLength: 50,
    minLength: 1,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  keyword: string;

  @ApiPropertyOptional({
    description: '검색 반경 미터 단위 (기본값: 10000, 최대: 50000) optional',
    example: 10000,
    type: Number,
    minimum: 100,
    maximum: 50000,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(50000)
  radiusMeters?: number = 10000;

  @ApiPropertyOptional({
    description: '조회 개수 제한 (기본값: 50, 최대: 100)',
    example: 50,
    type: Number,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
