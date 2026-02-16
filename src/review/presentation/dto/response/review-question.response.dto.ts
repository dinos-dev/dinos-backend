import { ApiProperty } from '@nestjs/swagger';
import { ReviewStep } from 'src/review/domain/const/review.enum';
import { ReviewQuestionEntity } from 'src/review/domain/entities/review-question.entity';

export class ReviewQuestionResponseDto {
  @ApiProperty({ description: '질문 ID', example: 1, type: Number })
  id: number;

  @ApiProperty({ description: '리뷰 단계', example: 'ENTRY', enum: ReviewStep })
  step: ReviewStep;

  @ApiProperty({ description: '질문 내용', example: '매장 청결도는 어떤가요?', type: String })
  content: string;

  @ApiProperty({ description: '활성 상태', example: true, type: Boolean })
  isActive: boolean;

  @ApiProperty({ description: '정렬 순서', example: 1, type: Number })
  sortOrder: number;

  @ApiProperty({ description: '생성일', example: '2026-02-16T12:00:00Z', type: Date })
  createdAt: Date;

  @ApiProperty({ description: '수정일', example: '2026-02-16T12:00:00Z', type: Date })
  updatedAt: Date;

  static fromEntity(entity: ReviewQuestionEntity): ReviewQuestionResponseDto {
    const response = new ReviewQuestionResponseDto();
    response.id = entity.id;
    response.step = entity.step;
    response.content = entity.content;
    response.isActive = entity.isActive;
    response.sortOrder = entity.sortOrder;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}
