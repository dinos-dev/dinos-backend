import { createE2eTestApp, E2eTestApp, registerLocalUser, resetRelationalDb } from '../support/e2e-test-app';
import { request } from '../support/supertest';

describe('Bookmark endpoints (e2e)', () => {
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

  describe('POST /bookmarks/toggle', () => {
    it('creates and deletes a bookmark for the same item', async () => {
      const { accessToken } = await registerLocalUser(testApp.app, 'bookmark-toggle@example.com');
      const body = bookmarkBody();

      const created = await request(testApp.app.getHttpServer())
        .post('/bookmarks/toggle')
        .set('authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(200);

      expect(created.body.result.action).toBe('create');
      expect(created.body.result.bookmark).toEqual(
        expect.objectContaining({
          itemType: 'FEED',
          feedRefId: body.feedRefId,
          itemName: body.itemName,
        }),
      );
      expect(await testApp.prisma.bookmark.count()).toBe(1);

      const deleted = await request(testApp.app.getHttpServer())
        .post('/bookmarks/toggle')
        .set('authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(200);

      expect(deleted.body.result.action).toBe('delete');
      expect(await testApp.prisma.bookmark.count()).toBe(0);
    });
  });

  describe('GET /bookmarks/mine/:itemType', () => {
    it('returns paginated bookmarks filtered by item type', async () => {
      const { accessToken } = await registerLocalUser(testApp.app, 'bookmark-list@example.com');
      const body = bookmarkBody();

      await request(testApp.app.getHttpServer())
        .post('/bookmarks/toggle')
        .set('authorization', `Bearer ${accessToken}`)
        .send(body)
        .expect(200);

      const response = await request(testApp.app.getHttpServer())
        .get('/bookmarks/mine/FEED')
        .set('authorization', `Bearer ${accessToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.result.data).toHaveLength(1);
      expect(response.body.result.data[0]).toEqual(
        expect.objectContaining({
          itemType: 'FEED',
          feedRefId: body.feedRefId,
        }),
      );
      expect(response.body.result.meta).toEqual(
        expect.objectContaining({
          page: 1,
          limit: 10,
          total: 1,
        }),
      );
    });
  });

  function bookmarkBody() {
    return {
      itemType: 'FEED',
      feedRefId: 'feed000000000000000001',
      itemName: '테스트 피드',
      itemSub: '테스트 에디터',
      itemImageUrl: 'https://cdn.example.com/feed.jpg',
    };
  }
});
