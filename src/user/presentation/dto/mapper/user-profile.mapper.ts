import { UserProfileCommand } from 'src/user/application/command/user-profile.command';
import { UpdateUserProfileCommand } from 'src/user/application/command/update-user-profile.command';
import { CreateUserProfileDto } from '../request/create-user-profile.dto';
import { UpdateUserProfileDto } from '../request/update-user-profile.dto';

export class UserProfileMapper {
  static toCreateCommand(userId: number, dto: CreateUserProfileDto): UserProfileCommand {
    return new UserProfileCommand(
      userId,
      dto.nickname,
      dto.comment,
      dto.headerId,
      dto.bodyId,
      dto.headerColor,
      dto.bodyColor,
    );
  }

  static toUpdateCommand(userId: number, dto: UpdateUserProfileDto): UpdateUserProfileCommand {
    return new UpdateUserProfileCommand(
      userId,
      dto.nickname,
      dto.comment,
      dto.headerId,
      dto.bodyId,
      dto.headerColor,
      dto.bodyColor,
    );
  }
}
