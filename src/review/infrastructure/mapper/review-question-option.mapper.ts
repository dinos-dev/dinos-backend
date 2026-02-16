import { ReviewQuestionOption } from '@prisma/client';
import { ReviewQuestionOptionEntity } from 'src/review/domain/entities/review-question-option.entity';

export class ReviewQuestionOptionMapper {
  static toDomain(prismaOption: ReviewQuestionOption): ReviewQuestionOptionEntity {
    return new ReviewQuestionOptionEntity(
      prismaOption.id,
      prismaOption.questionId,
      prismaOption.content,
      prismaOption.userTagLabel,
      prismaOption.sortOrder,
      prismaOption.isActive,
      prismaOption.createdAt,
      prismaOption.updatedAt,
    );
  }
}
