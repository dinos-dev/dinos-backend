import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { TransactionalPrismaService } from 'src/infrastructure/database/prisma/transactional-prisma.service';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly txService: TransactionalPrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        // Prisma 쪽 롤백은 자동 처리
        return throwError(() => err);
      }),
    );
  }
}

// import {
//   CallHandler,
//   ExecutionContext,
//   HttpException,
//   Injectable,
//   InternalServerErrorException,
//   NestInterceptor,
// } from '@nestjs/common';
// import { DataSource, QueryRunner } from 'typeorm';
// import { catchError, Observable, tap } from 'rxjs';
// import { HttpErrorConstants } from 'src/common/http/http-error-objects';

// @Injectable()
// export class TransactionInterceptor implements NestInterceptor {
//   constructor(private readonly dataSource: DataSource) {}
//   async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
//     const req = context.switchToHttp().getRequest();

//     const qr: QueryRunner = this.dataSource.createQueryRunner();

//     await qr.connect();
//     await qr.startTransaction();

//     req.queryRunner = qr;

//     return next.handle().pipe(
//       catchError(async (e) => {
//         await qr.rollbackTransaction();
//         await qr.release();
//         console.error('e ->', e);
//         // Todo:// 비즈니스 로직에서 임의로 Throw Exception 시킨 정보를 별도로 처리 가능한지 테스트
//         if (e instanceof HttpException) {
//           console.error(`error message -> ${e.message}, error status -> ${e.getStatus()}`);
//           throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_DATABASE_ERROR);
//         } else {
//           throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
//         }
//       }),
//       tap(async () => {
//         console.log('start Transaction');
//         await qr.commitTransaction();
//         await qr.release();
//       }),
//     );
//   }
// }
