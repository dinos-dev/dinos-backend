import { Feed } from 'src/feed/domain/entities/feed.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class MenuDto {
  @Expose()
  @ApiProperty({ description: '메뉴 이름', example: '비빔밥', type: String })
  name: string;

  @Expose()
  @ApiProperty({ description: '메뉴 가격', example: '10,000원', type: String })
  price: string;
}

export class SectionDto {
  @Expose()
  @ApiProperty({ description: '가게의 참조 Id', example: '68b952d78f23d69589331a66', type: String })
  restaurantId: string;

  @Expose()
  @ApiProperty({ description: '가게 이름', example: '한남동 맛집1', type: String })
  storeName: string;

  @Expose()
  @ApiProperty({ description: 'AI가 생성한 가게 설명', example: '한남동의 인기 맛집입니다', type: String })
  description: string;

  @Expose()
  @ApiProperty({ description: 'AI가 생성한 가게 요약', example: '고급스런 코스 요리 전문점', type: String })
  summary: string;

  @Expose()
  @ApiProperty({ description: '가게 주소', example: '서울특별시 용산구 한남동 123-45', type: String })
  address: string;

  @Expose()
  @ApiProperty({ description: '가게 운영 시간', example: '10:00 - 22:00', type: String })
  businessHours: string;

  @Expose()
  @ApiProperty({
    description: '메뉴 목록',
    type: [MenuDto],
    example: [
      { name: '비빔밥', price: '10,000원' },
      { name: '김치찌개', price: '8,000원' },
    ],
  })
  menus: MenuDto[];

  @Expose()
  @ApiProperty({
    description: '가게 이미지 URL 목록',
    type: [String],
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  })
  imageUrls: string[];

  @Expose()
  @ApiProperty({ description: '가게의 위도', example: 37.559503986, type: Number })
  latitude: number;

  @Expose()
  @ApiProperty({ description: '가게의 경도', example: 1127.005068637, type: Number })
  longitude: number;
}

export class FeedResponseDto {
  @Expose()
  @ApiProperty({ description: '피드 ID', example: 'feed12345', type: String })
  id: string;

  @Expose()
  @ApiProperty({ description: 'AI가 생성한 크롤링 키워드', example: '한남동 맛집', type: String })
  inputKeyword: string;

  @Expose()
  @ApiProperty({ description: 'AI 피드 생성 페르소나', example: '감성적이고 힙한 AI', type: String })
  persona: string;

  @Expose()
  @ApiProperty({ description: 'AI 피드 생성 캐릭터', example: '핫 다이노', type: String })
  character: string;

  @Expose()
  @ApiProperty({ description: '피드 소개글', example: '한남동의 숨겨진 맛집들을 소개합니다.', type: String })
  intro: string;

  @Expose()
  @ApiProperty({ description: '피드 제목', example: '맛있는 음식점 추천', type: String })
  title: string;

  @Expose()
  @ApiProperty({
    description: '각 주제별로 생성된 음식점 정보 및 AI 피드',
    type: [SectionDto],
  })
  @Type(() => SectionDto)
  sections: SectionDto[];

  /** 도메인 객체를 Response DTO로 변환 */
  static fromDomain(feed: Feed): FeedResponseDto {
    const dto = new FeedResponseDto();
    dto.id = feed.getId();
    dto.inputKeyword = feed.getInputKeyword();
    dto.persona = feed.getPersona();
    dto.character = feed.getCharacter();
    dto.intro = feed.getIntro();
    dto.title = feed.getTitle();
    dto.sections = feed.getSections().map((section) => ({
      restaurantId: section.restaurantId,
      storeName: section.storeName,
      description: section.description,
      summary: section.summary,
      address: section.address,
      businessHours: section.businessHours,
      menus: section.menus.map((m) => ({
        name: m.name,
        price: m.price,
      })),
      imageUrls: section.imageUrls,
      latitude: section.latitude,
      longitude: section.longitude,
    }));
    return dto;
  }
}
