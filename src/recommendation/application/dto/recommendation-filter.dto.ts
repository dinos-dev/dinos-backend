import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';
import { DistanceFilter } from 'src/recommendation/domain/const/distance-filter.enum';

export class RecommendationFilterDto {
  @ApiPropertyOptional({ description: '카테고리 필터', example: '한식', type: String })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: '거리 필터 옵션 (nearest: 가까운순 정렬만, 숫자: 해당 반경 내 필터 + 가까운순 정렬)',
    enum: DistanceFilter,
    example: DistanceFilter.KM_1,
  })
  @IsOptional()
  @IsEnum(DistanceFilter)
  distance?: DistanceFilter;

  @ApiPropertyOptional({ description: '사용자 위도 (distance 사용 시 필수)', example: 37.5665, type: Number })
  @ValidateIf((o) => o.distance !== undefined)
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ description: '사용자 경도 (distance 사용 시 필수)', example: 126.978, type: Number })
  @ValidateIf((o) => o.distance !== undefined)
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude?: number;
}
