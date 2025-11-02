import { ApiProperty } from '@nestjs/swagger';
import { ItemType } from '@prisma/client';
import { Expose, plainToInstance } from 'class-transformer';
import { PaginatedResponseDto } from 'src/common/dto/pagination.dto';

export class ResponseBookmarkDto {
  constructor(partial: Partial<ResponseBookmarkDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty({
    description: '북마크 ID',
    example: 1,
    type: Number,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '유저 ID',
    example: 1,
    type: Number,
  })
  userId: number;

  @Expose()
  @ApiProperty({
    description: '북마크 타입 ( FEED, RESTAURANT )',
    example: 'FEED',
    type: String,
    enum: ItemType,
  })
  itemType: ItemType;

  @Expose()
  @ApiProperty({
    description: '북마크 참조 ID',
    example: '87e17540e',
    type: String,
  })
  feedRefId: string;

  @Expose()
  @ApiProperty({
    description: '북마크 대상이 RESTAURANT인 경우 해당 Restaurant의 고유 아이디',
    example: 'sc37e17540e',
    type: String,
  })
  restaurantRefId: string;

  @Expose()
  @ApiProperty({
    description: '북마크한 아이템의 이름 ( FEED -> Feed의 제목  | RESTAURANT ->  Restaurant의 제목  )',
    example: '한남동 브런치 느낌 있잖아',
    type: String,
  })
  itemName: string;

  @Expose()
  @ApiProperty({
    description:
      '썸내일 이미지 URL ( FEED -> Feed의 썸내일 이미지 URL  | RESTAURANT ->  Restaurant의 썸내일 이미지 URL  )',
    example: 'https://example.com/thumbnail.jpg',
    type: String,
  })
  itemImageUrl: string;

  @Expose()
  @ApiProperty({
    description: 'FEED -> 에디터 이름 | RESTAURANT ->  Restaurant의 요약본',
    example: '핫 다이노',
    type: String,
  })
  itemSub: string;

  @Expose()
  @ApiProperty({
    description: '북마크 생성 시간',
    example: '2025-01-01T00:00:00.000Z',
    type: Date,
  })
  createdAt: Date;
}

export class PaginatedBookmarkResponseDto extends PaginatedResponseDto<ResponseBookmarkDto> {
  constructor(partial: Partial<PaginatedBookmarkResponseDto>) {
    super(partial);
  }

  @Expose()
  @ApiProperty({
    description: '북마크 목록',
    type: [ResponseBookmarkDto],
  })
  data: ResponseBookmarkDto[];

  @Expose()
  @ApiProperty({
    description: '페이지네이션 메타데이터',
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  static fromBookmarkResult(result: {
    data: Array<{
      id: number;
      userId: number;
      itemType: ItemType;
      feedRefId: string;
      restaurantRefId: string;
      itemName: string;
      itemImageUrl: string;
      itemSub: string;
      createdAt: Date;
    }>;
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }): PaginatedBookmarkResponseDto {
    const mappedData = result.data.map((item) =>
      plainToInstance(ResponseBookmarkDto, {
        id: item.id,
        userId: item.userId,
        itemType: item.itemType,
        feedRefId: item.feedRefId,
        restaurantRefId: item.restaurantRefId,
        itemName: item.itemName,
        itemImageUrl: item.itemImageUrl,
        itemSub: item.itemSub,
        createdAt: item.createdAt,
      }),
    );

    return plainToInstance(
      PaginatedBookmarkResponseDto,
      {
        data: mappedData,
        meta: result.meta,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
