import { EntityTarget, ObjectLiteral, QueryRunner, Repository } from 'typeorm';

/**
 * 트랜잭션을 비즈니스 로직에서 공통으로 관리하기 위한 유틸리티
 * @param type - Repository를 상속받은 클래스
 * @param queryRunner - QueryRunner
 * @param entity - EntityTarget
 * @returns - Repository를 상속받은 클래스의 인스턴스
 */
export function getTransactionalRepository<T>(
  type: { new (repository: Repository<ObjectLiteral>): T },
  queryRunner: QueryRunner,
  entity: EntityTarget<ObjectLiteral>,
): T {
  const userRepositoryFromDataSource = queryRunner.manager.getRepository(entity);
  return new type(userRepositoryFromDataSource);
}
