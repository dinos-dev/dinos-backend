import { ApiProperty } from '@nestjs/swagger';
import { ReviewStep } from 'src/review/domain/const/review.enum';
import { ReviewQuestionWithOptionsEntity } from 'src/review/domain/entities/review-question-with-options.entity';

export class ReviewFormOptionResponseDto {
  @ApiProperty({ description: '선택지 ID', example: 1, type: Number })
  id: number;

  @ApiProperty({ description: '선택지 내용', example: '거의 없었어요', type: String })
  content: string;

  @ApiProperty({ description: '정렬 순서', example: 1, type: Number })
  sortOrder: number;
}

export class ReviewFormQuestionResponseDto {
  @ApiProperty({ description: '질문 ID', example: 1, type: Number })
  id: number;

  @ApiProperty({ description: '질문 내용', example: '대기 시간은 어땠나요?', type: String })
  content: string;

  @ApiProperty({ description: '선택지 목록', type: [ReviewFormOptionResponseDto] })
  options: ReviewFormOptionResponseDto[];
}

export class ReviewFormStepResponseDto {
  @ApiProperty({ description: '리뷰 단계', enum: ReviewStep, example: 'BEFORE_ENTRY' })
  step: ReviewStep;

  @ApiProperty({
    description: '해당 단계의 질문 (질문이 없는 경우 null)',
    type: ReviewFormQuestionResponseDto,
    nullable: true,
  })
  question: ReviewFormQuestionResponseDto | null;
}

export class ReviewFormQuestionsResponseDto {
  @ApiProperty({ description: '단계별 질문 목록 (5단계)', type: [ReviewFormStepResponseDto] })
  steps: ReviewFormStepResponseDto[];

  static from(
    data: { step: ReviewStep; question: ReviewQuestionWithOptionsEntity | null }[],
  ): ReviewFormQuestionsResponseDto {
    const response = new ReviewFormQuestionsResponseDto();

    response.steps = data.map(({ step, question }) => {
      const stepDto = new ReviewFormStepResponseDto();
      stepDto.step = step;

      if (!question) {
        stepDto.question = null;
        return stepDto;
      }

      const questionDto = new ReviewFormQuestionResponseDto();
      questionDto.id = question.id;
      questionDto.content = question.content;
      questionDto.options = question.options.map((opt) => {
        const optDto = new ReviewFormOptionResponseDto();
        optDto.id = opt.id;
        optDto.content = opt.content;
        optDto.sortOrder = opt.sortOrder;
        return optDto;
      });

      stepDto.question = questionDto;
      return stepDto;
    });

    return response;
  }
}
