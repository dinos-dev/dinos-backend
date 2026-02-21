import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MyReviewAnswerData, MyReviewEntity, MyReviewImageData } from 'src/review/domain/entities/my-review.entity';

export class MyReviewAnswerResponseDto {
  @ApiProperty({ description: '질문 ID', example: 1 })
  questionId: number;

  @ApiProperty({ description: '질문 내용', example: '방문 전 어떤 기대를 가지고 가셨나요?' })
  questionContent: string;

  @ApiPropertyOptional({ description: '선택지 ID (객관식 선택 시)', example: 4, nullable: true })
  optionId: number | null;

  @ApiPropertyOptional({ description: '선택지 내용 (객관식 선택 시)', example: '맛집 탐방', nullable: true })
  optionContent: string | null;

  @ApiPropertyOptional({ description: '직접 입력 답변 (주관식 입력 시)', example: '편안한 가정집', nullable: true })
  customAnswer: string | null;

  static from(data: MyReviewAnswerData): MyReviewAnswerResponseDto {
    const dto = new MyReviewAnswerResponseDto();
    dto.questionId = data.questionId;
    dto.questionContent = data.questionContent;
    dto.optionId = data.optionId;
    dto.optionContent = data.optionContent;
    dto.customAnswer = data.customAnswer;
    return dto;
  }
}

export class MyReviewImageResponseDto {
  @ApiProperty({ description: '이미지 URL', example: 'https://cdn.example.com/reviews/image.jpg' })
  imageUrl: string;

  @ApiProperty({ description: '대표 이미지 여부', example: true })
  isPrimary: boolean;

  @ApiProperty({ description: '정렬 순서', example: 0 })
  sortOrder: number;

  static from(data: MyReviewImageData): MyReviewImageResponseDto {
    const dto = new MyReviewImageResponseDto();
    dto.imageUrl = data.imageUrl;
    dto.isPrimary = data.isPrimary;
    dto.sortOrder = data.sortOrder;
    return dto;
  }
}

export class MyReviewResponseDto {
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

  @ApiProperty({ description: '답변 목록', type: [MyReviewAnswerResponseDto] })
  answers: MyReviewAnswerResponseDto[];

  @ApiProperty({ description: '이미지 목록', type: [MyReviewImageResponseDto] })
  images: MyReviewImageResponseDto[];

  static from(entity: MyReviewEntity): MyReviewResponseDto {
    const dto = new MyReviewResponseDto();
    dto.id = entity.id;
    dto.content = entity.content;
    dto.wantRecommendation = entity.wantRecommendation;
    dto.createdAt = entity.createdAt;
    dto.restaurantName = entity.restaurantName;
    dto.restaurantAddress = entity.restaurantAddress;
    dto.answers = entity.answers.map(MyReviewAnswerResponseDto.from);
    dto.images = entity.images.map(MyReviewImageResponseDto.from);
    return dto;
  }
}
