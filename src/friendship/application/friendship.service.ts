import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FRIEND_REQUEST_REPOSITORY,
  FRIENDSHIP_ACTIVITY_REPOSITORY,
  FRIENDSHIP_REPOSITORY,
  USER_REPOSITORY,
} from 'src/common/config/common.const';
import { IFriendshipRepository } from '../domain/repository/friendship.repository.interface';
import { IFriendshipActivityRepository } from '../domain/repository/friendship-activity.repository.interface';
import { IFriendRequestRepository } from '../domain/repository/friend-request.repository.interface';
import { RequestFriendshipCommand } from './command/request-friendship.command';
import { FriendRequestEntity } from '../domain/entities/friend-request.entity';
import { IUserRepository } from 'src/user/domain/repository/user.repository.interface';
import { HttpFriendshipErrorConstants } from './helper/http-error-object';

@Injectable()
export class FriendshipService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(FRIENDSHIP_REPOSITORY)
    private readonly friendshipRepository: IFriendshipRepository,
    @Inject(FRIENDSHIP_ACTIVITY_REPOSITORY)
    private readonly friendshipActivityRepository: IFriendshipActivityRepository,
    @Inject(FRIEND_REQUEST_REPOSITORY)
    private readonly friendRequestRepository: IFriendRequestRepository,
  ) {}

  /**
   * 친구요청 (상대방이 거절 했을 경우 다시 PENDING 상태로 Upsert)
   * @param command  RequestFriendshipCommand
   * @returns FriendRequestEntity
   */
  async requestFriendship(command: RequestFriendshipCommand): Promise<FriendRequestEntity> {
    const user = await this.userRepository.findByUserId(command.receiverId);
    if (!user) throw new NotFoundException(HttpFriendshipErrorConstants.NOT_FOUND_USER);

    const friendRequest = FriendRequestEntity.create(command);
    return await this.friendRequestRepository.upsertRequestFriendInvite(friendRequest);
  }

  /**
   * 나에게 요청을 보낸 사용자 정보 조회
   * @param receiveId 나의 userId
   */
  async findByReceiveId(receiveId: number): Promise<FriendRequestEntity[]> {
    const receivedFriendRequests = await this.friendRequestRepository.findByReceiveId(receiveId);
    // 나에게 보낸 사용자가 없으면 빈 배열 반환
    if (receivedFriendRequests.length === 0) return [];
    return receivedFriendRequests;
  }

  // /**
  //  * @param id 친구 요청 id
  //  * @param status FriendRequestStatus(수락, 거절)
  //  */
  // async respondToFriendRequest(id: number, status: FriendRequestStatus) {
  //   const findFriendRequest = await this.friendRequestRepository.findById(id);
  //   return findFriendRequest;
  // }
}
