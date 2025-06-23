import { UserRepository } from 'src/domain/user/repository/user.repository';
import { mockPrismaService, MockPrismaService } from '../../__mocks__/prisma.service.mock';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { Provider } from 'src/domain/auth/constant/provider.enum';
import { SocialUserDto } from 'src/domain/user/dto/request/social-user.dto';
import { createMockUser, createMockUserWithProfile, createMockUserWithTokens } from '../user.factory';
import { CreateUserDto } from 'src/domain/user/dto/request/create-user.dto';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prismaService: MockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService(),
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<MockPrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('existByEmail', () => {
    it('이메일 중복 여부를 체크하고 중복된 이메일이 존재할 경우 true를 반환한다.', async () => {
      // 1. given(정의 - 해당 이메일은 존재함.)
      const email = 'exist@test.com';
      prismaService.user.findUnique.mockResolvedValue({ id: 1, email } as User);

      // 2. when(실행)
      const result = await repository.existByEmail(email);

      // 3. then(검증)
      expect(result).toBe(true);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    });

    it('이메일 중복 여부를 체크하고 중복된 이메일이 없을 경우 false를 반환한다.', async () => {
      //1. given ( 정의 - 해당 이메일은 없음 )
      const email = 'not-exist@test.com';
      prismaService.user.findUnique.mockResolvedValue(null);

      // 2. when(실행)
      const result = await repository.existByEmail(email);

      // 3. then (검증)
      expect(result).toBe(false);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    });
  });

  describe('findOrCreateSocialUser', () => {
    it('소셜 사용자가 존재할 경우 유저를 생성하지 않고 반환한다.', async () => {
      // 1. given( 정의 - 이메일을 기반으로 사용자가 존재하는지 조회 )

      const dto: SocialUserDto = {
        providerId: 'providerId123456789',
        email: 'exist@test.com',
        provider: Provider.GOOGLE,
        name: 'existUser',
      };

      const expectedUser = {
        id: 1,
        email: dto.email,
        name: dto.name,
        provider: dto.provider,
        providerId: dto.providerId,
      };

      prismaService.user.findUnique.mockResolvedValue(expectedUser as User);

      // 2. when ( 실행 )
      const result = await repository.findOrCreateSocialUser(dto);

      // 3. then ( 검증 )
      expect(result).toEqual(expectedUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });
    it('소셜 사용자가 존재하지 않을 경우 유저를 생성하고 반환한다.', async () => {
      // 1. given( 정의 - 이메일을 기반으로 사용자가 존재하는지 조회 )
      const dto: SocialUserDto = {
        providerId: 'providerId987654321',
        email: 'new@test.com',
        provider: Provider.GOOGLE,
        name: 'newUser',
      };

      const createdUser = {
        id: 2,
        email: dto.email,
        name: dto.name,
        provider: dto.provider,
        providerId: dto.providerId,
      };

      // 사용자가 없다고 가정
      prismaService.user.findUnique.mockResolvedValue(null);

      // 사용자 생성
      prismaService.user.create.mockResolvedValue(createdUser as User);

      // 2. when ( 실행 )
      const result = await repository.findOrCreateSocialUser(createdUser);

      // 3. then ( 검증 )
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          name: dto.name,
          provider: dto.provider,
          providerId: dto.providerId,
        },
      });
      expect(result).toEqual(createdUser);
    });
  });

  describe('findAllRefToken', () => {
    it('userId가 존재하면 유저 토큰을 포함한 유저 데이터를 반환한다.', async () => {
      // 1. given
      const userId = 1;
      const mockResult = createMockUserWithTokens();

      prismaService.user.findUnique.mockResolvedValue(mockResult);

      // 2. when
      const result = await repository.findAllRefToken(userId);

      // 3. then
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { tokens: true },
      });

      expect(result).toEqual(mockResult);
    });

    it('userId가 존재하지 않으면 null을 반환한다.', async () => {
      // 1. given
      const userId = 999;
      prismaService.user.findUnique.mockResolvedValue(null);

      // 2. when
      const result = await repository.findAllRefToken(userId);

      // 3. then
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { tokens: true },
      });

      expect(result).toBeNull();
    });
  });

  describe('findUserWithProfileById', () => {
    it('userId가 존재하면 유저의 정보와 프로필 정보를 반환한다.', async () => {
      // 1. given
      const userId = 1;
      const mockResult = createMockUserWithProfile();

      prismaService.user.findUnique.mockResolvedValue(mockResult);

      // 2. when
      const result = await repository.findUserWithProfileById(userId);

      // 3. then
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { profile: true },
      });

      expect(result).toEqual(mockResult);
    });

    it('userId가 존재하지 않으면 null을 반환한다.', async () => {
      // 1. given
      const userId = 999;
      prismaService.user.findUnique.mockResolvedValue(null);

      // 2. when
      const result = await repository.findUserWithProfileById(userId);

      //3. then
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { profile: true },
      });

      expect(result).toBeNull();
    });
  });

  describe('findOrCreateLocalUser', () => {
    it('이메일이 존재할 경우, 로컬 유저를 반환한다.', async () => {
      // 1. given
      const dto: CreateUserDto = {
        email: 'exist@exist.com',
        password: 'password',
        name: 'existingUser',
      };

      const mockResult = createMockUser();

      prismaService.user.findUnique.mockResolvedValue(mockResult);

      // 2. when
      const result = await repository.findOrCreateLocalUser(dto);

      // 3. then
      expect(result).toEqual(mockResult);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: dto.email,
        },
      });
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });
    it('이메일이 존재하지 않을 경우, 로컬 유저를 생성하고 반환한다.', async () => {
      // 1. given
      const dto: CreateUserDto = {
        email: 'new@new.com',
        password: 'password',
        name: 'newUser',
      };

      const mockResult = createMockUser();

      prismaService.user.findUnique.mockResolvedValue(null);

      prismaService.user.create.mockResolvedValue(mockResult);

      // 2. when
      const result = await repository.findOrCreateLocalUser(dto);

      // 3. then
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: dto.email,
        },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          name: dto.name,
          password: expect.any(String),
        },
      });
      expect(result).toEqual(mockResult);
    });
  });
});
