import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ReviewStep } from 'src/review/domain/const/review.enum';
import { CreateReviewQuestionOptionDto } from './create-review-question-option.dto';

export class CreateReviewQuestionDto {
  @IsNotEmpty()
  @IsEnum(ReviewStep)
  @ApiProperty({
    description: '리뷰 단계',
    example: 'ENTRY',
    required: true,
    enum: ReviewStep,
  })
  step: ReviewStep;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '질문 내용',
    example: '매장 청결도는 어떤가요?',
    required: true,
  })
  content: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: '질문 정렬 순서',
    example: 1,
    required: true,
  })
  sortOrder: number;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReviewQuestionOptionDto)
  @ApiProperty({
    description: '질문 선택지 목록',
    type: [CreateReviewQuestionOptionDto],
    required: true,
  })
  options: CreateReviewQuestionOptionDto[];
}
