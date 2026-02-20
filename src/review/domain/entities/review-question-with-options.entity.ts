import { ReviewStep } from '../const/review.enum';
import { ReviewQuestionEntity } from './review-question.entity';

/**
 * Review 와 하위 options에 대한 리소스를 포함 하는 순수 도메인 entity
 */
export class ReviewFormOptionData {
  constructor(
    public readonly id: number,
    public readonly questionId: number,
    public readonly content: string,
    public readonly sortOrder: number,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}

export class ReviewQuestionWithOptionsEntity extends ReviewQuestionEntity {
  constructor(
    id: number,
    step: ReviewStep,
    content: string,
    isActive: boolean,
    sortOrder: number,
    createdAt: Date,
    updatedAt: Date,
    public readonly options: ReviewFormOptionData[],
  ) {
    super(id, step, content, isActive, sortOrder, createdAt, updatedAt);
  }
}
