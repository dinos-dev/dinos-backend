import { ProfileRepository } from 'src/domain/user/repository/profile.repository';
import { mockPrismaService, MockPrismaService } from '../../__mocks__/prisma.service.mock';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { createProfileMock } from '../user.factory';
import { CreateUserProfileDto } from 'src/domain/user/dto/request/create-user-profile.dto';
import { UpdateUserProfileDto } from 'src/domain/user/dto/request/update-user-profile.dto';

describe('ProfileRepository', () => {
  let repository: ProfileRepository;
  let prismaService: MockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService(),
        },
      ],
    }).compile();

    repository = module.get<ProfileRepository>(ProfileRepository);
    prismaService = module.get<MockPrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('userId가 존재하면 프로필 정보를 반환한다.', async () => {
      // 1. given
      const userId = 1;
      const mockResult = createProfileMock();

      prismaService.profile.findUnique.mockResolvedValue(mockResult);

      // 2. when
      const result = await repository.findByUserId(userId);

      // 3. then
      expect(prismaService.profile.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual(mockResult);
    });
    it('userId가 존재하지 않으면 null을 반환한다.', async () => {
      // 1. given
      const userId = 999;
      prismaService.profile.findUnique.mockResolvedValue(null);

      // 2. when
      const result = await repository.findByUserId(userId);

      // 3. then
      expect(prismaService.profile.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('프로필 정보를 생성하고 반환한다.', async () => {
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

      prismaService.profile.create.mockResolvedValue(mockResult);

      // 2. when
      const result = await repository.create(dto, userId);

      // 3. then
      expect(prismaService.profile.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          userId,
        },
      });
      expect(result).toEqual(mockResult);
    });
  });
  describe('update', () => {
    it('프로필 정보를 수정하고 반환한다.', async () => {
      // 1. given
      const id = 1;
      const dto: UpdateUserProfileDto = {
        nickName: 'update mock user',
        comment: 'update mock comment',
        headerId: 2,
        bodyId: 3,
        headerColor: '#789120',
        bodyColor: '#123456',
      };

      const mockResult = createProfileMock();

      prismaService.profile.update.mockResolvedValue(mockResult);

      // 2. when
      const result = await repository.update(id, dto);

      // 3. then
      expect(prismaService.profile.update).toHaveBeenCalledWith({
        where: { id },
        data: dto,
      });
      expect(result).toEqual(mockResult);
    });
  });
});
