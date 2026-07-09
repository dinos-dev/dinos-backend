import { createE2eTestApp, E2eTestApp, registerLocalUser, resetRelationalDb } from '../support/e2e-test-app';
import { seedRestaurant } from '../support/restaurant-factory';
import { request } from '../support/supertest';

describe('Pin endpoints (e2e)', () => {
  let testApp: E2eTestApp;

  beforeAll(async () => {
    testApp = await createE2eTestApp();
  }, 120_000);

  afterAll(async () => {
    await testApp?.stop();
  });

  beforeEach(async () => {
    await resetRelationalDb(testApp.prisma);
  });

  describe('POST /pins/toggle', () => {
    it('creates and deletes a pin for the same restaurant', async () => {
      const { accessToken } = await registerLocalUser(testApp.app, 'pin-toggle@example.com');
      const { id: restaurantId } = await seedRestaurant(testApp.prisma, { name: '핀 토글 식당' });

      const created = await request(testApp.app.getHttpServer())
        .post('/pins/toggle')
        .set('authorization', `Bearer ${accessToken}`)
        .send({ restaurantId })
        .expect(201);

      expect(created.body.result).toEqual(
        expect.objectContaining({
          action: 'created',
          restaurantId,
        }),
      );
      expect(await testApp.prisma.pin.count()).toBe(1);

      const deleted = await request(testApp.app.getHttpServer())
        .post('/pins/toggle')
        .set('authorization', `Bearer ${accessToken}`)
        .send({ restaurantId })
        .expect(201);

      expect(deleted.body.result.action).toBe('deleted');
      expect(await testApp.prisma.pin.count()).toBe(0);
    });

    it('rejects a toggle for a non-existent restaurantId with 404', async () => {
      const { accessToken } = await registerLocalUser(testApp.app, 'pin-no-restaurant@example.com');

      const response = await request(testApp.app.getHttpServer())
        .post('/pins/toggle')
        .set('authorization', `Bearer ${accessToken}`)
        .send({ restaurantId: 999_999_999 })
        .expect(404);

      expect(response.body.error).toBe('NOT_FOUND_RESTAURANT');
    });
  });

  describe('GET /pins/nearby', () => {
    it('returns nearby pinned restaurants in the requested bounding box', async () => {
      const { accessToken } = await registerLocalUser(testApp.app, 'pin-nearby@example.com');
      const { id: restaurantId } = await seedRestaurant(testApp.prisma, { name: '주변 핀 식당' });

      await request(testApp.app.getHttpServer())
        .post('/pins/toggle')
        .set('authorization', `Bearer ${accessToken}`)
        .send({ restaurantId })
        .expect(201);

      const response = await request(testApp.app.getHttpServer())
        .get('/pins/nearby')
        .set('authorization', `Bearer ${accessToken}`)
        .query({
          userLat: 37.5,
          userLng: 127.0,
          minLat: 37.0,
          maxLat: 38.0,
          minLng: 126.0,
          maxLng: 128.0,
          limit: 10,
        })
        .expect(200);

      expect(response.body.result).toHaveLength(1);
      expect(response.body.result[0]).toEqual(
        expect.objectContaining({
          restaurantName: '주변 핀 식당',
          distanceKm: expect.any(Number),
        }),
      );
    });
  });
});
