import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { IUserQuery } from 'src/user/application/interface/user-query.interface';
import { UserProfileWithInviteDto } from 'src/user/application/dto/user-profile-with-invite.dto';

@Injectable()
export class UserQuery implements IUserQuery {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  private get prisma() {
    return this.txHost.tx;
  }

  async findProfileByUserId(userId: number): Promise<UserProfileWithInviteDto | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            inviteCode: true,
            _count: {
              select: {
                receivedFriendRequests: {
                  where: { status: 'PENDING' },
                },
              },
            },
          },
        },
      },
    });

    if (!profile) {
      return null;
    }

    return new UserProfileWithInviteDto(
      profile.user.id,
      profile.user.email,
      profile.user.name,
      {
        nickname: profile.nickname,
        comment: profile.comment,
        headerId: profile.headerId,
        bodyId: profile.bodyId,
        headerColor: profile.headerColor,
        bodyColor: profile.bodyColor,
      },
      profile.user.inviteCode?.code || null,
      profile.user._count.receivedFriendRequests,
    );
  }
}
