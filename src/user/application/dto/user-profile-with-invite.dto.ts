export class ProfileDetailDto {
  constructor(
    public readonly nickname: string,
    public readonly comment: string | null,
    public readonly headerId: number | null,
    public readonly bodyId: number | null,
    public readonly headerColor: string | null,
    public readonly bodyColor: string | null,
  ) {}

  static fromProfileData(profileData: {
    nickname: string;
    comment: string | null;
    headerId: number | null;
    bodyId: number | null;
    headerColor: string | null;
    bodyColor: string | null;
  }): ProfileDetailDto {
    return new ProfileDetailDto(
      profileData.nickname,
      profileData.comment,
      profileData.headerId,
      profileData.bodyId,
      profileData.headerColor,
      profileData.bodyColor,
    );
  }
}

export class UserProfileWithInviteDto {
  constructor(
    public readonly userId: number,
    public readonly email: string,
    public readonly name: string | null,
    public readonly profile: ProfileDetailDto | null,
    public readonly inviteCode: string | null,
    public readonly pendingFriendRequestCount: number,
  ) {}

  static create(params: {
    userId: number;
    email: string;
    name: string | null;
    profileData: {
      nickname: string;
      comment: string | null;
      headerId: number | null;
      bodyId: number | null;
      headerColor: string | null;
      bodyColor: string | null;
    } | null;
    inviteCode: string | null;
    pendingFriendRequestCount: number;
  }): UserProfileWithInviteDto {
    return new UserProfileWithInviteDto(
      params.userId,
      params.email,
      params.name,
      params.profileData ? ProfileDetailDto.fromProfileData(params.profileData) : null,
      params.inviteCode,
      params.pendingFriendRequestCount,
    );
  }
}
