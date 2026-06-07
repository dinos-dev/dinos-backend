import { createE2eTestApp, E2eTestApp, registerLocalUser, resetRelationalDb } from '../support/e2e-test-app';
import { buildCreateReviewBody, ReviewSeedQuestion, seedReviewQuestions } from '../support/review-factory';
import { request } from '../support/supertest';

describe('Review endpoints (e2e)', () => {
  let testApp: E2eTestApp;
  let questions: ReviewSeedQuestion[];

  beforeAll(async () => {
    testApp = await createE2eTestApp();
  }, 120_000);

  afterAll(async () => {
    await testApp?.stop();
  });

  beforeEach(async () => {
    await resetRelationalDb(testApp.prisma);
    questions = await seedReviewQuestions(testApp.prisma);
  });

  describe('GET /reviews/questions/form', () => {
    it('returns one active question for each review step', async () => {
      const { accessToken } = await registerLocalUser(testApp.app, 'review-form@example.com');

      const response = await request(testApp.app.getHttpServer())
        .get('/reviews/questions/form')
        .set('authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.result.steps).toHaveLength(5);
      expect(response.body.result.steps.map((item) => item.step)).toEqual([
        'BEFORE_ENTRY',
        'ENTRY',
        'ORDER',
        'MEAL',
        'WRAP_UP',
      ]);
      expect(response.body.result.steps.every((item) => item.question?.options.length === 1)).toBe(true);
    });
  });

  describe('POST /reviews', () => {
    it('creates a review with answers and images', async () => {
      const { accessToken } = await registerLocalUser(testApp.app, 'review-create@example.com');
      const body = buildCreateReviewBody(questions);

      const response = await request(testApp.app.getHttpServer())
        .post('/reviews')
        .set('authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(201);

      expect(response.body.result).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          restaurantId: expect.any(Number),
        }),
      );

      const review = await testApp.prisma.review.findUniqueOrThrow({
        where: { id: response.body.result.id },
        include: {
          answers: true,
          images: true,
          restaurant: true,
        },
      });

      expect(review.answers).toHaveLength(5);
      expect(review.images).toHaveLength(1);
      expect(review.restaurant.name).toBe(body.restaurant.name);
    });

    it('rejects a review without an answered WRAP_UP question', async () => {
      const { accessToken } = await registerLocalUser(testApp.app, 'review-wrap-up@example.com');
      const body = buildCreateReviewBody(questions);
      body.answers = body.answers.map((answer) =>
        answer.questionId === questions.find((question) => question.step === 'WRAP_UP')!.id
          ? { questionId: answer.questionId }
          : answer,
      );

      const response = await request(testApp.app.getHttpServer())
        .post('/reviews')
        .set('authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(400);

      expect(response.body.error).toBe('WRAP_UP_ANSWER_REQUIRED');
    });
  });

  describe('GET /reviews/me and GET /reviews/:reviewId', () => {
    it('returns my reviews and review detail', async () => {
      const { accessToken } = await registerLocalUser(testApp.app, 'review-read@example.com');
      const reviewId = await createReview(accessToken);

      const myReviews = await request(testApp.app.getHttpServer())
        .get('/reviews/me')
        .set('authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(myReviews.body.result.data).toHaveLength(1);
      expect(myReviews.body.result.data[0]).toEqual(
        expect.objectContaining({
          id: reviewId,
          content: '리뷰 e2e 본문',
          restaurantName: '리뷰 e2e 식당',
        }),
      );

      const detail = await request(testApp.app.getHttpServer())
        .get(`/reviews/${reviewId}`)
        .set('authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(detail.body.result).toEqual(
        expect.objectContaining({
          id: reviewId,
          content: '리뷰 e2e 본문',
          restaurantName: '리뷰 e2e 식당',
        }),
      );
      expect(detail.body.result.steps).toHaveLength(5);
      expect(detail.body.result.images).toHaveLength(1);
    });
  });

  describe('PATCH /reviews/:reviewId', () => {
    it('updates a review', async () => {
      const { accessToken } = await registerLocalUser(testApp.app, 'review-update@example.com');
      const reviewId = await createReview(accessToken);

      const response = await request(testApp.app.getHttpServer())
        .patch(`/reviews/${reviewId}`)
        .set('authorization', `Bearer ${accessToken}`)
        .send({
          content: '수정된 리뷰 e2e 본문',
          wantRecommendation: false,
        })
        .expect(200);

      expect(response.body.result).toEqual(
        expect.objectContaining({
          id: reviewId,
          content: '수정된 리뷰 e2e 본문',
          wantRecommendation: false,
        }),
      );
    });
  });

  describe('DELETE /reviews/:reviewId', () => {
    it('soft deletes a review', async () => {
      const { accessToken } = await registerLocalUser(testApp.app, 'review-delete@example.com');
      const reviewId = await createReview(accessToken);

      await request(testApp.app.getHttpServer())
        .delete(`/reviews/${reviewId}`)
        .set('authorization', `Bearer ${accessToken}`)
        .expect(204);

      const review = await testApp.prisma.review.findUniqueOrThrow({ where: { id: reviewId } });
      expect(review.deletedAt).toBeTruthy();

      await request(testApp.app.getHttpServer())
        .get(`/reviews/${reviewId}`)
        .set('authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  async function createReview(accessToken: string): Promise<number> {
    const response = await request(testApp.app.getHttpServer())
      .post('/reviews')
      .set('authorization', `Bearer ${accessToken}`)
      .send(buildCreateReviewBody(questions))
      .expect(201);

    return response.body.result.id;
  }
});
