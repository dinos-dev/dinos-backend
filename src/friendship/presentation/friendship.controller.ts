import { Controller } from '@nestjs/common';
import { FriendshipService } from '../application/friendship.service';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}
}
