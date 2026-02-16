import { ReviewQuestion } from '@prisma/client';
import { ReviewStep } from 'src/review/domain/const/review.enum';
import { ReviewQuestionEntity } from 'src/review/domain/entities/review-question.entity';

export class ReviewQuestionMapper {
  static toDomain(prismaQuestion: ReviewQuestion): ReviewQuestionEntity {
    return new ReviewQuestionEntity(
      prismaQuestion.id,
      prismaQuestion.step as ReviewStep,
      prismaQuestion.content,
      prismaQuestion.isActive,
      prismaQuestion.sortOrder,
      prismaQuestion.createdAt,
      prismaQuestion.updatedAt,
    );
  }
}
