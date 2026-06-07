import { createE2eTestApp, E2eTestApp, registerLocalUser, resetRelationalDb } from '../support/e2e-test-app';
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
      const body = restaurantBody('핀 토글 식당');

      const created = await request(testApp.app.getHttpServer())
        .post('/pins/toggle')
        .set('authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(201);

      expect(created.body.result).toEqual(
        expect.objectContaining({
          action: 'created',
          restaurantId: expect.any(Number),
        }),
      );
      expect(await testApp.prisma.pin.count()).toBe(1);

      const deleted = await request(testApp.app.getHttpServer())
        .post('/pins/toggle')
        .set('authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(201);

      expect(deleted.body.result.action).toBe('deleted');
      expect(await testApp.prisma.pin.count()).toBe(0);
    });
  });

  describe('GET /pins/nearby', () => {
    it('returns nearby pinned restaurants in the requested bounding box', async () => {
      const { accessToken } = await registerLocalUser(testApp.app, 'pin-nearby@example.com');

      await request(testApp.app.getHttpServer())
        .post('/pins/toggle')
        .set('authorization', `Bearer ${accessToken}`)
        .send(restaurantBody('주변 핀 식당'))
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

  function restaurantBody(name: string) {
    return {
      name,
      address: `${name} 주소`,
      latitude: 37.5,
      longitude: 127.0,
      category: '한식',
    };
  }
});
