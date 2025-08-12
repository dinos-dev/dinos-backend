import { Feed } from 'src/feed/domain/entities/feed.entity';

export class HomeFeedDto {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly sections: {
      storeName: string;
      summary: string;
      imageUrls: string[];
    }[],
  ) {}

  static fromDomain(feed: Feed): HomeFeedDto {
    return new HomeFeedDto(
      feed.getId(),
      feed.getTitle(),
      feed.getSections().map((section) => ({
        storeName: section.storeName,
        summary: section.summary,
        imageUrls: section.imageUrls,
      })),
    );
  }
}
