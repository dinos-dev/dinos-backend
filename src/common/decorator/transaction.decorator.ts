import { DataSource, QueryRunner } from 'typeorm';

// 제네릭 타입 정의
type Constructor<T> = new (...args: any[]) => T; // 클래스 생성자 타입
type MethodResult = Promise<any>; // 메서드 반환 타입

/**
 * @Transactional 데코레이터
 * @param T - dataSource 속성을 가진 클래스
 * @param A - 메서드 인수 배열
 * @returns 데코레이터 함수
 *
 * Service Layer에서 트랜잭션을 관리하기 위한 데코레이터
 * 메서드가 호출될 때마다 새로운 QueryRunner를 생성 및 시작
 */
export function Transactional<T extends { dataSource: DataSource }, A extends any[]>() {
  return function (
    target: Constructor<T>, // 클래스 생성자
    propertyName: string,
    descriptor: TypedPropertyDescriptor<(...args: [QueryRunner, ...A]) => MethodResult>, // 메서드 디스크립터
  ) {
    const originalMethod = descriptor.value!; // 메서드 존재 보장

    descriptor.value = async function (this: T, ...args: [QueryRunner, ...A]): MethodResult {
      const { dataSource } = this;
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const result = await originalMethod.apply(this, [queryRunner, ...args.slice(1)]);
        await queryRunner.commitTransaction();
        return result;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    };
  };
}
