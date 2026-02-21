import { ApiProperty } from '@nestjs/swagger';
import { ReviewQuestionResponseDto } from './review-question.response.dto';

export class ReviewQuestionsBulkResponseDto {
  @ApiProperty({
    description: '생성된 질문 목록',
    type: [ReviewQuestionResponseDto],
  })
  questions: ReviewQuestionResponseDto[];

  @ApiProperty({
    description: '생성된 질문 개수',
    example: 5,
    type: Number,
  })
  totalCreated: number;

  static fromEntities(questions: ReviewQuestionResponseDto[]): ReviewQuestionsBulkResponseDto {
    const response = new ReviewQuestionsBulkResponseDto();
    response.questions = questions;
    response.totalCreated = questions.length;
    return response;
  }
}
