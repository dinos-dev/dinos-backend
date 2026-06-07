import { createE2eTestApp, E2eTestApp, registerLocalUser, resetRelationalDb } from '../support/e2e-test-app';
import { request } from '../support/supertest';

describe('Friendship endpoints (e2e)', () => {
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

  describe('POST /friendships/requests', () => {
    it('sends a friend request and exposes it to the receiver', async () => {
      const sender = await createUser('friend-sender@example.com');
      const receiver = await createUser('friend-receiver@example.com');

      const response = await request(testApp.app.getHttpServer())
        .post('/friendships/requests')
        .set('authorization', `Bearer ${sender.accessToken}`)
        .send({ receiverId: receiver.userId })
        .expect(201);

      expect(response.body.result).toEqual(
        expect.objectContaining({
          senderId: sender.userId,
          receiverId: receiver.userId,
          status: 'PENDING',
        }),
      );

      const received = await request(testApp.app.getHttpServer())
        .get('/friendships/received')
        .set('authorization', `Bearer ${receiver.accessToken}`)
        .expect(200);

      expect(received.body.result).toHaveLength(1);
      expect(received.body.result[0]).toEqual(
        expect.objectContaining({
          id: response.body.result.id,
          senderId: sender.userId,
          receiverId: receiver.userId,
          status: 'PENDING',
        }),
      );
    });

    it('rejects requesting friendship with self', async () => {
      const user = await createUser('friend-self@example.com');

      const response = await request(testApp.app.getHttpServer())
        .post('/friendships/requests')
        .set('authorization', `Bearer ${user.accessToken}`)
        .send({ receiverId: user.userId })
        .expect(400);

      expect(response.body.error).toBe('SAME_USER_ID');
    });
  });

  describe('PATCH /friendships/requests/:id', () => {
    it('accepts a friend request and returns the friendship in the friend list', async () => {
      const sender = await createUser('friend-accept-sender@example.com');
      const receiver = await createUser('friend-accept-receiver@example.com');
      const friendRequestId = await sendFriendRequest(sender.accessToken, receiver.userId);

      await request(testApp.app.getHttpServer())
        .patch(`/friendships/requests/${friendRequestId}`)
        .set('authorization', `Bearer ${receiver.accessToken}`)
        .send({ status: 'ACCEPTED' })
        .expect(200);

      const response = await request(testApp.app.getHttpServer())
        .get('/friendships/mine')
        .set('authorization', `Bearer ${sender.accessToken}`)
        .expect(200);

      expect(response.body.result.data).toHaveLength(1);
      expect(response.body.result.data[0]).toEqual(
        expect.objectContaining({
          friendUserId: receiver.userId,
          email: 'friend-accept-receiver@example.com',
          activityCount: 0,
        }),
      );
    });
  });

  async function createUser(email: string): Promise<{ accessToken: string; userId: number }> {
    const { accessToken } = await registerLocalUser(testApp.app, email);
    const user = await testApp.prisma.user.findUniqueOrThrow({ where: { email } });
    return { accessToken, userId: user.id };
  }

  async function sendFriendRequest(accessToken: string, receiverId: number): Promise<number> {
    const response = await request(testApp.app.getHttpServer())
      .post('/friendships/requests')
      .set('authorization', `Bearer ${accessToken}`)
      .send({ receiverId })
      .expect(201);

    return response.body.result.id;
  }
});
