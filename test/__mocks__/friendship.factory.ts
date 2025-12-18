import { ActivityType, FriendRequest, FriendRequestStatus, Friendship, FriendshipActivity } from '@prisma/client';
import { FriendshipActivityEntity } from 'src/friendship/domain/entities/friendship-activity.entity';
import { FriendshipEntity } from 'src/friendship/domain/entities/friendship.entity';
import { ActivityType as DomainActivityType } from 'src/friendship/domain/const/activity.enum';
import { FriendRequestEntity } from 'src/friendship/domain/entities/friend-request.entity';
import { FriendRequestStatus as DomainFriendRequestStatus } from 'src/friendship/domain/const/friend-request.enum';

/**
 * Friendship Mocking Factory
 */
export function createMockFriendship(overrides: Partial<Friendship> = {}): Friendship {
  return {
    id: 1,
    requesterId: 1,
    addresseeId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    ...overrides,
  };
}

export function createMockFriendshipEntity(
  overrides: Partial<{
    id: number | null;
    requesterId: number;
    addresseeId: number;
    createdAt: Date | null;
    updatedAt: Date | null;
    version: number | null;
  }> = {
    id: 1,
    requesterId: 1,
    addresseeId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  },
): FriendshipEntity {
  const defaults = {
    id: 1,
    requesterId: 1,
    addresseeId: 2,
  };
  const merged = { ...defaults, ...overrides };
  return new FriendshipEntity(
    merged.id,
    merged.requesterId,
    merged.addresseeId,
    merged.createdAt,
    merged.updatedAt,
    merged.version,
  );
}

/**
 * FriendshipActivity Mocking Factory
 */
export function createMockFriendshipActivity(overrides: Partial<FriendshipActivity> = {}): FriendshipActivity {
  return {
    id: 1,
    friendshipId: 1,
    activityType: ActivityType.MEAL_TOGETHER,
    activityDate: new Date(),
    location: '서울 강남구 역삼동',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    ...overrides,
  };
}

export function createMockFriendshipActivityEntity(
  overrides: Partial<{
    id: number | null;
    friendshipId: number;
    activityType: DomainActivityType;
    activityDate: Date;
    location: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    version: number | null;
  }> = {
    id: 1,
    friendshipId: 1,
    activityType: DomainActivityType.MEAL_TOGETHER,
    activityDate: new Date(),
    location: '서울 강남구 역삼동',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  },
): FriendshipActivityEntity {
  const defaults = {
    id: 1,
    friendshipId: 1,
    activityType: DomainActivityType.MEAL_TOGETHER,
    activityDate: new Date(),
    location: '서울 강남구 역삼동',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  };
  const merged = { ...defaults, ...overrides };
  return new FriendshipActivityEntity(
    merged.id,
    merged.friendshipId,
    merged.activityType,
    merged.activityDate,
    merged.location,
    merged.createdAt,
    merged.updatedAt,
    merged.version,
  );
}

/**
 * FriendRequest Mocking Factory
 */
export function createMockFriendshipRequest(overrides: Partial<FriendRequest> = {}): FriendRequest {
  return {
    id: 1,
    senderId: 1,
    receiverId: 2,
    status: FriendRequestStatus.PENDING,
    respondedAt: new Date(),
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    ...overrides,
  };
}

export function createMockFriendshipRequestEntity(
  overrides: Partial<{
    id: number | null;
    senderId: number;
    receiverId: number;
    status: DomainFriendRequestStatus;
    respondedAt: Date | null;
    expiresAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    version: number | null;
    sender: any;
    receiver: any;
  }> = {
    id: 1,
    senderId: 1,
    receiverId: 2,
    status: DomainFriendRequestStatus.PENDING,
    respondedAt: new Date(),
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  },
): FriendRequestEntity {
  const defaults = {
    id: 1,
    senderId: 1,
    receiverId: 2,
    status: DomainFriendRequestStatus.PENDING,
    respondedAt: new Date(),
    expiresAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    sender: undefined,
    receiver: undefined,
  };
  const merged = { ...defaults, ...overrides };
  return new FriendRequestEntity(
    merged.id,
    merged.senderId,
    merged.receiverId,
    merged.status,
    merged.respondedAt,
    merged.expiresAt,
    merged.createdAt,
    merged.updatedAt,
    merged.version,
    merged.sender,
    merged.receiver,
  );
}
