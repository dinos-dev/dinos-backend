import { ApiProperty } from '@nestjs/swagger';
import { ReviewEntity } from 'src/review/domain/entities/review.entity';

export class CreateReviewResponseDto {
  @ApiProperty({ description: '생성된 리뷰 ID', example: 1, type: Number })
  id: number;

  @ApiProperty({ description: '가게 ID', example: 10, type: Number })
  restaurantId: number;

  @ApiProperty({ description: '생성일', example: '2026-02-20T12:00:00Z', type: Date })
  createdAt: Date;

  static fromEntity(entity: ReviewEntity): CreateReviewResponseDto {
    const dto = new CreateReviewResponseDto();
    dto.id = entity.id;
    dto.restaurantId = entity.restaurantId;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
