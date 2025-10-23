import { UserProfileWithInviteDto } from '../dto/user-profile-with-invite.dto';

export interface IUserQuery {
  findProfileByUserId(userId: number): Promise<UserProfileWithInviteDto | null>;
}
