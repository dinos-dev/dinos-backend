import { FriendRequestStatus } from 'src/friendship/domain/const/friend-request.enum';
import { FriendRequestEntity } from 'src/friendship/domain/entities/friend-request.entity';

describe('FriendRequestEntity', () => {
  describe('create', () => {
    it('올바른 파라미터로 friendRequestEntity를 생성한다.', () => {
      // 1. given
      const params = {
        senderId: 1,
        receiverId: 2,
      };
      // 2. when
      const friendRequest = FriendRequestEntity.create(params);

      // 3. then
      expect(friendRequest.senderId).toBe(params.senderId);
      expect(friendRequest.receiverId).toBe(params.receiverId);
      expect(friendRequest.status).toBe(FriendRequestStatus.PENDING);
      expect(friendRequest.id).toBeNull();
    });
  });
  describe('respondToRequest', () => {
    it('status를 ACCEPTED로 변경하고 respondedAt을 설정하며 기존 필드들은 그대로 유지한다', () => {
      // 1.given
      const friendRequest = FriendRequestEntity.create({
        senderId: 1,
        receiverId: 2,
      });
      const status = FriendRequestStatus.ACCEPTED;
      const beforeRespond = new Date();

      // 2. when
      const respondedRequest = friendRequest.respondToRequest(status);

      // 3. then

      // 변경된 필드
      expect(respondedRequest.status).toBe(status);
      expect(respondedRequest.respondedAt).not.toBeNull();
      expect(respondedRequest.respondedAt).toBeInstanceOf(Date); // date 인스턴스를 Date 객체인지 확인하고 Null & undefined가 아닌지를 체킹함
      expect(respondedRequest.respondedAt!.getTime()).toBeGreaterThanOrEqual(beforeRespond.getTime()); // Date의 타임스탬프(밀리초)를 비교해 크거나 같은지 확인 ! 시간 순서 올바른지 확인용도

      // 기존 필드 유지 확인
      expect(respondedRequest.id).toBe(friendRequest.id);
      expect(respondedRequest.senderId).toBe(friendRequest.senderId);
      expect(respondedRequest.receiverId).toBe(friendRequest.receiverId);
      expect(respondedRequest.expiresAt).toBe(friendRequest.expiresAt);
      expect(respondedRequest.createdAt).toBe(friendRequest.createdAt);
      expect(respondedRequest.updatedAt).toBe(friendRequest.updatedAt);
      expect(respondedRequest.version).toBe(friendRequest.version);
    });
    it('status를 REJECTED로 변경하고 respondedAt을 설정하며 기존 필드들은 그대로 유지한다', () => {
      // 1. given
      const friendRequest = FriendRequestEntity.create({
        senderId: 1,
        receiverId: 2,
      });
      const status = FriendRequestStatus.REJECTED;
      const beforeRespond = new Date();

      // 2. when
      const respondedRequest = friendRequest.respondToRequest(status);

      // 3. then
      // 변경된 필드
      expect(respondedRequest.status).toBe(status);
      expect(respondedRequest.respondedAt).not.toBeNull();
      expect(respondedRequest.respondedAt).toBeInstanceOf(Date);
      expect(respondedRequest.respondedAt!.getTime()).toBeGreaterThanOrEqual(beforeRespond.getTime());

      // 기존 필드 유지 확인
      expect(respondedRequest.id).toBe(friendRequest.id);
      expect(respondedRequest.senderId).toBe(friendRequest.senderId);
      expect(respondedRequest.receiverId).toBe(friendRequest.receiverId);
    });
  });
});
