import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ItemType } from 'src/bookmark/domain/const/item-type.enum';

export class ToggleBookmarkDto {
  @IsNotEmpty()
  @IsEnum(ItemType)
  @ApiProperty({
    description: '북마크 타입 ( FEED, RESTAURANT )',
    example: 'FEED',
    required: true,
    enum: ItemType,
  })
  itemType: ItemType;

  @IsNotEmpty()
  @IsString()
  @Length(1, 24)
  @ApiProperty({
    description: '북마크 참조 ID',
    example: '87e17540e',
    required: true,
  })
  feedRefId: string;

  @IsOptional()
  @IsString()
  @Length(1, 24)
  @ApiProperty({
    description: '북마크 대상이 RESTAURANT인 경우 해당 Restaurant의 고유 아이디',
    example: 'sc37e17540e',
    required: false,
  })
  restaurantRefId?: string | null;

  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: '북마크한 아이템의 이름 ( FEED -> Feed의 제목  | RESTAURANT ->  Restaurant의 제목  )',
    example: '한남동 브런치 느낌 있잖아',
    required: true,
  })
  itemName: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description:
      '썸내일 이미지 URL ( FEED -> Feed의 썸내일 이미지 URL  | RESTAURANT ->  Restaurant의 썸내일 이미지 URL  )',
    example: 'https://example.com/thumbnail.jpg',
    required: false,
  })
  itemImageUrl?: string | null;

  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: 'FEED -> 에디터 이름 | RESTAURANT ->  Restaurant의 요약본',
    example: '핫 다이노',
    required: true,
  })
  itemSub: string;
}
