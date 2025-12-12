import { ProfileRepository } from 'src/user/infrastructure/repository/profile.repository';
import { mockPrismaService, MockPrismaService } from '../../__mocks__/prisma.service.mock';
import { Test, TestingModule } from '@nestjs/testing';
import { createMockProfileEntity, createProfileMock } from '../../__mocks__/user.factory';
import { mockTransactionHost, MockTransactionHost } from '../../__mocks__/transaction-host.mock';
import { TransactionHost } from '@nestjs-cls/transactional';
import { ProfileMapper } from 'src/user/infrastructure/mapper/profile.mapper';

describe('ProfileRepository', () => {
  let repository: ProfileRepository;
  let prismaService: MockPrismaService;
  let txHost: MockTransactionHost;

  const profileMockEntity = createMockProfileEntity();
  const profileDataBaseMockEntity = createProfileMock();

  beforeEach(async () => {
    prismaService = mockPrismaService();

    txHost = mockTransactionHost(prismaService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileRepository,
        {
          provide: TransactionHost,
          useValue: txHost,
        },
      ],
    }).compile();

    repository = module.get<ProfileRepository>(ProfileRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProfile', () => {
    it('프로필 정보를 생성하고 반환한다.', async () => {
      // 1. given
      txHost.tx.profile.create.mockResolvedValue(profileDataBaseMockEntity);

      // 2. when
      const result = await repository.createProfile(profileMockEntity);

      // 3. then
      expect(txHost.tx.profile.create).toHaveBeenCalledWith({
        data: {
          nickname: profileMockEntity.nickname,
          comment: profileMockEntity.comment,
          headerId: profileMockEntity.headerId,
          bodyId: profileMockEntity.bodyId,
          headerColor: profileMockEntity.headerColor,
          bodyColor: profileMockEntity.bodyColor,
          user: {
            connect: { id: profileMockEntity.userId },
          },
        },
      });
      const expectedProfile = ProfileMapper.toDomain(profileDataBaseMockEntity);
      expect(result).toEqual(expectedProfile);
    });
  });
  describe('updateById', () => {
    it('프로필 아이디를 기반으로 사용자의 프로필 정보를 수정하고 반환한다.', async () => {
      // 1. given
      const id = 1;
      txHost.tx.profile.update.mockResolvedValue(profileDataBaseMockEntity);

      // 2. when
      const result = await repository.updateById(id, profileMockEntity);

      // 3. then
      expect(txHost.tx.profile.update).toHaveBeenCalledWith({
        where: { id },
        data: {
          nickname: profileMockEntity.nickname,
          comment: profileMockEntity.comment,
          headerId: profileMockEntity.headerId,
          bodyId: profileMockEntity.bodyId,
          headerColor: profileMockEntity.headerColor,
          bodyColor: profileMockEntity.bodyColor,
        },
      });
      const expectedProfile = ProfileMapper.toDomain(profileDataBaseMockEntity);
      expect(result).toEqual(expectedProfile);
    });
  });
  describe('findByUserId', () => {
    it('userId에 해당하는 사용자가 존재할 경우 사용자의 프로필 순수 도메인 엔터티를 반환한다.', async () => {
      // 1. given
      const userId = 1;
      txHost.tx.profile.findUnique.mockResolvedValue(profileDataBaseMockEntity);

      // 2. when
      const result = await repository.findByUserId(userId);

      // 3. then
      expect(txHost.tx.profile.findUnique).toHaveBeenCalledWith({ where: { userId } });
      const expectedProfile = ProfileMapper.toDomain(profileDataBaseMockEntity);
      expect(result).toEqual(expectedProfile);
    });
    it('userId에 해당하는 사용자가 존재하지 않을 경우 null을 반환한다.', async () => {
      // 1. given
      const userId = 999;
      txHost.tx.profile.findUnique.mockResolvedValue(null);

      // 2. when
      const result = await repository.findByUserId(userId);

      // 3. then
      expect(txHost.tx.profile.findUnique).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toBeNull();
    });
  });
  describe('deleteManyByUserId', () => {
    it('userId에 해당하는 사용자의 프로필을 삭제한다.', async () => {
      // 1. given
      const userId = 1;
      txHost.tx.profile.deleteMany.mockResolvedValue({ count: 1 });

      // 2. when
      const result = await repository.deleteManyByUserId(userId);

      // 3. then
      expect(txHost.tx.profile.deleteMany).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toEqual(1);
    });
    it('userId에 해당하는 사용자의 프로필이 존재하지 않을 경우 0을 반환한다.', async () => {
      // 1. given
      const userId = 999;
      txHost.tx.profile.deleteMany.mockResolvedValue({ count: 0 });

      // 2. when
      const result = await repository.deleteManyByUserId(userId);

      // 3. then
      expect(result).toEqual(0);
    });
    it('userId에 해당하는 사용자의 프로필이 존재하지 않을 경우 0을 반환한다.', async () => {
      // 1. given
      const userId = 1;
      txHost.tx.profile.deleteMany.mockResolvedValue({ count: 1 });

      // 2. when
      const result = await repository.deleteManyByUserId(userId);

      // 3. then
      expect(txHost.tx.profile.deleteMany).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toEqual(1);
    });
  });
});
