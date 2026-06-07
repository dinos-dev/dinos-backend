import { PrismaService } from '../../../src/infrastructure/database/prisma/prisma.service';

export type ReviewSeedQuestion = {
  id: number;
  step: 'BEFORE_ENTRY' | 'ENTRY' | 'ORDER' | 'MEAL' | 'WRAP_UP';
  optionId: number;
};

type CreateReviewBody = {
  restaurant: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    category: string;
  };
  content: string;
  wantRecommendation: boolean;
  answers: Array<{
    questionId: number;
    optionId?: number;
  }>;
  images: Array<{
    imageUrl: string;
    isPrimary: boolean;
    sortOrder: number;
  }>;
};

const REVIEW_STEPS: ReviewSeedQuestion['step'][] = ['BEFORE_ENTRY', 'ENTRY', 'ORDER', 'MEAL', 'WRAP_UP'];

export async function seedReviewQuestions(prisma: PrismaService): Promise<ReviewSeedQuestion[]> {
  const questions: ReviewSeedQuestion[] = [];

  for (const [index, step] of REVIEW_STEPS.entries()) {
    const question = await prisma.reviewQuestion.create({
      data: {
        step,
        content: `${step} e2e 질문`,
        sortOrder: index,
        options: {
          create: [
            {
              content: `${step} e2e 선택지`,
              userTagLabel: `${step}_TAG`,
              sortOrder: 0,
            },
          ],
        },
      },
      include: {
        options: true,
      },
    });

    questions.push({
      id: question.id,
      step,
      optionId: question.options[0].id,
    });
  }

  return questions;
}

export function buildCreateReviewBody(questions: ReviewSeedQuestion[], content = '리뷰 e2e 본문'): CreateReviewBody {
  return {
    restaurant: {
      name: '리뷰 e2e 식당',
      address: '서울특별시 테스트구 리뷰로 1',
      latitude: 37.5,
      longitude: 127.0,
      category: '한식',
    },
    content,
    wantRecommendation: true,
    answers: questions.map((question) => ({
      questionId: question.id,
      optionId: question.optionId,
    })),
    images: [
      {
        imageUrl: 'https://cdn.example.com/reviews/e2e.jpg',
        isPrimary: true,
        sortOrder: 0,
      },
    ],
  };
}
