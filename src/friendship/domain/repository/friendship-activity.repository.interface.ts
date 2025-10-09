export interface IFriendshipActivityRepository {
  removeByFriendshipId(friendshipId: number): Promise<void>;
}
