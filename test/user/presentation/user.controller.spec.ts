import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from 'src/user/presentation/user.controller';
import { UserService } from 'src/user/application/user.service';
import { CreateUserProfileDto } from 'src/user/presentation/dto/request/create-user-profile.dto';
import { UpdateUserProfileDto } from 'src/user/presentation/dto/request/update-user-profile.dto';
import { ProfileEntity } from 'src/user/domain/entities/profile.entity';
import { UserEntity } from 'src/user/domain/entities/user.entity';
import { UserProfileWithInviteDto } from 'src/user/application/dto/user-profile-with-invite.dto';
import { Provider } from 'src/user/domain/const/provider.enum';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createProfile: jest.fn(),
            updateProfile: jest.fn(),
            findByProfileWithInviteInfo: jest.fn(),
            withdrawUser: jest.fn(),
            findByInviteCode: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProfile', () => {
    const userId = 1;
    const dto: CreateUserProfileDto = {
      nickname: 'TestNickname',
      comment: 'Test comment',
      headerId: 1,
      bodyId: 1,
      headerColor: '#FFFFFF',
      bodyColor: '#000000',
    };

    it('유저 프로필을 성공적으로 생성한다.', async () => {
      // given
      userService.createProfile.mockResolvedValue(mockProfile);

      // when
      const result = await controller.createProfile(userId, dto);

      // then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(201);
      expect(userService.createProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId,
          nickname: dto.nickname,
          comment: dto.comment,
          headerId: dto.headerId,
          bodyId: dto.bodyId,
          headerColor: dto.headerColor,
          bodyColor: dto.bodyColor,
        }),
      );
    });

    it('UserService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // given
      const error = new Error('Service error');
      userService.createProfile.mockRejectedValue(error);

      // when & then
      await expect(controller.createProfile(userId, dto)).rejects.toThrow(error);
    });
  });

  describe('updateProfile', () => {
    const userId = 1;
    const profileId = 1;
    const dto: UpdateUserProfileDto = {
      nickname: 'UpdatedNickname',
      comment: 'Updated comment',
    };

    it('유저 프로필을 성공적으로 수정한다.', async () => {
      // given
      const updatedProfile = new ProfileEntity(
        profileId,
        userId,
        'UpdatedNickname',
        'Updated comment',
        1,
        1,
        '#FFFFFF',
        '#000000',
        new Date(),
        new Date(),
        0,
      );
      userService.updateProfile.mockResolvedValue(updatedProfile);

      // when
      const result = await controller.updateProfile(userId, profileId, dto);

      // then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(200);
      expect(userService.updateProfile).toHaveBeenCalledWith(
        profileId,
        expect.objectContaining({
          userId: userId,
          nickname: dto.nickname,
          comment: dto.comment,
        }),
      );
    });

    it('UserService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // given
      const error = new Error('Service error');
      userService.updateProfile.mockRejectedValue(error);

      // when & then
      await expect(controller.updateProfile(userId, profileId, dto)).rejects.toThrow(error);
    });
  });

  describe('findByProfileWithInviteInfo', () => {
    const userId = 1;

    it('유저 프로필과 초대코드 정보를 성공적으로 조회한다.', async () => {
      // given
      userService.findByProfileWithInviteInfo.mockResolvedValue(mockUserProfileWithInvite);

      // when
      const result = await controller.findByProfileWithInviteInfo(userId);

      // then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(200);
      expect(userService.findByProfileWithInviteInfo).toHaveBeenCalledWith(userId);
    });

    it('UserService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // given
      const error = new Error('Service error');
      userService.findByProfileWithInviteInfo.mockRejectedValue(error);

      // when & then
      await expect(controller.findByProfileWithInviteInfo(userId)).rejects.toThrow(error);
    });
  });

  describe('withdrawUser', () => {
    const userId = 1;

    it('회원탈퇴를 성공적으로 처리한다.', async () => {
      // given
      userService.withdrawUser.mockResolvedValue(undefined);

      // when
      const result = await controller.withdrawUser(userId);

      // then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(204);
      expect(userService.withdrawUser).toHaveBeenCalledWith(userId);
    });

    it('UserService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // given
      const error = new Error('Service error');
      userService.withdrawUser.mockRejectedValue(error);

      // when & then
      await expect(controller.withdrawUser(userId)).rejects.toThrow(error);
    });
  });

  describe('findByInviteCode', () => {
    const inviteCode = 'TEST123';

    it('초대코드로 유저를 성공적으로 조회한다.', async () => {
      // given
      userService.findByInviteCode.mockResolvedValue({
        user: mockUser,
        profile: mockProfile,
      });

      // when
      const result = await controller.findByInviteCode(inviteCode);

      // then
      expect(result).toBeDefined();
      expect(result.getStatus()).toBe(200);
      expect(userService.findByInviteCode).toHaveBeenCalledWith(inviteCode);
    });

    it('UserService에서 에러가 발생하면 그대로 전파한다.', async () => {
      // given
      const error = new Error('Service error');
      userService.findByInviteCode.mockRejectedValue(error);

      // when & then
      await expect(controller.findByInviteCode(inviteCode)).rejects.toThrow(error);
    });
  });
});
