import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { PinType } from 'src/pin/domain/const/pin.enum';
import { PinEntity } from 'src/pin/domain/entities/pin.entity';

export class PinResponseDto {
  constructor(partial: Partial<PinResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty({
    description: '핀 ID',
    example: 1,
    type: Number,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '핀 사용자 ID',
    example: 1,
    type: Number,
  })
  userId: number;

  @Expose()
  @ApiProperty({
    description: '핀 가게 ID',
    example: 1,
    type: Number,
  })
  restaurantId: number;

  @Expose()
  @ApiProperty({
    description: '핀 리뷰 ID',
    example: 1,
    type: Number,
  })
  reviewId: number;

  @Expose()
  @ApiProperty({
    description: '핀 타입',
    example: 'PLANNED',
    type: String,
  })
  type: PinType;

  @Expose()
  @ApiProperty({
    description: '핀 생성 시간',
    example: '2021-01-01T00:00:00.000Z',
    type: Date,
  })
  createdAt: Date;

  static fromResult(result: PinEntity): PinResponseDto {
    return plainToInstance(
      PinResponseDto,
      {
        id: result.id,
        userId: result.userId,
        restaurantId: result.restaurantId,
        reviewId: result.reviewId,
        type: result.type,
        createdAt: result.createdAt,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
