import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class TogglePinDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @ApiProperty({
    description: '핀 토글할 가게의 restaurantId (자체 검색 API가 반환한 값)',
    example: 1024,
    required: true,
  })
  restaurantId: number;
}
