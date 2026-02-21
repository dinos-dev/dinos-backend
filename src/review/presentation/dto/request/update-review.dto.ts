import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CreateReviewAnswerDto, CreateReviewImageDto } from './create-review.dto';

export class UpdateReviewDto {
  @IsOptional()
  @IsString()
  @MaxLength(400)
  @ApiPropertyOptional({
    description: '서술형 리뷰 (null 전달 시 내용 삭제)',
    example: '두 번째 방문인데도 여전히 맛있었어요!',
    nullable: true,
    maxLength: 400,
    type: String,
  })
  content?: string | null;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: '추천 희망 여부',
    example: false,
    type: Boolean,
  })
  wantRecommendation?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReviewAnswerDto)
  @ApiPropertyOptional({
    description: '답변 목록 (제공 시 기존 답변 전체 교체. 생략 시 기존 답변 유지)',
    type: [CreateReviewAnswerDto],
  })
  answers?: CreateReviewAnswerDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReviewImageDto)
  @ApiPropertyOptional({
    description:
      '이미지 목록 (제공 시 기존 이미지 전체 교체. 생략 시 기존 이미지 유지. 첨부 시 isPrimary: true 1개 필수)',
    type: [CreateReviewImageDto],
  })
  images?: CreateReviewImageDto[];
}
