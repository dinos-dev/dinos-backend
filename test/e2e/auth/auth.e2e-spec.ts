import { createE2eTestApp, E2eTestApp, registerLocalUser, resetRelationalDb } from '../support/e2e-test-app';
import { request } from '../support/supertest';

describe('Auth endpoints (e2e)', () => {
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

  describe('POST /auth/local', () => {
    it('registers a local user and creates default profile, invite code, and refresh token', async () => {
      const email = 'auth-local@example.com';

      const response = await request(testApp.app.getHttpServer())
        .post('/auth/local')
        .set('user-agent', 'jest-e2e')
        .send({
          email,
          name: 'E2E User',
          password: 'test1234!',
        })
        .expect(201);

      expect(response.body.result.accessToken).toEqual(expect.any(String));
      expect(response.body.result.refreshToken).toEqual(expect.any(String));

      const user = await testApp.prisma.user.findUnique({
        where: { email },
        include: {
          profile: true,
          inviteCode: true,
          tokens: true,
        },
      });

      expect(user).toBeTruthy();
      expect(user.profile).toBeTruthy();
      expect(user.inviteCode?.code).toEqual(expect.any(String));
      expect(user.tokens).toHaveLength(1);
    });

    it('rejects invalid request body', async () => {
      const response = await request(testApp.app.getHttpServer())
        .post('/auth/local')
        .set('user-agent', 'jest-e2e')
        .send({
          email: 'not-an-email',
          password: 'weak',
        })
        .expect(400);

      expect(response.body.error).toBe('VALIDATE_ERROR');
      expect(response.body.validationErrors).toEqual(expect.any(Array));
    });
  });

  describe('POST /auth/token/access', () => {
    it('rotates access token with a valid refresh token', async () => {
      const { refreshToken } = await registerLocalUser(testApp.app, 'auth-refresh@example.com');

      const response = await request(testApp.app.getHttpServer())
        .post('/auth/token/access')
        .set('authorization', `Bearer ${refreshToken}`)
        .expect(201);

      expect(response.body.result.accessToken).toEqual(expect.any(String));
    });

    it('rejects requests without refresh token', async () => {
      const response = await request(testApp.app.getHttpServer()).post('/auth/token/access').expect(401);

      expect(response.body.error).toBe('NOT_FOUND_TOKEN');
    });
  });
});
