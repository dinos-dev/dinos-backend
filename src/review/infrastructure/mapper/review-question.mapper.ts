import { ReviewQuestion } from '@prisma/client';
import { ReviewStep } from 'src/review/domain/const/review.enum';
import { ReviewQuestionEntity } from 'src/review/domain/entities/review-question.entity';
import {
  ReviewFormOptionData,
  ReviewQuestionWithOptionsEntity,
} from 'src/review/domain/entities/review-question-with-options.entity';

type ReviewQuestionWithFormOptions = {
  id: number;
  step: string;
  content: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  options: {
    id: number;
    questionId: number;
    content: string;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

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

  static toDomainWithOptions(prismaQuestion: ReviewQuestionWithFormOptions): ReviewQuestionWithOptionsEntity {
    const options = prismaQuestion.options.map(
      (opt) =>
        new ReviewFormOptionData(
          opt.id,
          opt.questionId,
          opt.content,
          opt.sortOrder,
          opt.isActive,
          opt.createdAt,
          opt.updatedAt,
        ),
    );
    return new ReviewQuestionWithOptionsEntity(
      prismaQuestion.id,
      prismaQuestion.step as ReviewStep,
      prismaQuestion.content,
      prismaQuestion.isActive,
      prismaQuestion.sortOrder,
      prismaQuestion.createdAt,
      prismaQuestion.updatedAt,
      options,
    );
  }
}
