/**
 * 친구 요청 상태
 * @param PENDING 대기중
 * @param ACCEPTED 승인됨
 * @param REJECTED 거절됨
 * @param CANCELLED 취소됨 (보낸 사람이 취소)
 * @param EXPIRED 만료됨
 */
export enum FriendRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}
