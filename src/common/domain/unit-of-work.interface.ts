// 각 도메인에서 ORM에 국한되지 않고, 트랜잭션과 DB 일관성을 보장하기 위한 추상화 인터페이스
export interface IUnitOfWork {
  withTransaction<T>(work: () => Promise<T>): Promise<T>;
}
