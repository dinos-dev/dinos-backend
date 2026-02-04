import { Global, Module } from '@nestjs/common';
import { R2Service } from './r2.service';
import { FILE_UPLOAD_SERVICE } from 'src/common/config/common.const';

@Global()
@Module({
  providers: [
    {
      provide: FILE_UPLOAD_SERVICE,
      useClass: R2Service,
    },
  ],
  exports: [FILE_UPLOAD_SERVICE],
})
export class R2Module {}
