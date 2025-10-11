import { ActivityType } from '../const/activity.enum';

export class FriendshipActivityEntity {
  constructor(
    public readonly id: number | null,
    public readonly friendshipId: number,
    public readonly activityType: ActivityType,
    public readonly activityDate: Date,
    public readonly location: string | null,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public version: number | null,
  ) {}

  static create(param: {
    friendshipId: number;
    activityType: ActivityType;
    activityDate: Date;
    location: string | null;
  }): FriendshipActivityEntity {
    return new FriendshipActivityEntity(
      null,
      param.friendshipId,
      param.activityType,
      param.activityDate,
      param.location,
      null,
      null,
      null,
    );
  }
}
