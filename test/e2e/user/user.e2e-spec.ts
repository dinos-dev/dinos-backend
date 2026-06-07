import { createE2eTestApp, E2eTestApp, registerLocalUser, resetRelationalDb } from '../support/e2e-test-app';
import { request } from '../support/supertest';

describe('User endpoints (e2e)', () => {
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

  describe('GET /users/mine/profile', () => {
    it('rejects requests without access token', async () => {
      const response = await request(testApp.app.getHttpServer()).get('/users/mine/profile').expect(401);

      expect(response.body.error).toBe('NOT_FOUND_TOKEN');
    });

    it('returns current user profile with invite metadata', async () => {
      const email = 'user-profile@example.com';
      const { accessToken } = await registerLocalUser(testApp.app, email);

      const response = await request(testApp.app.getHttpServer())
        .get('/users/mine/profile')
        .set('authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.result).toEqual(
        expect.objectContaining({
          email,
          inviteCode: expect.any(String),
          pendingFriendRequestCount: 0,
          reviewCount: 0,
          friendCount: 0,
        }),
      );
      expect(response.body.result.profile).toEqual(
        expect.objectContaining({
          nickname: expect.any(String),
        }),
      );
    });
  });

  describe('PATCH /users/profile', () => {
    it('updates current user profile', async () => {
      const email = 'user-profile-update@example.com';
      const { accessToken } = await registerLocalUser(testApp.app, email);

      const response = await request(testApp.app.getHttpServer())
        .patch('/users/profile')
        .set('authorization', `Bearer ${accessToken}`)
        .send({
          nickname: 'UpdatedDino',
          comment: '프로필 수정 e2e',
          headerId: 7,
          bodyId: 8,
          headerColor: '#123456',
          bodyColor: '#ABCDEF',
        })
        .expect(200);

      expect(response.body.result).toEqual(
        expect.objectContaining({
          nickname: 'UpdatedDino',
          comment: '프로필 수정 e2e',
          headerId: 7,
          bodyId: 8,
          headerColor: '#123456',
          bodyColor: '#ABCDEF',
        }),
      );

      const user = await testApp.prisma.user.findUniqueOrThrow({
        where: { email },
        include: { profile: true },
      });

      expect(user.profile).toEqual(
        expect.objectContaining({
          nickname: 'UpdatedDino',
          comment: '프로필 수정 e2e',
        }),
      );
    });
  });

  describe('GET /users/invite-code/:inviteCode', () => {
    it('returns a user by invite code', async () => {
      const email = 'user-invite-code@example.com';
      await registerLocalUser(testApp.app, email);
      const user = await testApp.prisma.user.findUniqueOrThrow({
        where: { email },
        include: { inviteCode: true },
      });
      const viewer = await registerLocalUser(testApp.app, 'user-invite-viewer@example.com');

      const response = await request(testApp.app.getHttpServer())
        .get(`/users/invite-code/${user.inviteCode!.code}`)
        .set('authorization', `Bearer ${viewer.accessToken}`)
        .expect(200);

      expect(response.body.result).toEqual(
        expect.objectContaining({
          id: user.id,
          email,
          profile: expect.objectContaining({
            nickname: expect.any(String),
          }),
        }),
      );
    });
  });

  describe('DELETE /users', () => {
    it('withdraws current user and deletes related auth/profile records', async () => {
      const email = 'user-withdraw@example.com';
      const { accessToken } = await registerLocalUser(testApp.app, email);
      const user = await testApp.prisma.user.findUniqueOrThrow({ where: { email } });

      await request(testApp.app.getHttpServer())
        .delete('/users')
        .set('authorization', `Bearer ${accessToken}`)
        .expect(204);

      await expect(testApp.prisma.user.findUnique({ where: { id: user.id } })).resolves.toBeNull();
      await expect(testApp.prisma.profile.findUnique({ where: { userId: user.id } })).resolves.toBeNull();
      await expect(testApp.prisma.token.count({ where: { userId: user.id } })).resolves.toBe(0);
    });
  });
});
