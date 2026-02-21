import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReviewQuestionOptionDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '선택지 내용',
    example: '매우 깨끗해요',
    required: true,
  })
  content: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '사용자 태그 라벨',
    example: '청결왕',
    required: true,
  })
  userTagLabel: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: '선택지 정렬 순서',
    example: 1,
    required: true,
  })
  sortOrder: number;
}
