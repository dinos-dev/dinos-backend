import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  registerDecorator,
  ValidateNested,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * optionId와 customAnswer 동시 입력 방지
 * - 둘 다 없음 → 허용 (해당 질문 skip, questionId만 저장)
 * - 하나만 있음 → 허용
 * - 둘 다 있음 → 에러
 */
function IsExclusiveAnswer(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isExclusiveAnswer',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(_: any, args: ValidationArguments): boolean {
          const dto = args.object as CreateReviewAnswerDto;
          const hasOption = dto.optionId != null;
          const hasCustom = dto.customAnswer != null && dto.customAnswer.trim() !== '';
          return !(hasOption && hasCustom);
        },
        defaultMessage(): string {
          return 'optionId와 customAnswer는 동시에 입력할 수 없습니다.';
        },
      },
    });
  };
}

/**
 * images 배열 내 isPrimary: true 항목이 정확히 1개인지 검증
 * 대표 이미지는 1개만 있거나 아예 이미지 자체를 전송해서는 안됨
 */
function HasExactlyOnePrimary(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'hasExactlyOnePrimary',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(images: CreateReviewImageDto[]): boolean {
          if (!images || images.length === 0) return true;
          const primaryCount = images.filter((img) => img.isPrimary === true).length;
          return primaryCount === 1;
        },
        defaultMessage(): string {
          return '이미지를 첨부할 경우 대표 이미지(isPrimary: true)는 반드시 1개여야 합니다.';
        },
      },
    });
  };
}

export class CreateReviewRestaurantDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: '가게 이름 (Naver Place 기반)', example: '유키돈까스', type: String })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '가게 주소 (Naver Place 기반)',
    example: '서울특별시 강남구 역삼동 123-456',
    type: String,
  })
  address: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ description: '가게 위도', example: 37.511281, type: Number })
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ description: '가게 경도', example: 127.005068, type: Number })
  longitude: number;
}

export class CreateReviewAnswerDto {
  @IsNotEmpty()
  @IsInt()
  @IsExclusiveAnswer()
  @ApiProperty({ description: '질문 ID', example: 1, type: Number })
  questionId: number;

  @IsOptional()
  @IsInt()
  @ApiProperty({ description: '선택지 ID (객관식 선택 시)', example: 3, required: false, nullable: true, type: Number })
  optionId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @ApiProperty({
    description: '직접 입력 답변 (주관식 입력 시)',
    example: '분위기가 너무 좋았어요',
    required: false,
    nullable: true,
    maxLength: 200,
    type: String,
  })
  customAnswer?: string;
}

export class CreateReviewImageDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'CDN 이미지 URL (presigned 업로드 완료 후 발급된 URL)',
    example: 'https://cdn.example.com/reviews/image.jpg',
    type: String,
  })
  imageUrl: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ description: '대표 이미지 여부', example: true, type: Boolean })
  isPrimary: boolean;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @ApiProperty({ description: '정렬 순서', example: 0, type: Number })
  sortOrder: number;
}

export class CreateReviewDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateReviewRestaurantDto)
  @ApiProperty({ description: '가게 정보 (Naver Place 기반)', type: CreateReviewRestaurantDto })
  restaurant: CreateReviewRestaurantDto;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  @ApiProperty({
    description: '비정형 서술형 리뷰 (선택)',
    example: '분위기도 좋고 음식도 맛있었어요!',
    required: false,
    nullable: true,
    maxLength: 400,
    type: String,
  })
  content?: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ description: '추천을 받고 싶은지 여부 (개인화 추천 모델 활용)', example: true, type: Boolean })
  wantRecommendation: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReviewAnswerDto)
  @ApiProperty({ description: '단계별 답변 목록 (선택, skip 가능)', type: [CreateReviewAnswerDto], required: false })
  answers?: CreateReviewAnswerDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReviewImageDto)
  @HasExactlyOnePrimary()
  @ApiProperty({
    description: '이미지 목록 (선택, 첨부 시 대표 이미지 1개 필수)',
    type: [CreateReviewImageDto],
    required: false,
  })
  images?: CreateReviewImageDto[];
}
