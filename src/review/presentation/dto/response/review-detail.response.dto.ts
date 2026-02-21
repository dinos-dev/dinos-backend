import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStep } from 'src/review/domain/const/review.enum';
import {
  ReviewDetailEntity,
  ReviewDetailImageData,
  ReviewDetailOptionData,
  ReviewDetailQuestionData,
  ReviewDetailStepData,
  ReviewDetailUserAnswerData,
} from 'src/review/domain/entities/review-detail.entity';

export class ReviewDetailOptionResponseDto {
  @ApiProperty({ description: '선택지 ID', example: 3 })
  id: number;

  @ApiProperty({ description: '선택지 내용', example: '맛집 탐방' })
  content: string;

  @ApiProperty({ description: '정렬 순서', example: 0 })
  sortOrder: number;

  static from(data: ReviewDetailOptionData): ReviewDetailOptionResponseDto {
    const dto = new ReviewDetailOptionResponseDto();
    dto.id = data.id;
    dto.content = data.content;
    dto.sortOrder = data.sortOrder;
    return dto;
  }
}

export class ReviewDetailQuestionResponseDto {
  @ApiProperty({ description: '질문 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '질문 내용', example: '방문 전 어떤 기대를 가지고 가셨나요?' })
  content: string;

  @ApiProperty({ description: '선택지 목록', type: [ReviewDetailOptionResponseDto] })
  options: ReviewDetailOptionResponseDto[];

  static from(data: ReviewDetailQuestionData): ReviewDetailQuestionResponseDto {
    const dto = new ReviewDetailQuestionResponseDto();
    dto.id = data.id;
    dto.content = data.content;
    dto.options = data.options.map(ReviewDetailOptionResponseDto.from);
    return dto;
  }
}

export class ReviewDetailUserAnswerResponseDto {
  @ApiPropertyOptional({ description: '선택한 선택지 ID (skip 시 null)', example: 4, nullable: true })
  optionId: number | null;

  @ApiPropertyOptional({ description: '직접 입력 답변 (skip 시 null)', example: '편안한 가정집', nullable: true })
  customAnswer: string | null;

  static from(data: ReviewDetailUserAnswerData): ReviewDetailUserAnswerResponseDto {
    const dto = new ReviewDetailUserAnswerResponseDto();
    dto.optionId = data.optionId;
    dto.customAnswer = data.customAnswer;
    return dto;
  }
}

export class ReviewDetailStepResponseDto {
  @ApiProperty({ description: '단계', enum: ReviewStep, example: ReviewStep.BEFORE_ENTRY })
  step: ReviewStep;

  @ApiProperty({ description: '해당 단계의 질문 및 선택지', type: ReviewDetailQuestionResponseDto })
  question: ReviewDetailQuestionResponseDto;

  @ApiProperty({
    description: '사용자의 기존 답변 (skip 시 optionId, customAnswer 모두 null)',
    type: ReviewDetailUserAnswerResponseDto,
  })
  userAnswer: ReviewDetailUserAnswerResponseDto;

  static from(data: ReviewDetailStepData): ReviewDetailStepResponseDto {
    const dto = new ReviewDetailStepResponseDto();
    dto.step = data.step;
    dto.question = ReviewDetailQuestionResponseDto.from(data.question);
    dto.userAnswer = ReviewDetailUserAnswerResponseDto.from(data.userAnswer);
    return dto;
  }
}

export class ReviewDetailImageResponseDto {
  @ApiProperty({ description: '이미지 URL', example: 'https://cdn.example.com/reviews/image.jpg' })
  imageUrl: string;

  @ApiProperty({ description: '대표 이미지 여부', example: true })
  isPrimary: boolean;

  @ApiProperty({ description: '정렬 순서', example: 0 })
  sortOrder: number;

  static from(data: ReviewDetailImageData): ReviewDetailImageResponseDto {
    const dto = new ReviewDetailImageResponseDto();
    dto.imageUrl = data.imageUrl;
    dto.isPrimary = data.isPrimary;
    dto.sortOrder = data.sortOrder;
    return dto;
  }
}

export class ReviewDetailResponseDto {
  @ApiProperty({ description: '리뷰 ID', example: 10 })
  id: number;

  @ApiPropertyOptional({ description: '서술형 리뷰', example: '분위기도 좋고 음식도 맛있었어요!', nullable: true })
  content: string | null;

  @ApiProperty({ description: '추천 희망 여부', example: true })
  wantRecommendation: boolean;

  @ApiProperty({ description: '리뷰 작성일시', example: '2026-02-21T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '가게 이름', example: '유키돈까스' })
  restaurantName: string;

  @ApiProperty({ description: '가게 주소', example: '서울특별시 강남구 역삼동 123-456' })
  restaurantAddress: string;

  @ApiProperty({
    description: '단계별 질문 및 답변 목록 (BEFORE_ENTRY → ENTRY → ORDER → MEAL → WRAP_UP 순)',
    type: [ReviewDetailStepResponseDto],
  })
  steps: ReviewDetailStepResponseDto[];

  @ApiProperty({ description: '이미지 목록', type: [ReviewDetailImageResponseDto] })
  images: ReviewDetailImageResponseDto[];

  static from(entity: ReviewDetailEntity): ReviewDetailResponseDto {
    const dto = new ReviewDetailResponseDto();
    dto.id = entity.id;
    dto.content = entity.content;
    dto.wantRecommendation = entity.wantRecommendation;
    dto.createdAt = entity.createdAt;
    dto.restaurantName = entity.restaurantName;
    dto.restaurantAddress = entity.restaurantAddress;
    dto.steps = entity.steps.map(ReviewDetailStepResponseDto.from);
    dto.images = entity.images.map(ReviewDetailImageResponseDto.from);
    return dto;
  }
}
