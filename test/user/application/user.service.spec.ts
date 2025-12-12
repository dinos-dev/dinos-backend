import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/user/application/user.service';
import { IUserRepository } from 'src/user/domain/repository/user.repository.interface';
import { IProfileRepository } from 'src/user/domain/repository/profile.repository.interface';
import { ITokenRepository } from 'src/auth/domain/repository/token.repository.interface';
import { IInviteCodeRepository } from 'src/user/domain/repository/invite-code.repository.interface';
import { IUserQuery } from 'src/user/application/interface/user-query.interface';
import {
  INVITE_CODE_REPOSITORY,
  PROFILE_REPOSITORY,
  TOKEN_REPOSITORY,
  USER_QUERY_REPOSITORY,
  USER_REPOSITORY,
} from 'src/common/config/common.const';
import { UserProfileCommand } from 'src/user/application/command/user-profile.command';
import { ProfileEntity } from 'src/user/domain/entities/profile.entity';
import { UserEntity } from 'src/user/domain/entities/user.entity';
import { InviteCodeEntity } from 'src/user/domain/entities/invite-code.entity';
import { UserProfileWithInviteDto } from 'src/user/application/dto/user-profile-with-invite.dto';
import { Provider } from 'src/user/domain/const/provider.enum';
import { ConflictException, ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { HttpUserErrorConstants } from 'src/user/application/helper/http-error-object';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { mockDeep } from 'jest-mock-extended';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

jest.mock('@nestjs-cls/transactional', () => ({
  ...jest.requireActual('@nestjs-cls/transactional'),
  Transactional: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    return descriptor;
  },
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<IUserRepository>;
  let profileRepository: jest.Mocked<IProfileRepository>;
  let tokenRepository: jest.Mocked<ITokenRepository>;
  let inviteCodeRepository: jest.Mocked<IInviteCodeRepository>;
  let userQueryRepository: jest.Mocked<IUserQuery>;
  let mockTransactionHost: ReturnType<typeof mockDeep<TransactionHost<TransactionalAdapterPrisma>>>;

  const mockUser = new UserEntity(
    1,
    'test@example.com',
    'Test User',
    null,
    true,
    Provider.LOCAL,
    null,
    new Date(),
    new Date(),
    null,
    0,
  );

  const mockProfile = new ProfileEntity(
    1,
    1,
    'TestNickname',
    'Test comment',
    1,
    1,
    '#FFFFFF',
    '#000000',
    new Date(),
    new Date(),
    0,
  );

  const mockProfileCommand = new UserProfileCommand(1, 'TestNickname', 'Test comment', 1, 1, '#FFFFFF', '#000000');

  const mockInviteCode = new InviteCodeEntity(1, 1, 'TEST123', new Date(), new Date());

  const mockUserProfileWithInvite = UserProfileWithInviteDto.create({
    userId: 1,
    email: 'test@example.com',
    name: 'Test User',
    profileData: {
      nickname: 'TestNickname',
      comment: 'Test comment',
      headerId: 1,
      bodyId: 1,
      headerColor: '#FFFFFF',
      bodyColor: '#000000',
    },
    inviteCode: 'TEST123',
    pendingFriendRequestCount: 0,
  });

  beforeEach(async () => {
    // Create mocks using mockDeep
    userRepository = mockDeep<IUserRepository>();
    profileRepository = mockDeep<IProfileRepository>();
    tokenRepository = mockDeep<ITokenRepository>();
    inviteCodeRepository = mockDeep<IInviteCodeRepository>();
    userQueryRepository = mockDeep<IUserQuery>();
    mockTransactionHost = mockDeep<TransactionHost<TransactionalAdapterPrisma>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY,
          useValue: userRepository,
        },
        {
          provide: PROFILE_REPOSITORY,
          useValue: profileRepository,
        },
        {
          provide: TOKEN_REPOSITORY,
          useValue: tokenRepository,
        },
        {
          provide: INVITE_CODE_REPOSITORY,
          useValue: inviteCodeRepository,
        },
        {
          provide: USER_QUERY_REPOSITORY,
          useValue: userQueryRepository,
        },
        {
          provide: TransactionHost,
          useValue: mockTransactionHost,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProfile', () => {
    it('유저 프로필을 성공적으로 생성한다.', async () => {
      // given
      userRepository.findByUserId.mockResolvedValue(mockUser);
      profileRepository.findByUserId.mockResolvedValue(null);
      profileRepository.createProfile.mockResolvedValue(mockProfile);

      // when
      const result = await service.createProfile(mockProfileCommand);

      // then
      expect(result).toBeDefined();
      expect(result).toEqual(mockProfile);
      expect(userRepository.findByUserId).toHaveBeenCalledWith(mockProfileCommand.userId);
      expect(profileRepository.findByUserId).toHaveBeenCalledWith(mockProfileCommand.userId);
      expect(profileRepository.createProfile).toHaveBeenCalled();
    });

    it('유저를 찾을 수 없으면 NotFoundException을 던진다.', async () => {
      // given
      userRepository.findByUserId.mockResolvedValue(null);

      // when & then
      await expect(service.createProfile(mockProfileCommand)).rejects.toThrow(
        new NotFoundException(HttpUserErrorConstants.NOT_FOUND_USER),
      );
      expect(userRepository.findByUserId).toHaveBeenCalledWith(mockProfileCommand.userId);
      expect(profileRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('이미 프로필이 존재하면 ConflictException을 던진다.', async () => {
      // given
      userRepository.findByUserId.mockResolvedValue(mockUser);
      profileRepository.findByUserId.mockResolvedValue(mockProfile);

      // when & then
      await expect(service.createProfile(mockProfileCommand)).rejects.toThrow(
        new ConflictException(HttpUserErrorConstants.CONFLICT_USER_PROFILE),
      );
      expect(userRepository.findByUserId).toHaveBeenCalledWith(mockProfileCommand.userId);
      expect(profileRepository.findByUserId).toHaveBeenCalledWith(mockProfileCommand.userId);
      expect(profileRepository.createProfile).not.toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    const profileId = 1;

    it('유저 프로필을 성공적으로 수정한다.', async () => {
      // given
      profileRepository.findById.mockResolvedValue(mockProfile);
      profileRepository.updateById.mockResolvedValue(mockProfile);

      // when
      const result = await service.updateProfile(profileId, mockProfileCommand);

      // then
      expect(result).toBeDefined();
      expect(result).toEqual(mockProfile);
      expect(profileRepository.findById).toHaveBeenCalledWith(profileId);
      expect(profileRepository.updateById).toHaveBeenCalledWith(profileId, expect.any(ProfileEntity));
    });

    it('프로필을 찾을 수 없으면 NotFoundException을 던진다.', async () => {
      // given
      profileRepository.findById.mockResolvedValue(null);

      // when & then
      await expect(service.updateProfile(profileId, mockProfileCommand)).rejects.toThrow(
        new NotFoundException(HttpUserErrorConstants.NOT_FOUND_PROFILE),
      );
      expect(profileRepository.findById).toHaveBeenCalledWith(profileId);
      expect(profileRepository.updateById).not.toHaveBeenCalled();
    });

    it('본인의 프로필이 아니면 ForbiddenException을 던진다.', async () => {
      // given
      const differentUserProfile = new ProfileEntity(
        1,
        999,
        'OtherNickname',
        'Other comment',
        1,
        1,
        '#FFFFFF',
        '#000000',
        new Date(),
        new Date(),
        0,
      );
      profileRepository.findById.mockResolvedValue(differentUserProfile);

      // when & then
      await expect(service.updateProfile(profileId, mockProfileCommand)).rejects.toThrow(
        new ForbiddenException(HttpUserErrorConstants.FORBIDDEN_USER_PROFILE),
      );
      expect(profileRepository.findById).toHaveBeenCalledWith(profileId);
      expect(profileRepository.updateById).not.toHaveBeenCalled();
    });
  });

  describe('withdrawUser', () => {
    const userId = 1;

    it('회원탈퇴를 성공적으로 처리한다.', async () => {
      // given
      userRepository.deleteByUser.mockResolvedValue(undefined);
      tokenRepository.deleteManyByUserId.mockResolvedValue(undefined);
      profileRepository.deleteManyByUserId.mockResolvedValue(undefined);

      // when
      await service.withdrawUser(userId);

      // then
      expect(userRepository.deleteByUser).toHaveBeenCalledWith(userId);
      expect(tokenRepository.deleteManyByUserId).toHaveBeenCalledWith(userId);
      expect(profileRepository.deleteManyByUserId).toHaveBeenCalledWith(userId);
    });

    it('트랜잭션 에러가 발생하면 InternalServerErrorException을 던진다.', async () => {
      // given
      const error = new Error('Transaction error');
      userRepository.deleteByUser.mockRejectedValue(error);

      // when & then
      await expect(service.withdrawUser(userId)).rejects.toThrow(
        new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR),
      );
      expect(userRepository.deleteByUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('findByProfileWithInviteInfo', () => {
    const userId = 1;

    it('유저 프로필과 초대코드 정보를 성공적으로 조회한다.', async () => {
      // given
      userQueryRepository.findProfileByUserId.mockResolvedValue(mockUserProfileWithInvite);

      // when
      const result = await service.findByProfileWithInviteInfo(userId);

      // then
      expect(result).toBeDefined();
      expect(result).toEqual(mockUserProfileWithInvite);
      expect(userQueryRepository.findProfileByUserId).toHaveBeenCalledWith(userId);
    });

    it('프로필을 찾을 수 없으면 NotFoundException을 던진다.', async () => {
      // given
      userQueryRepository.findProfileByUserId.mockResolvedValue(null);

      // when & then
      await expect(service.findByProfileWithInviteInfo(userId)).rejects.toThrow(
        new NotFoundException(HttpUserErrorConstants.NOT_FOUND_PROFILE),
      );
      expect(userQueryRepository.findProfileByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('findByInviteCode', () => {
    const inviteCode = 'TEST123';

    it('초대코드로 유저를 성공적으로 조회한다.', async () => {
      // given
      inviteCodeRepository.findByUnique.mockResolvedValue(mockInviteCode);
      userRepository.findByUserProfile.mockResolvedValue({
        user: mockUser,
        profile: mockProfile,
      });

      // when
      const result = await service.findByInviteCode(inviteCode);

      // then
      expect(result).toBeDefined();
      expect(result.user).toEqual(mockUser);
      expect(result.profile).toEqual(mockProfile);
      expect(inviteCodeRepository.findByUnique).toHaveBeenCalledWith(inviteCode);
      expect(userRepository.findByUserProfile).toHaveBeenCalledWith(mockInviteCode.userId);
    });

    it('초대코드를 찾을 수 없으면 NotFoundException을 던진다.', async () => {
      // given
      inviteCodeRepository.findByUnique.mockResolvedValue(null);

      // when & then
      await expect(service.findByInviteCode(inviteCode)).rejects.toThrow(
        new NotFoundException(HttpUserErrorConstants.NOT_FOUND_USER),
      );
      expect(inviteCodeRepository.findByUnique).toHaveBeenCalledWith(inviteCode);
      expect(userRepository.findByUserProfile).not.toHaveBeenCalled();
    });
  });
});
