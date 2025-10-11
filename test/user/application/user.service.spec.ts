import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { PROFILE_REPOSITORY, TOKEN_REPOSITORY, USER_REPOSITORY } from 'src/common/config/common.const';
import { CreateUserProfileDto } from 'src/user/presentation/dto/request/create-user-profile.dto';
import { IProfileRepository } from 'src/user/domain/repository/profile.repository.interface';
import { IUserRepository } from 'src/user/domain/repository/user.repository.interface';
import { UserService } from 'src/user/application/user.service';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

import { createProfileMock } from '../../__mocks__/user.factory';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MockPrismaService, mockPrismaService } from '../../__mocks__/prisma.service.mock';
import { UpdateUserProfileDto } from 'src/user/presentation/dto/request/update-user-profile.dto';
import { ITokenRepository } from 'src/auth/domain/repository/token.repository.interface';

describe('UserService', () => {
  let service: UserService;
  let prismaService: MockPrismaService;

  const userRepository: jest.Mocked<IUserRepository> = mockDeep<IUserRepository>();
  const profileRepository: jest.Mocked<IProfileRepository> = mockDeep<IProfileRepository>();
  const tokenRepository: jest.Mocked<ITokenRepository> = mockDeep<ITokenRepository>();

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
          provide: TOKEN_REPOSITORY,
          useValue: tokenRepository,
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
        nickname: 'Mock User',
        comment: 'Mock Comment',
        headerId: 1,
        bodyId: 1,
        headerColor: '#123456',
        bodyColor: '#123456',
      };
      const mockResult = createProfileMock();

      userRepository.findById.mockResolvedValue({ id: userId } as User);
      profileRepository.findByUnique.mockResolvedValue(null);
      profileRepository.createProfile.mockResolvedValue(mockResult);

      // 2. when
      const result = await service.createProfile(userId, dto);

      // 3. then
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(profileRepository.findByUnique).toHaveBeenCalledWith('userId', userId);
      expect(profileRepository.createProfile).toHaveBeenCalledWith(dto, userId);
      expect(result).toEqual(mockResult);
    });

    it('유저가 존재하지 않을 경우 NotFoundException 예외를 발생시킨다', async () => {
      userRepository.findById.mockResolvedValue(null);
      await expect(service.createProfile(9999999, {} as CreateUserProfileDto)).rejects.toThrow(NotFoundException);
    });
    it('이미 프로필이 존재할 경우 ConflictException 예외를 발생시킨다', async () => {
      userRepository.findById.mockResolvedValue({ id: 1 } as User);
      profileRepository.findByUnique.mockResolvedValue(createProfileMock());

      await expect(service.createProfile(1, {} as CreateUserProfileDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateProfile', () => {
    it('프로필을 업데이트 한다.', async () => {
      // 1. given
      const id = 1;
      const dto: UpdateUserProfileDto = {
        nickname: 'Mock Update User',
        comment: 'Mock Update Comment',
        headerId: 3,
        bodyId: 2,
        headerColor: '#789012',
        bodyColor: '#123456',
      };

      const mockResult = createProfileMock();

      profileRepository.findById.mockResolvedValue(mockResult);
      profileRepository.updateById.mockResolvedValue(mockResult);
      profileRepository.findById.mockResolvedValue(mockResult);

      // 2. when
      const result = await service.updateProfile(id, dto);

      // 3. then
      expect(profileRepository.findById).toHaveBeenCalledWith(id);
      expect(profileRepository.updateById).toHaveBeenCalledWith(id, dto);
      expect(profileRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockResult);
    });
    it('프로필이 존재하지 않을 경우 NotFoundException 예외를 발생시킨다.', async () => {
      profileRepository.findById.mockResolvedValue(null);
      await expect(service.updateProfile(999999, {} as UpdateUserProfileDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('withdrawUser', () => {
    it('prisma transaction 기반 사용자 정보를 삭제 처리한다.', async () => {
      const userId = 1;

      // 1. 각 repository의 메서드 mock
      const deleteById = jest.fn();
      const deleteManyToken = jest.fn();
      const deleteManyProfile = jest.fn();

      // 2. repository mock 메서드 주입
      service['userRepository'].deleteById = deleteById;
      service['tokenRepository'].deleteManyByUserId = deleteManyToken;
      service['profileRepository'].deleteManyByUserId = deleteManyProfile;

      // 3. tx 객체를 흉내낼 필요 없이 tx를 mock 메서드의 인자로 넘겼는지만 확인
      const mockTx = {} as any;

      // 4. $transaction은 콜백을 받고 tx를 넘겨주는 함수로 mock
      jest.spyOn(prismaService, '$transaction').mockImplementation(async (cb) => cb(mockTx));

      // 5. 실행
      await expect(service.withdrawUser(userId)).resolves.toBeUndefined();

      // 6. 각 repository가 tx를 받아 호출됐는지 체크
      expect(deleteById).toHaveBeenCalledWith(userId, mockTx);
      expect(deleteManyToken).toHaveBeenCalledWith(userId, mockTx);
      expect(deleteManyProfile).toHaveBeenCalledWith(userId, mockTx);
    });
  });

  describe('findByProfile', () => {
    it('유저의 프로필을 조회한다.', async () => {
      // 1. given
      const userId = 1;
      const mockResult = createProfileMock();

      profileRepository.findByUnique.mockResolvedValue(mockResult);

      // 2. when
      const result = await service.findByProfile(userId);

      // 3. then
      expect(profileRepository.findByUnique).toHaveBeenCalledWith('userId', userId);
      expect(result).toEqual(mockResult);
    });
    it('유저의 프로필이 존재하지 않을 경우 NotFoundException 예외를 발생시킨다.', async () => {
      profileRepository.findByUnique.mockResolvedValue(null);
      await expect(service.findByProfile(999999)).rejects.toThrow(NotFoundException);
    });
  });
});
