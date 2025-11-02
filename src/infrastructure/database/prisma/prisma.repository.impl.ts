import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Prisma } from '@prisma/client';

/**
 *
 * Generic Prisma Repository 구현체
 * nestjs-cls를 활용한 트랜잭션 컨텍스트 자동 관리
 *
 * @param TPrisma - Prisma 생성 타입
 * @param TDomain - 도메인 엔티티 타입
 * @param ID - ID 타입 (기본값: number)
 */
@Injectable()
export abstract class PrismaRepository<TPrisma, TDomain = TPrisma, ID = number> {
  constructor(
    protected readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    protected readonly getModel: (client: Prisma.TransactionClient) => any,
    protected readonly mapper?: (prismaEntity: TPrisma) => TDomain,
  ) {}

  protected get prisma() {
    return this.txHost.tx;
  }

  protected get model() {
    return this.getModel(this.prisma);
  }

  /** Prisma Entity to Domain Entity */
  protected toDomain(prismaEntity: TPrisma): TDomain {
    if (this.mapper) {
      return this.mapper(prismaEntity);
    }
    return prismaEntity as unknown as TDomain;
  }

  /**
   * Array to Domain
   */
  protected toDomains(prismaEntities: TPrisma[]): TDomain[] {
    return prismaEntities.map((entity) => this.toDomain(entity));
  }

  // ========================================
  // Generic Methods - Only Basic CRUD
  // ========================================

  /** Find Entity by ID */
  async findById(id: ID): Promise<TDomain | null> {
    const entity = await this.model.findUnique({ where: { id } });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  /** Find All Entities */
  async findAll(): Promise<TDomain[]> {
    const entities = await this.model.findMany();
    return this.toDomains(entities);
  }

  /** Create Entity*/
  async create(data: unknown): Promise<TDomain> {
    const entity = await (this.model.create as any)({ data });
    return this.toDomain(entity);
  }

  /** Update Entity by ID */
  async updateById(id: ID, data: unknown): Promise<TDomain> {
    const entity = await (this.model.update as any)({
      where: { id },
      data,
    });
    return this.toDomain(entity);
  }

  /** Remove Entity by ID */
  async removeById(id: ID): Promise<TDomain> {
    const entity = await this.model.delete({ where: { id } });
    return this.toDomain(entity);
  }

  /** Check Entity exists by ID */
  async existsById(id: ID): Promise<boolean> {
    const count = await this.model.count({ where: { id } });
    return count > 0;
  }

  /** Count Entity by where */
  async count(where?: unknown): Promise<number> {
    return await (this.model.count as any)({ where });
  }
}
