import { UserRepository } from 'src/user/infrastructure/repository/user.repository';
import { mockPrismaService, MockPrismaService } from '../../__mocks__/prisma.service.mock';
import { Test, TestingModule } from '@nestjs/testing';
import { Provider } from 'src/user/domain/const/provider.enum';
import {
  createMockUser,
  createMockUserEntity,
  createMockUserWithProfile,
  createMockUserWithTokens,
} from '../../__mocks__/user.factory';
import { mockTransactionHost, MockTransactionHost } from '../../__mocks__/transaction-host.mock';
import { TransactionHost } from '@nestjs-cls/transactional';
import { UserMapper } from 'src/user/infrastructure/mapper/user.mapper';
import { createMockToken } from '../../__mocks__/token.factory';
import { hashPassword } from 'src/common/helper/password.util';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prismaService: MockPrismaService;
  let txHost: MockTransactionHost;

  const userMockEntity = createMockUserEntity();
  const userDataBaseEntity = createMockUser();

  beforeEach(async () => {
    prismaService = mockPrismaService();

    txHost = mockTransactionHost(prismaService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: TransactionHost,
          useValue: txHost,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('existByEmail', () => {
    it('이메일 중복 여부를 체크하고 중복된 이메일이 존재할 경우 true를 반환한다.', async () => {
      // 1. given(정의 - 해당 이메일은 존재함.)
      const email = 'exist@test.com';
      txHost.tx.user.findUnique.mockResolvedValue(userDataBaseEntity);

      // 2. when(실행)
      const result = await repository.existByEmail(email);

      // 3. then(검증)
      expect(result).toBe(true);
      expect(txHost.tx.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    });

    it('이메일 중복 여부를 체크하고 중복된 이메일이 없을 경우 false를 반환한다.', async () => {
      //1. given ( 정의 - 해당 이메일은 없음 )
      const email = 'not-exist@test.com';
      txHost.tx.user.findUnique.mockResolvedValue(null);

      // 2. when(실행)
      const result = await repository.existByEmail(email);

      // 3. then (검증)
      expect(result).toBe(false);
      expect(txHost.tx.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    });
  });

  describe('findOrCreateSocialUser', () => {
    it('소셜 사용자가 존재할 경우 유저를 생성하지 않고 반환한다.', async () => {
      // 1. given( 정의 - 이메일을 기반으로 사용자가 존재하는지 조회 )
      txHost.tx.user.findUnique.mockResolvedValue(userDataBaseEntity);

      // 2. when ( 실행 )
      const result = await repository.findOrCreateSocialUser(userMockEntity);

      // 3. then ( 검증 )
      const expectedUser = UserMapper.toDomain(userDataBaseEntity);
      expect(result).toEqual({ user: expectedUser, isNew: false });
      expect(txHost.tx.user.findUnique).toHaveBeenCalledWith({ where: { email: userMockEntity.email } });
      expect(txHost.tx.user.create).not.toHaveBeenCalled();
    });

    it('소셜 사용자가 존재하지 않을 경우 유저를 생성하고 반환한다.', async () => {
      // 1. given( 정의 - 새로운 소셜 사용자 엔티티 생성 )
      const newUserEntity = createMockUserEntity({
        email: 'new@test.com',
        name: 'newUser',
        provider: Provider.GOOGLE,
        providerId: 'providerId987654321',
      });

      const newUserDatabaseEntity = createMockUser({
        email: 'new@test.com',
        name: 'newUser',
        provider: Provider.GOOGLE,
        providerId: 'providerId987654321',
      });

      // 사용자가 없다고 가정 (findUnique는 null 반환)
      txHost.tx.user.findUnique.mockResolvedValue(null);

      // 사용자 생성 시 반환될 데이터
      txHost.tx.user.create.mockResolvedValue(newUserDatabaseEntity);

      // 2. when ( 실행 )
      const result = await repository.findOrCreateSocialUser(newUserEntity);

      // 3. then ( 검증 )
      expect(txHost.tx.user.findUnique).toHaveBeenCalledWith({ where: { email: newUserEntity.email } });
      // create가 올바른 데이터로 호출되었는지 확인
      expect(txHost.tx.user.create).toHaveBeenCalledWith({
        data: {
          email: newUserEntity.email,
          name: newUserEntity.name,
          provider: newUserEntity.provider,
          providerId: newUserEntity.providerId,
        },
      });
      const expectedUser = UserMapper.toDomain(newUserDatabaseEntity);
      expect(result).toEqual({ user: expectedUser, isNew: true });
    });
  });

  describe('findAllRefToken', () => {
    it('userId에 해당하는 유저 토큰 정보를 반환한다.', async () => {
      // 1. given
      const userId = 1;
      const mockResult = createMockUserWithTokens({ ...userDataBaseEntity, tokens: [createMockToken()] });

      txHost.tx.user.findUnique.mockResolvedValue(mockResult);

      // 2. when
      const result = await repository.findAllRefToken(userId);

      // 3. then
      expect(txHost.tx.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { tokens: true },
      });
      const expectedUser = UserMapper.toDomainWithTokens(mockResult);
      const expectedTokens = UserMapper.extractTokens(mockResult);

      expect(result).toEqual({ user: expectedUser, tokens: expectedTokens });
    });

    it('userId에 해당하는 유저 토큰 정보가 없으면 빈 토큰 배열을 반환한다.', async () => {
      // 1. given
      const userId = 1;
      const mockResult = createMockUserWithTokens({ ...userDataBaseEntity, tokens: [] });
      txHost.tx.user.findUnique.mockResolvedValue(mockResult);

      // 2. when
      const result = await repository.findAllRefToken(userId);

      // 3. then
      expect(txHost.tx.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { tokens: true },
      });
      const expectedUser = UserMapper.toDomainWithTokens(mockResult);
      const expectedTokens = UserMapper.extractTokens(mockResult);
      // extractTokens가 빈 배열을 반환하는지 검증
      expect(expectedTokens).toEqual([]);

      expect(result).toEqual({ user: expectedUser, tokens: expectedTokens });
    });
  });

  describe('findUserWithProfileById', () => {
    it('userId가 존재하면 유저의 정보와 프로필 정보를 반환한다.', async () => {
      // 1. given
      const userId = 1;
      const mockResult = createMockUserWithProfile();

      txHost.tx.user.findUnique.mockResolvedValue(mockResult);

      // 2. when
      const result = await repository.findUserWithProfileById(userId);

      // 3. then
      expect(txHost.tx.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { profile: true },
      });

      expect(result).toEqual(mockResult);
    });

    it('userId가 존재하지 않으면 null을 반환한다.', async () => {
      // 1. given
      const userId = 999;
      txHost.tx.user.findUnique.mockResolvedValue(null);

      // 2. when
      const result = await repository.findUserWithProfileById(userId);

      //3. then
      expect(txHost.tx.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { profile: true },
      });

      expect(result).toBeNull();
    });
  });

  describe('findOrCreateLocalUser', () => {
    it('이메일이 존재할 경우, 로컬 유저를 반환한다.', async () => {
      // 1. given
      txHost.tx.user.findUnique.mockResolvedValue(userDataBaseEntity);

      // 2. when
      const result = await repository.findOrCreateLocalUser(userMockEntity);

      // 3. then
      const user = UserMapper.toDomain(userDataBaseEntity);
      expect(result).toEqual({ user, isNew: false });
      expect(txHost.tx.user.findUnique).toHaveBeenCalledWith({ where: { email: userMockEntity.email } });
      expect(txHost.tx.user.create).not.toHaveBeenCalled();
    });

    it('이메일이 존재하지 않을 경우, 로컬 유저를 생성하고 반환한다.', async () => {
      // 1. given
      const plainPassword = 'password';
      const newUserEntity = createMockUserEntity({
        email: 'new@test.com',
        name: 'newUser',
        password: plainPassword,
      });

      // 실제 hashPassword 함수를 사용하여 해시 생성
      const hashedPassword = hashPassword(plainPassword);

      const newUserDatabaseEntity = createMockUser({
        email: 'new@test.com',
        name: 'newUser',
        password: hashedPassword,
      });

      txHost.tx.user.findUnique.mockResolvedValue(null);
      txHost.tx.user.create.mockResolvedValue(newUserDatabaseEntity);

      // 2. when
      const result = await repository.findOrCreateLocalUser(newUserEntity);

      // 3. then
      expect(txHost.tx.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: newUserEntity.email,
        },
      });
      expect(txHost.tx.user.create).toHaveBeenCalledWith({
        data: {
          email: newUserEntity.email,
          name: newUserEntity.name,
          password: expect.any(String),
        },
      });
      // password가 실제로 해시되었는지 확인 (bcrypt 해시 형식 검증)
      const createCall = txHost.tx.user.create.mock.calls[0][0];
      expect(createCall.data.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt 해시 형식
      expect(createCall.data.password).not.toBe(plainPassword); // 원본과 다름

      const expectedUser = UserMapper.toDomain(newUserDatabaseEntity);
      expect(result).toEqual({ user: expectedUser, isNew: true });
    });
  });

  describe('findByUserProfile', () => {
    it('userId에 해당하는 사용자의 프로필을 조회한다.', async () => {
      // 1.given
      const userId = 1;
      const mockUserWithProfile = createMockUserWithProfile({ id: userId });
      txHost.tx.user.findUnique.mockResolvedValue(mockUserWithProfile);

      // 2. when
      const result = await repository.findByUserProfile(userId);

      // 3. then
      expect(txHost.tx.user.findUnique).toHaveBeenCalledWith({ where: { id: userId }, include: { profile: true } });
      const expectedUser = UserMapper.toDomainWithProfile(mockUserWithProfile);
      const expectedProfile = UserMapper.extractProfile(mockUserWithProfile);
      expect(result).toEqual({ user: expectedUser, profile: expectedProfile });
    });
  });
});
