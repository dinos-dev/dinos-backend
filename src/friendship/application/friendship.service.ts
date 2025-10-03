import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
import { FriendRequestStatus } from '../domain/const/friend-request.enum';
import { Transactional } from '@nestjs-cls/transactional';
import { FriendshipEntity } from '../domain/entities/friendship.entity';

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

  /**
   * 친구 요청 수락 & 거절
   * @param id 친구 요청 id
   * @param status FriendRequestStatus(수락, 거절)
   */
  @Transactional()
  async respondToFriendRequest(id: number, status: FriendRequestStatus, userId: number): Promise<string> {
    const findFriendRequest = await this.friendRequestRepository.findById(id);

    // 친구 요청을 찾을 수 없는 경우 exception
    if (!findFriendRequest) {
      throw new NotFoundException(HttpFriendshipErrorConstants.NOT_FOUND_FRIEND_REQUEST);
    }

    // 본인이 받은 친구 요청이 아닌경우 exception
    if (findFriendRequest.receiverId !== userId) {
      throw new ForbiddenException(HttpFriendshipErrorConstants.INVALID_FRIEND_REQUEST_RECEIVER);
    }

    // 친구 요청에 대한 정보를 업데이트
    const updateEntity = findFriendRequest.respondToRequest(status);
    await this.friendRequestRepository.upsertRequestFriendInvite(updateEntity);

    // 사용자가 수락을 했을 경우에 친구 관계 테이블을 생성
    if (status === FriendRequestStatus.ACCEPTED) {
      const entity = FriendshipEntity.create({
        requesterId: findFriendRequest.senderId,
        addresseeId: findFriendRequest.receiverId,
      });
      await this.friendshipRepository.upsertFriendship(entity);
    }

    return status === FriendRequestStatus.ACCEPTED ? '친구 요청을 수락하였습니다.' : '친구 요청을 거절하였습니다.';
  }
}
