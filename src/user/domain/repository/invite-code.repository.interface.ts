import { InviteCodeEntity } from '../entities/invite-code.entity';

export interface IInviteCodeRepository {
  findByUnique<K extends keyof InviteCodeEntity>(key: K, value: InviteCodeEntity[K]): Promise<InviteCodeEntity | null>;
  isExistCode(code: string): Promise<boolean>;
  createInviteCode(entity: InviteCodeEntity): Promise<InviteCodeEntity>;
}
