import { Expose, plainToInstance, Type } from 'class-transformer';
import { ResponseBookmarkDto } from './response.bookmark.dto';
import { ApiProperty } from '@nestjs/swagger';
import { BookmarkEntity } from 'src/bookmark/domain/entity/bookmark.entity';

export class ResponseToggleBookmarkDto {
  constructor(partial: Partial<ResponseToggleBookmarkDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @Type(() => ResponseBookmarkDto)
  @ApiProperty({
    description: '북마크 정보',
    type: ResponseBookmarkDto,
  })
  bookmark: ResponseBookmarkDto;

  @Expose()
  @ApiProperty({
    description: '북마크 생성 또는 제거 액션',
    example: 'create',
    enum: ['create', 'delete'],
  })
  action: 'create' | 'delete';

  static fromResult(result: { bookmark: BookmarkEntity; action: 'create' | 'delete' }): ResponseToggleBookmarkDto {
    return plainToInstance(
      ResponseToggleBookmarkDto,
      {
        bookmark: {
          id: result.bookmark.id,
          userId: result.bookmark.userId,
          itemType: result.bookmark.itemType,
          feedRefId: result.bookmark.feedRefId,
          restaurantRefId: result.bookmark.getRestaurantRefId(),
          itemName: result.bookmark.itemName,
          itemImageUrl: result.bookmark.itemImageUrl,
          itemSub: result.bookmark.itemSub,
          createdAt: result.bookmark.createdAt,
        },
        action: result.action,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
