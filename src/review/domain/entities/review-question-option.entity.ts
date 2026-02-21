export class ReviewQuestionOptionEntity {
  constructor(
    public readonly id: number,
    public readonly questionId: number,
    public readonly content: string,
    public readonly userTagLabel: string,
    public readonly sortOrder: number,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    questionId: number;
    content: string;
    userTagLabel: string;
    sortOrder: number;
  }): ReviewQuestionOptionEntity {
    return new ReviewQuestionOptionEntity(
      null,
      params.questionId,
      params.content,
      params.userTagLabel,
      params.sortOrder,
      true,
      new Date(),
      new Date(),
    );
  }
}
