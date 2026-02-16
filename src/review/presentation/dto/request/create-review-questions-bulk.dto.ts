import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateReviewQuestionDto } from './create-review-question.dto';

export class CreateReviewQuestionsBulkDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReviewQuestionDto)
  @ApiProperty({
    description: '생성할 질문 목록',
    type: [CreateReviewQuestionDto],
    required: true,
  })
  questions: CreateReviewQuestionDto[];
}
