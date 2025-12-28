import { Feed } from 'src/feed/domain/entities/feed.entity';
import { FeedDocument, FeedDocumentLean } from '../feed.schema';
import { Section } from 'src/feed/domain/value-object/section.vo';

export class FeedMapper {
  static toDomain(doc: FeedDocument | FeedDocumentLean): Feed {
    // sections 배열을 Section VO 배열로 매핑
    const sections = (doc.sections ?? []).map((section) => Section.create(section));

    return new Feed(
      doc._id.toString(),
      doc.inputKeyword,
      doc.persona,
      doc.character,
      doc.title,
      doc.intro,
      doc.thumbnailUrl,
      sections,
      doc.createdAt,
    );
  }
}
