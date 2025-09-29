import { InviteCode as InviteCodePrisma } from '@prisma/client';
import { InviteCodeEntity } from 'src/user/domain/entities/invite-code.entity';

export class InviteCodeMapper {
  static toDomain(prismaInviteCode: InviteCodePrisma): InviteCodeEntity {
    return new InviteCodeEntity(
      prismaInviteCode.id,
      prismaInviteCode.userId,
      prismaInviteCode.code,
      prismaInviteCode.createdAt,
      prismaInviteCode.updatedAt,
    );
  }
}
