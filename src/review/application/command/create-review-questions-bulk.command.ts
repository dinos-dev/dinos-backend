import { CreateReviewQuestionCommand } from './create-review-question.command';

export class CreateReviewQuestionsBulkCommand {
  constructor(public readonly questions: CreateReviewQuestionCommand[]) {}
}
