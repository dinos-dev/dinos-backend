import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsLatitude, IsLongitude, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { PinType } from 'src/pin/domain/const/pin.enum';

export class NearbyPinsQueryDto {
  @ApiProperty({ description: '사용자 현재 위도', example: 37.506495, type: Number })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  userLat: number;

  @ApiProperty({ description: '사용자 현재 경도', example: 126.715521, type: Number })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  userLng: number;

  @ApiProperty({ description: '프론트엔드 화면 비율의 최소 위도 ', example: 37.1285, type: Number })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  minLat: number;

  @ApiProperty({ description: '프론트엔드 화면 비율의 최대 위도 ', example: 37.8857, type: Number })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  maxLat: number;

  @ApiProperty({ description: '프론트엔드 화면 비율의 최소 경도 ', example: 126.5019, type: Number })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  minLng: number;

  @ApiProperty({ description: '프론트엔드 화면 비율의 최대 경도 ', example: 126.8438, type: Number })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  maxLng: number;

  @ApiPropertyOptional({ description: '조회 개수 제한 (기본값: 50, 최대: 1000)', example: 50, type: Number })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 50;

  @ApiPropertyOptional({ description: '핀 타입 필터', enum: PinType, example: PinType.PLANNED })
  @IsOptional()
  @IsEnum(PinType)
  type?: PinType;
}
