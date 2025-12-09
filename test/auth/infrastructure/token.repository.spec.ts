import { Test, TestingModule } from '@nestjs/testing';
import { TokenRepository } from 'src/auth/infrastructure/repository/token.repository';
import { mockPrismaService, MockPrismaService } from '../../__mocks__/prisma.service.mock';
import { mockTransactionHost, MockTransactionHost } from '../../__mocks__/transaction-host.mock';
import { createMockUserEntity } from '../../__mocks__/user.factory';
import { createMockToken } from '../../__mocks__/token.factory';
import { PlatformEnumType } from 'src/auth/domain/constant/platform.const';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TokenMapper } from 'src/auth/infrastructure/mapper/token.mapper';

describe('TokenRepository', () => {
  let repository: TokenRepository;
  let prismaService: MockPrismaService;
  let txHost: MockTransactionHost;

  const userMockEntity = createMockUserEntity();
  const token = createMockToken();
  const refToken = 'refToken';
  const expiresAt = new Date();
  const platform = PlatformEnumType.WEB;

  beforeEach(async () => {
    // mockPrismaService 생성
    prismaService = mockPrismaService();

    txHost = mockTransactionHost(prismaService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenRepository,
        {
          provide: TransactionHost,
          useValue: txHost,
        },
      ],
    }).compile();

    repository = module.get<TokenRepository>(TokenRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateOrCreateRefToken', () => {
    it('토큰이 존재할 경우 RefreshToken을 업데이트한다.', async () => {
      // 1. given
      txHost.tx.token.findFirst.mockResolvedValue(token);
      txHost.tx.token.update.mockResolvedValue(token);

      // 2. when
      const result = await repository.updateOrCreateRefToken(userMockEntity, refToken, platform, expiresAt);

      // 3. then
      const expectedTokenEntity = TokenMapper.toDomain(token);
      expect(result).toEqual(expectedTokenEntity);

      expect(txHost.tx.token.findFirst).toHaveBeenCalledWith({
        where: { userId: userMockEntity.id },
      });

      expect(txHost.tx.token.update).toHaveBeenCalledWith({
        where: { id: token.id },
        data: { refToken },
      });
    });

    it('토큰이 존재하지 않을 경우 토큰 데이터를 생성한다', async () => {
      // 1. given
      txHost.tx.token.findFirst.mockResolvedValue(null);
      txHost.tx.token.create.mockResolvedValue(token);

      // 2. when
      const result = await repository.updateOrCreateRefToken(userMockEntity, refToken, platform, expiresAt);

      // 3. then
      const expectedTokenEntity = TokenMapper.toDomain(token);
      expect(result).toEqual(expectedTokenEntity);

      expect(txHost.tx.token.findFirst).toHaveBeenCalledWith({
        where: { userId: userMockEntity.id },
      });

      expect(txHost.tx.token.create).toHaveBeenCalledWith({
        data: {
          userId: userMockEntity.id,
          refToken,
          platform,
          expiresAt,
        },
      });
    });
  });

  describe('deleteManyByUserId', () => {
    it('사용자의 ID를 기반으로 사용자 토큰을 제거한다.', async () => {
      // 1. given
      txHost.tx.token.deleteMany.mockResolvedValue({ count: 1 });

      const userId = 1;

      // 2. when
      const result = await repository.deleteManyByUserId(userId);

      // 3. then
      expect(txHost.tx.token.deleteMany).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toBe(1);
    });
  });
});
