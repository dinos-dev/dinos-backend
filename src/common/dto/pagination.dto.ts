import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CursorPaginatedResult } from '../types/pagination.types';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: '페이지 번호 (기본값: 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '페이지당 항목 수 (기본값: 20, 최대: 50)',
    example: 20,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}

export class PaginatedResponseMetadataDto {
  @ApiPropertyOptional({ description: '현재 페이지', example: 1 })
  page: number;

  @ApiPropertyOptional({ description: '페이지당 항목 수', example: 20 })
  limit: number;

  @ApiPropertyOptional({ description: '총 항목 수', example: 150 })
  total: number;

  @ApiPropertyOptional({ description: '총 페이지 수', example: 8 })
  totalPages: number;
}

export class PaginatedResponseDto<T> {
  @ApiPropertyOptional({ description: '데이터 배열', type: 'array' })
  data: T[];

  @ApiPropertyOptional({ description: '페이지네이션 메타데이터' })
  meta: PaginatedResponseMetadataDto;

  constructor(partial: Partial<PaginatedResponseDto<T>>) {
    Object.assign(this, partial);
  }

  static fromResult<T, R>(
    result: { data: T[]; meta: { page: number; limit: number; total: number; totalPages: number } },
    dataMapper: (item: T) => R,
  ): PaginatedResponseDto<R> {
    return plainToInstance(
      PaginatedResponseDto<R>,
      {
        data: result.data.map(dataMapper),
        meta: plainToInstance(PaginatedResponseMetadataDto, result.meta),
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}

export class CursorPaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: '커서 (이전 페이지 마지막 항목 ID). 생략 시 첫 페이지 조회',
    example: 42,
    type: Number,
  })
  cursor?: number;
}

export class CursorPaginatedResponseDto<T> {
  @ApiProperty({ description: '데이터 배열', type: 'array' })
  data: T[];

  @ApiPropertyOptional({
    description: '다음 페이지 커서 (다음 요청 시 cursor 파라미터로 전달). null이면 마지막 페이지',
    example: 5,
    nullable: true,
    type: Number,
  })
  nextCursor: number | null;

  @ApiProperty({ description: '다음 페이지 존재 여부', example: true })
  hasNext: boolean;

  static from<TEntity, TDto>(
    result: CursorPaginatedResult<TEntity>,
    mapper: (item: TEntity) => TDto,
  ): CursorPaginatedResponseDto<TDto> {
    const dto = new CursorPaginatedResponseDto<TDto>();
    dto.data = result.data.map(mapper);
    dto.nextCursor = result.nextCursor;
    dto.hasNext = result.hasNext;
    return dto;
  }
}
