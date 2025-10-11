import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from 'src/user/presentation/user.controller';
import { UserService } from 'src/user/application/user.service';
import { CreateUserProfileDto } from 'src/user/presentation/dto/request/create-user-profile.dto';
import { UpdateUserProfileDto } from 'src/user/presentation/dto/request/update-user-profile.dto';
import { HttpResponse } from 'src/common/http/http-response';
import { createProfileMock } from '../../__mocks__/user.factory';
import { UserProfileResponseDto } from 'src/user/presentation/dto/response/profile.response.dto';
import { plainToInstance } from 'class-transformer';

describe('UserController', () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createProfile: jest.fn(),
            updateProfile: jest.fn(),
            findByProfile: jest.fn(),
            withdrawUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService);
  });

  describe('createProfile', () => {
    it('should return created profile response', async () => {
      // 1. given
      const dto: CreateUserProfileDto = { nickname: '테스터' };
      const userId = 1;
      const createdProfile = createProfileMock();

      service.createProfile.mockResolvedValue(createdProfile);

      // 컨트롤러에서 직렬화를 시키기 때문에, 그대로 mocking
      const expectedDto = plainToInstance(UserProfileResponseDto, createdProfile, {
        excludeExtraneousValues: true,
      });

      // 2. when
      const result = await controller.createProfile(userId, dto);

      // 3. then
      expect(result).toEqual(HttpResponse.created(expect.objectContaining(expectedDto)));
      expect(service.createProfile).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('updateProfile', () => {
    it('should return updated profile response', async () => {
      // 1. given
      const dto: UpdateUserProfileDto = { nickname: '업데이트됨' };
      const profileId = 1;
      const updatedProfile = createProfileMock();

      service.updateProfile.mockResolvedValue(updatedProfile);

      const expectedDto = plainToInstance(UserProfileResponseDto, updatedProfile, {
        excludeExtraneousValues: true,
      });

      // 2. when
      const result = await controller.updateProfile(profileId, dto);

      // 3. then
      expect(result).toEqual(HttpResponse.ok(expect.objectContaining(expectedDto)));
      expect(service.updateProfile).toHaveBeenCalledWith(profileId, dto);
    });
  });

  describe('findByProfile', () => {
    it('should return profile of the user', async () => {
      // 1. given
      const userId = 1;
      const profile = createProfileMock();

      service.findByProfile.mockResolvedValue(profile);

      const expectedDto = plainToInstance(UserProfileResponseDto, profile, {
        excludeExtraneousValues: true,
      });

      // 2. when
      const result = await controller.findByProfile(userId);

      // 3. then
      expect(result).toEqual(HttpResponse.ok(expect.objectContaining(expectedDto)));
      expect(service.findByProfile).toHaveBeenCalledWith(userId);
    });
  });

  describe('withdrawUser', () => {
    it('should call service and return no content response', async () => {
      const userId = 1;

      service.withdrawUser.mockResolvedValue(undefined);

      const result = await controller.withdrawUser(userId);

      expect(result).toEqual(HttpResponse.noContent());
      expect(service.withdrawUser).toHaveBeenCalledWith(userId);
    });
  });
});
