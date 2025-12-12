import { InviteCode } from '@prisma/client';
import { InviteCodeEntity } from 'src/user/domain/entities/invite-code.entity';

export function createMockInviteCode(overrides: Partial<InviteCode> = {}): InviteCode {
  return {
    id: 1,
    userId: 1,
    code: 'D23XV045',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockInviteCodeEntity(overrides: Partial<InviteCodeEntity> = {}): InviteCodeEntity {
  return {
    id: 1,
    userId: 1,
    code: 'D23XV045',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
