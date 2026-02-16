import { ApiProperty } from '@nestjs/swagger';
import { ReviewQuestionOptionEntity } from 'src/review/domain/entities/review-question-option.entity';

export class ReviewQuestionOptionResponseDto {
  @ApiProperty({ description: '선택지 ID', example: 1, type: Number })
  id: number;

  @ApiProperty({ description: '질문 ID', example: 1, type: Number })
  questionId: number;

  @ApiProperty({ description: '선택지 내용', example: '매우 깨끗해요', type: String })
  content: string;

  @ApiProperty({ description: '사용자 태그 라벨', example: '청결왕', type: String })
  userTagLabel: string;

  @ApiProperty({ description: '정렬 순서', example: 1, type: Number })
  sortOrder: number;

  @ApiProperty({ description: '활성 상태', example: true, type: Boolean })
  isActive: boolean;

  @ApiProperty({ description: '생성일', example: '2026-02-16T12:00:00Z', type: Date })
  createdAt: Date;

  @ApiProperty({ description: '수정일', example: '2026-02-16T12:00:00Z', type: Date })
  updatedAt: Date;

  static fromEntity(entity: ReviewQuestionOptionEntity): ReviewQuestionOptionResponseDto {
    const response = new ReviewQuestionOptionResponseDto();
    response.id = entity.id;
    response.questionId = entity.questionId;
    response.content = entity.content;
    response.userTagLabel = entity.userTagLabel;
    response.sortOrder = entity.sortOrder;
    response.isActive = entity.isActive;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    return response;
  }
}
