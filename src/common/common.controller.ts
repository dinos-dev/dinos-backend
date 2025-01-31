import { Controller, Post } from '@nestjs/common';
import { CommonService } from './common.service';

import { HttpResponse } from 'src/core/http/http-response';
import { CreatePresinedURLDocs } from './swagger/rest-swagger.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/core/swagger/api-error-common-response';

@ApiTags('Common - 공용 API 핸들러 모듈')
@ApiCommonErrorResponseTemplate()
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @CreatePresinedURLDocs()
  @Post('/presined-url')
  async createPresinedUrl() {
    const url = await this.commonService.createPresinedUrl();
    return HttpResponse.created(url);
  }
}
