import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { InviteCode } from '@prisma/client';
import { PrismaRepository } from 'src/infrastructure/database/prisma/prisma.repository.impl';
import { InviteCodeEntity } from 'src/user/domain/entities/invite-code.entity';
import { IInviteCodeRepository } from 'src/user/domain/repository/invite-code.repository.interface';
import { InviteCodeMapper } from '../mapper/invite-code.mapper';

@Injectable()
export class InviteCodeRepository extends PrismaRepository<InviteCode> implements IInviteCodeRepository {
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, (client) => client.inviteCode);
  }

  /**
   * inviteCode 기반 조회
   * @param code - invite code
   * @returns InviteCodeEntity | null
   */
  async findByCode(code: string): Promise<InviteCodeEntity | null> {
    const inviteCode = await this.model.findUnique({ where: { code } });
    return inviteCode ? InviteCodeMapper.toDomain(inviteCode) : null;
  }

  /**
   * inviteCode 기반 조회
   * @param code - invite code
   * @returns boolean
   */
  async isExistCode(code: string): Promise<boolean> {
    return (await this.model.count({ where: { code } })) > 0;
  }

  /**
   * 초대 코드 생성
   * @param entity - InviteCodeEntity
   * @returns InviteCodeEntity
   */
  async createInviteCode(entity: InviteCodeEntity): Promise<InviteCodeEntity> {
    return await this.model.create({
      data: {
        userId: entity.userId,
        code: entity.code,
      },
    });
  }
}
