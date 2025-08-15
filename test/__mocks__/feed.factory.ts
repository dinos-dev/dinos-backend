import { Feed } from '../../src/feed/domain/entities/feed.entity';
import { Section, SectionProps } from '../../src/feed/domain/value-object/section.vo';

export class FeedFactory {
  static createFeed(overrides: Partial<FeedProps> = {}): Feed {
    const defaultProps: FeedProps = {
      id: '1',
      inputKeyword: 'keyword',
      persona: 'persona',
      character: 'character',
      title: 'Test Feed',
      intro: 'Introduction',
      sections: [FeedFactory.createSection()],
      createdAt: new Date('2025-08-14'),
    };

    const props = { ...defaultProps, ...overrides };
    return new Feed(
      props.id,
      props.inputKeyword,
      props.persona,
      props.character,
      props.title,
      props.intro,
      props.sections,
      props.createdAt,
    );
  }

  static createSection(overrides: Partial<SectionProps> = {}): Section {
    const defaultProps: SectionProps = {
      storeName: 'Coffee Shop',
      description: 'A cozy coffee shop',
      summary: '맛있는 다이노스 음식점',
      address: '인천시 남구 송도동 123-45',
      businessHours: '09:00~10:00',
      menus: [{ name: 'Latte', price: '5.00' }],
      imageUrls: ['http://example.com/image.jpg'],
    };

    return Section.create({ ...defaultProps, ...overrides });
  }

  static createFeedDocument(overrides: Partial<FeedDocumentProps> = {}): FeedDocumentProps {
    return {
      _id: '1',
      inputKeyword: 'keyword',
      persona: 'persona',
      character: 'character',
      title: 'Test Feed',
      intro: 'Introduction',
      sections: [FeedFactory.createSection()],
      createdAt: new Date('2025-08-15'),
      ...overrides,
    };
  }
}

interface FeedProps {
  id: string;
  inputKeyword: string;
  persona: string;
  character: string;
  title: string;
  intro: string;
  sections: Section[];
  createdAt: Date;
}

interface FeedDocumentProps {
  _id: string;
  inputKeyword: string;
  persona: string;
  character: string;
  title: string;
  intro: string;
  sections: Section[];
  createdAt: Date;
}
