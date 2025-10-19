import { Module } from '@nestjs/common';
import { FriendshipService } from './application/friendship.service';
import { FriendshipController } from './presentation/friendship.controller';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { FriendshipRepository } from './infrastructure/repository/friendship.repository';
import { FriendshipActivityRepository } from './infrastructure/repository/freindship-activity.repostiory';
import { FriendRequestRepository } from './infrastructure/repository/friend-request.repository';
import {
  FRIEND_REQUEST_REPOSITORY,
  FRIENDSHIP_ACTIVITY_REPOSITORY,
  FRIENDSHIP_QUERY_REPOSITORY,
  FRIENDSHIP_REPOSITORY,
  USER_REPOSITORY,
} from 'src/common/config/common.const';
import { UserRepository } from 'src/user/infrastructure/repository/user.repository';
import { FriendshipQueryRepository } from './infrastructure/query/friendship.query';

@Module({
  controllers: [FriendshipController],
  providers: [
    FriendshipService,
    {
      provide: FRIENDSHIP_REPOSITORY,
      useClass: FriendshipRepository,
    },
    {
      provide: FRIENDSHIP_QUERY_REPOSITORY,
      useClass: FriendshipQueryRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: FRIENDSHIP_ACTIVITY_REPOSITORY,
      useClass: FriendshipActivityRepository,
    },
    {
      provide: FRIEND_REQUEST_REPOSITORY,
      useClass: FriendRequestRepository,
    },
    PrismaService,
  ],
})
export class FriendshipModule {}
