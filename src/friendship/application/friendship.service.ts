import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FRIEND_REQUEST_REPOSITORY,
  FRIENDSHIP_ACTIVITY_REPOSITORY,
  FRIENDSHIP_QUERY_REPOSITORY,
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
import { PaginatedResult, PaginationOptions } from 'src/common/types/pagination.types';
import { FriendWithActivityDto } from './dto/friend-with-activity.dto';
import { IFriendshipQuery } from './interface/friendship-query.interface';
import { SharedPinFriendDto, SharedPinRestaurantDto, SharedPinsDto } from './dto/shared-pins.dto';

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
    @Inject(FRIENDSHIP_QUERY_REPOSITORY)
    private readonly friendshipQuery: IFriendshipQuery,
  ) {}

  /**
   * 친구요청 (상대방이 거절 했을 경우 다시 PENDING 상태로 Upsert)
   * 역방향 PENDING 요청이 존재하면 ConflictException 반환 (Facebook 방식)
   * @param command  RequestFriendshipCommand
   * @returns FriendRequestEntity
   */
  @Transactional()
  async requestFriendship(command: RequestFriendshipCommand): Promise<FriendRequestEntity> {
    const user = await this.userRepository.findByUserId(command.receiverId);
    if (!user) throw new NotFoundException(HttpFriendshipErrorConstants.NOT_FOUND_USER);

    // 상대방이 이미 나에게 PENDING 요청을 보낸 경우 — 받은 요청을 수락하도록 유도
    const reversePending = await this.friendRequestRepository.findPendingBySenderAndReceiver(
      command.receiverId,
      command.senderId,
    );
    if (reversePending) {
      throw new ConflictException(HttpFriendshipErrorConstants.REVERSE_FRIEND_REQUEST_EXISTS);
    }

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
      // 동시 수락 race condition 방어: 이미 친구 관계가 존재하면 생성 생략 - 멱등성 보장
      const existing = await this.friendshipRepository.findByUserPair(
        findFriendRequest.senderId,
        findFriendRequest.receiverId,
      );
      if (!existing) {
        const entity = FriendshipEntity.create({
          requesterId: findFriendRequest.senderId,
          addresseeId: findFriendRequest.receiverId,
        });
        await this.friendshipRepository.upsertFriendship(entity);
      }
    }

    return status === FriendRequestStatus.ACCEPTED ? '친구 요청을 수락하였습니다.' : '친구 요청을 거절하였습니다.';
  }

  /**
   * 나의 친구 리스트 조회
   * @param userId
   * @param paginationOptions
   * @returns
   */
  async findAllFriendship(
    userId: number,
    paginationOptions?: PaginationOptions,
  ): Promise<PaginatedResult<FriendWithActivityDto>> {
    return await this.friendshipQuery.findAllFriendship(userId, paginationOptions);
  }

  /**
   * 나와 같은 음식점을 pin한 친구 목록 조회 (음식점 기준 그루핑)
   * @param userId 현재 사용자 ID
   * @returns SharedPinsDto[]
   */
  async findSharedPins(userId: number): Promise<SharedPinsDto[]> {
    const items = await this.friendshipQuery.findSharedPins(userId);

    const restaurantMap = new Map<number, SharedPinsDto>();

    // 음식점을 기준으로 음식점 & 친구 조합 단위로 그루핑
    for (const item of items) {
      if (!restaurantMap.has(item.restaurantId)) {
        const restaurant = new SharedPinRestaurantDto(
          item.restaurantId,
          item.restaurantName,
          item.address,
          item.category,
          item.latitude,
          item.longitude,
          item.primaryImageUrl,
        );
        restaurantMap.set(item.restaurantId, new SharedPinsDto(restaurant, []));
      }

      restaurantMap.get(item.restaurantId)!.friends.push(new SharedPinFriendDto(item.friendUserId, item.friendProfile));
    }

    return Array.from(restaurantMap.values());
  }

  /**
   * 친구 관계 삭제
   * @param friendshipId
   * @param userId
   */
  @Transactional()
  async removeFriendship(friendshipId: number, userId: number): Promise<void> {
    const friendship = await this.friendshipRepository.findById(friendshipId);

    // 친구 관계를 찾을 수 없으면 exception
    if (!friendship) {
      throw new NotFoundException(HttpFriendshipErrorConstants.NOT_FOUND_FRIENDSHIP);
    }

    // 본인의 친구 관계가 아닌 경우 exception
    if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
      throw new ForbiddenException(HttpFriendshipErrorConstants.FORBIDDEN_FRIENDSHIP_REMOVAL);
    }

    // 1) 친구관계 제거
    await this.friendshipRepository.removeById(friendshipId);

    // 2) 친구관계 활동 정보 제거
    await this.friendshipActivityRepository.removeByFriendshipId(friendshipId);

    // 3) 친구 관계 요청 제거
    await this.friendRequestRepository.removeByReceiverAndSenderId(friendship.requesterId, friendship.addresseeId);
  }
}
