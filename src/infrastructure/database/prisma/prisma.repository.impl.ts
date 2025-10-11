import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { IRepository } from './repository.interface';

/**
 * Generic Prisma Repository 구현체
 * nestjs-cls를 활용한 트랜잭션 컨텍스트 자동 관리
 */
@Injectable()
export abstract class PrismaRepository<T, ID = number> implements IRepository<T, ID> {
  constructor(
    protected readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    protected readonly getModel: (client: any) => any,
    protected readonly mapper?: (entity: T) => any,
  ) {}

  /**
   * 현재 컨텍스트에 맞는 Prisma Client를 반환
   * @Transactional 데코레이터가 활성화된 경우 트랜잭션 클라이언트를,
   * 그렇지 않은 경우 일반 Prisma Client를 반환
   */
  protected get prisma() {
    return this.txHost.tx; // nestjs-cls가 자동으로 컨텍스트에 맞는 클라이언트 반환
  }

  /**
   * 현재 컨텍스트의 모델 인스턴스를 반환
   */
  protected get model() {
    return this.getModel(this.prisma);
  }

  /**
   * 도메인 Entity로 변환
   */
  protected toDomain(prismaEntity: T): any {
    if (this.mapper) {
      return this.mapper(prismaEntity);
    }
    return prismaEntity; // Mapper가 없으면 그대로 반환
  }

  async findAll(): Promise<any[]> {
    const entities = await this.model.findMany();
    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: ID): Promise<any | null> {
    const entity = await this.model.findUnique({
      where: { id },
    });

    if (!entity) return null;
    return this.toDomain(entity);
  }

  /**
   * Prisma 전용 메서드 - 다른 ORM에서는 지원하지 않음
   */
  async findByUnique<K extends keyof T>(key: K, value: T[K]): Promise<any | null> {
    const entity = await this.model.findUnique({
      where: { [key]: value },
    });

    if (!entity) return null;
    return this.toDomain(entity);
  }

  async create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'version'>): Promise<any> {
    const createdEntity = await this.model.create({
      data: entity,
    });

    return this.toDomain(createdEntity);
  }

  async updateById(id: ID, entity: Partial<T>): Promise<any> {
    const updatedEntity = await this.model.update({
      where: { id },
      data: entity,
    });

    return this.toDomain(updatedEntity);
  }

  async removeById(id: ID): Promise<any> {
    const removedEntity = await this.model.delete({
      where: { id },
    });

    return this.toDomain(removedEntity);
  }

  async find(options: {
    where?: Partial<T>;
    select?: Partial<Record<keyof T, boolean>>;
    orderBy?: { [K in keyof T]?: 'asc' | 'desc' } | Array<{ [K in keyof T]?: 'asc' | 'desc' }>;
  }): Promise<any[]> {
    const entities = await this.model.findMany({
      where: options.where,
      select: options.select,
      orderBy: options.orderBy,
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async upsert(options: { where: Partial<T>; create: T; update: Partial<T> }): Promise<any> {
    const entity = await this.model.upsert({
      where: options.where,
      create: options.create,
      update: options.update,
    });

    return this.toDomain(entity);
  }
}
