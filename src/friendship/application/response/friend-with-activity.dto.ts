export class FriendProfileDto {
  constructor(
    public readonly nickname: string,
    public readonly comment: string | null,
    public readonly headerId: number | null,
    public readonly bodyId: number | null,
    public readonly headerColor: string | null,
    public readonly bodyColor: string | null,
  ) {}

  // ProfileEntity 대신 일반 객체를 받아서 반환
  static fromProfileData(profileData: {
    nickname: string;
    comment: string | null;
    headerId: number | null;
    bodyId: number | null;
    headerColor: string | null;
    bodyColor: string | null;
  }): FriendProfileDto {
    return new FriendProfileDto(
      profileData.nickname,
      profileData.comment,
      profileData.headerId,
      profileData.bodyId,
      profileData.headerColor,
      profileData.bodyColor,
    );
  }
}

export class FriendWithActivityDto {
  constructor(
    public readonly id: number,
    public readonly friendUserId: number,
    public readonly email: string,
    public readonly name: string | null,
    public readonly friendProfile: FriendProfileDto | null,
    public readonly activityCount: number,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: number;
    friendUserId: number;
    email: string;
    name: string | null;
    friendProfileData: {
      nickname: string;
      comment: string | null;
      headerId: number | null;
      bodyId: number | null;
      headerColor: string | null;
      bodyColor: string | null;
    } | null;
    activityCount: number;
    createdAt: Date;
  }): FriendWithActivityDto {
    return new FriendWithActivityDto(
      params.id,
      params.friendUserId,
      params.email,
      params.name,
      params.friendProfileData ? FriendProfileDto.fromProfileData(params.friendProfileData) : null,
      params.activityCount,
      params.createdAt,
    );
  }
}
