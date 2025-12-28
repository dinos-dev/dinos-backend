// import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';

// export class BaseCommonRepository<T> extends Repository<T> {
//   constructor(
//     private readonly dataSource: DataSource,
//     entity: any,
//   ) {
//     super(entity, dataSource.createEntityManager());
//   }

//   protected getManager(qr?: QueryRunner): EntityManager {
//     return qr ? qr.manager : this.dataSource.manager;
//   }
// }
