/**
 * 범용 Repository 인터페이스
 * 다양한 ORM에서 공통으로 사용할 수 있는 CRUD 메서드 정의
 * 트랜잭션 파라미터 제거 - nestjs-cls가 자동 관리
 */
export interface IRepository<T, ID = number> {
  findAll(): Promise<T[]>;
  findById(id: ID): Promise<T | null>;
  findByUnique<K extends keyof T>(key: K, value: T[K]): Promise<T | null>;

  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'version'>): Promise<T>;
  updateById(id: ID, entity: Partial<T>): Promise<T>;
  removeById(id: ID): Promise<T>;

  find(options: {
    where?: Partial<T>;
    select?: Partial<Record<keyof T, boolean>>;
    orderBy?: { [K in keyof T]?: 'asc' | 'desc' } | Array<{ [K in keyof T]?: 'asc' | 'desc' }>;
  }): Promise<T[]>;

  upsert(options: { where: Partial<T>; create: T; update: Partial<T> }): Promise<T>;
}
