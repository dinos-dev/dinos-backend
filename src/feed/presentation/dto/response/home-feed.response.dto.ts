import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Feed } from 'src/feed/domain/entities/feed.entity';

export class HomeFeedResponseDto {
  @Expose()
  @ApiProperty({
    description: '홈 피드의 고유 아이디',
    example: 'home-feed-12345',
    type: String,
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: '크롤링된 InputKeyWord 기반 AI로 생성된 제목',
    example: '한남동 브런치 느낌 있잖아',
    type: String,
  })
  title: string;

  @Expose()
  @ApiProperty({
    description: '홈 피드에서 AI가 선별한 음식점 리스트 5가지에 대한, 데이터 셋(음식점 이름, 요약본, 이미지 경로값 )',
    example: [
      {
        storeName: '한남동 브런치 카페',
        summary: '아늑한 분위기의 브런치 카페로, 다양한 메뉴와 디저트를 제공합니다.',
        imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      },
    ],
    type: 'array',
  })
  sections: {
    storeName: string;
    summary: string;
    imageUrls: string[];
  }[];

  // 도메인 Feed 객체를 받아서 HomeFeedResponseDto로 변환
  static fromDomain(feed: Feed): HomeFeedResponseDto {
    const dto = new HomeFeedResponseDto();
    dto.id = feed.getId();
    dto.title = feed.getTitle();

    // 도메인의 Section 배열 중 필요한 필드만 매핑
    dto.sections = feed.getSections().map((section) => ({
      storeName: section.storeName,
      summary: section.summary,
      imageUrls: section.imageUrls,
    }));

    return dto;
  }
}
