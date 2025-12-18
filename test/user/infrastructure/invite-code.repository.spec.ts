import { TransactionHost } from '@nestjs-cls/transactional';
import { Test, TestingModule } from '@nestjs/testing';
import { InviteCodeRepository } from 'src/user/infrastructure/repository/invite-code.repository';
import { MockPrismaService, mockPrismaService } from '../../__mocks__/prisma.service.mock';
import { mockTransactionHost, MockTransactionHost } from '../../__mocks__/transaction-host.mock';
import { createMockInviteCode, createMockInviteCodeEntity } from '../../__mocks__/invite-code.factory';

describe('InviteCodeRepository', () => {
  let repository: InviteCodeRepository;
  let prismaService: MockPrismaService;
  let txHost: MockTransactionHost;

  const inviteCodeMockEntity = createMockInviteCodeEntity();

  const inviteCodeDatabaseMock = createMockInviteCode();

  beforeEach(async () => {
    prismaService = mockPrismaService();

    txHost = mockTransactionHost(prismaService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [InviteCodeRepository, { provide: TransactionHost, useValue: txHost }],
    }).compile();

    repository = module.get<InviteCodeRepository>(InviteCodeRepository);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isExistCode', () => {
    it('초대코드가 존재할 경우 true를 반환한다.', async () => {
      // 1. given
      const code = 'DEXTER12';
      txHost.tx.inviteCode.count.mockResolvedValue(1);
      // 2. when
      const result = await repository.isExistCode(code);
      // 3. then
      expect(result).toBe(true);
      expect(txHost.tx.inviteCode.count).toHaveBeenCalledWith({ where: { code } });
    });
    it('초대코드가 존재할 경우 false를 반환한다.', async () => {
      // 1. given
      const code = 'NOT_EXIST_CODE';
      txHost.tx.inviteCode.count.mockResolvedValue(0);
      // 2. when
      const result = await repository.isExistCode(code);
      // 3. then
      expect(result).toBe(false);
      expect(txHost.tx.inviteCode.count).toHaveBeenCalledWith({ where: { code } });
    });
  });

  describe('createInviteCode', () => {
    it('사용자의 초대 코드를 생성하고 초대 코드 순수 도메인 엔터티를 반환한다.', async () => {
      // 1. given
      txHost.tx.inviteCode.create.mockResolvedValue(inviteCodeDatabaseMock);
      // 2. when
      const result = await repository.createInviteCode(inviteCodeMockEntity);
      // 3. then
      expect(result).toEqual(inviteCodeMockEntity);
      expect(txHost.tx.inviteCode.create).toHaveBeenCalledWith({
        data: {
          userId: inviteCodeMockEntity.userId,
          code: inviteCodeMockEntity.code,
        },
      });
    });
  });

  describe('findByUnique', () => {
    it('초대코드가 존재할 경우 초대코드 순수 도메인 엔터티를 반환한다.', async () => {
      // 1. given
      txHost.tx.inviteCode.findUnique.mockResolvedValue(inviteCodeDatabaseMock);
      // 2. when
      const result = await repository.findByUnique(inviteCodeMockEntity.code);
      // 3. then
      expect(result).toEqual(inviteCodeMockEntity);
      expect(txHost.tx.inviteCode.findUnique).toHaveBeenCalledWith({ where: { code: inviteCodeMockEntity.code } });
    });
    it('초대코드가 존재하지 않을 경우 null을 반환한다.', async () => {
      // 1. given
      txHost.tx.inviteCode.findUnique.mockResolvedValue(null);
      // 2. when
      const result = await repository.findByUnique(inviteCodeMockEntity.code);
      // 3. then
      expect(result).toBeNull();
      expect(txHost.tx.inviteCode.findUnique).toHaveBeenCalledWith({ where: { code: inviteCodeMockEntity.code } });
    });
  });
});
