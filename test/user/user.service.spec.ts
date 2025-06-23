import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { PROFILE_REPOSITORY, USER_REPOSITORY } from 'src/core/config/common.const';
import { CreateUserProfileDto } from 'src/domain/user/dto/request/create-user-profile.dto';
import { IProfileRepository } from 'src/domain/user/interface/profile.repository.interface';
import { IUserRepository } from 'src/domain/user/interface/user.repository.interface';
import { UserService } from 'src/domain/user/user.service';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

import { createProfileMock } from './user.factory';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockPrismaService, mockPrismaService } from '../__mocks__/prisma.service.mock';
import { UpdateUserProfileDto } from 'src/domain/user/dto/request/update-user-profile.dto';

describe('UserService', () => {
  let service: UserService;
  const userRepository: jest.Mocked<IUserRepository> = mockDeep<IUserRepository>();
  const profileRepository: jest.Mocked<IProfileRepository> = mockDeep<IProfileRepository>();
  let prismaService: MockPrismaService;

  beforeEach(async () => {
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
          provide: PrismaService,
          useValue: mockPrismaService(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<MockPrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('creteProfile', () => {
    it('유저가 존재하고 프로필이 존재하지 않을 경우 새로운 프로필을 생성한다', async () => {
      // 1. given
      const userId = 1;
      const dto: CreateUserProfileDto = {
        nickName: 'Mock User',
        comment: 'Mock Comment',
        headerId: 1,
        bodyId: 1,
        headerColor: '#123456',
        bodyColor: '#123456',
      };
      const mockResult = createProfileMock();

      userRepository.findUserWithProfileById.mockResolvedValue({ id: userId } as User);
      profileRepository.findByUserId.mockResolvedValue(null);
      profileRepository.create.mockResolvedValue(mockResult);

      // 2. when
      const result = await service.createProfile(userId, dto);

      // 3. then
      expect(userRepository.findUserWithProfileById).toHaveBeenCalledWith(userId);
      expect(profileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(profileRepository.create).toHaveBeenCalledWith(dto, userId);
      expect(result).toEqual(mockResult);
    });

    it('유저가 존재하지 않을 경우 NotFoundException 예외를 발생시킨다', async () => {
      userRepository.findUserWithProfileById.mockResolvedValue(null);
      await expect(service.createProfile(9999999, {} as CreateUserProfileDto)).rejects.toThrow(NotFoundException);
    });
    it('이미 프로필이 존재할 경우 ConflictException 예외를 발생시킨다', async () => {
      userRepository.findUserWithProfileById.mockResolvedValue({ id: 1 } as User);
      profileRepository.findByUserId.mockResolvedValue(createProfileMock());

      await expect(service.createProfile(1, {} as CreateUserProfileDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateProfile', () => {
    it('프로필을 업데이트 한다.', async () => {
      // 1. given
      const id = 1;
      const dto: UpdateUserProfileDto = {
        nickName: 'Mock Update User',
        comment: 'Mock Update Comment',
        headerId: 3,
        bodyId: 2,
        headerColor: '#789012',
        bodyColor: '#123456',
      };

      const mockResult = createProfileMock();

      profileRepository.findById.mockResolvedValue(mockResult);
      profileRepository.update.mockResolvedValue(mockResult);
      profileRepository.findById.mockResolvedValue(mockResult);

      // 2. when
      const result = await service.updateProfile(id, dto);

      // 3. then
      expect(profileRepository.findById).toHaveBeenCalledWith(id);
      expect(profileRepository.update).toHaveBeenCalledWith(id, dto);
      expect(profileRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockResult);
    });
    it('프로필이 존재하지 않을 경우 NotFoundException 예외를 발생시킨다.', async () => {
      profileRepository.findById.mockResolvedValue(null);
      await expect(service.updateProfile(999999, {} as UpdateUserProfileDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('withdrawUser', () => {
    it('prisma transaction 기반 유저를 소프트 delete 처리한다.', async () => {
      const userId = 1;
      const tx = {
        user: { update: jest.fn() },
        token: { deleteMany: jest.fn() },
        profile: { delete: jest.fn() },
      };

      prismaService.$transaction.mockImplementation(async (cb) => cb(tx));

      await expect(service.withdrawUser(userId)).resolves.toBeUndefined();

      expect(tx.user.update).toHaveBeenCalledWith({ where: { id: userId }, data: { deletedAt: expect.any(Date) } });
      expect(tx.token.deleteMany).toHaveBeenCalledWith({ where: { userId } });
      expect(tx.profile.delete).toHaveBeenCalledWith({ where: { userId } });
    });
  });

  describe('findByProfile', () => {
    it('유저의 프로필을 조회한다.', async () => {
      // 1. given
      const userId = 1;
      const mockResult = createProfileMock();

      profileRepository.findByUserId.mockResolvedValue(mockResult);

      // 2. when
      const result = await service.findByProfile(userId);

      // 3. then
      expect(profileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockResult);
    });
    it('유저의 프로필이 존재하지 않을 경우 NotFoundException 예외를 발생시킨다.', async () => {
      profileRepository.findByUserId.mockResolvedValue(null);
      await expect(service.findByProfile(999999)).rejects.toThrow(NotFoundException);
    });
  });
});
