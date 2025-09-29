import { InviteCodeEntity } from '../entities/invite-code.entity';

export interface IInviteCodeRepository {
  findByCode(code: string): Promise<InviteCodeEntity | null>;
  isExistCode(code: string): Promise<boolean>;
  createInviteCode(entity: InviteCodeEntity): Promise<InviteCodeEntity>;
}
