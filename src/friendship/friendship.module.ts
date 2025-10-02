import { Module } from '@nestjs/common';
import { FriendshipService } from './application/friendship.service';
import { FriendshipController } from './presentation/friendship.controller';

@Module({
  controllers: [FriendshipController],
  providers: [FriendshipService],
})
export class FriendshipModule {}
