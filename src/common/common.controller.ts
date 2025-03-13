import { Body, Controller, Post } from '@nestjs/common';
import { CommonService } from './common.service';

import { HttpResponse } from 'src/core/http/http-response';
import { CreatePresinedURLDocs } from './swagger/rest-swagger.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/core/swagger/response/api-error-common-response';
import { CreatePresinedUrlDto } from './dto/create.presined-url.dto';

@ApiTags('Common - 공용 API 핸들러 모듈')
@ApiCommonErrorResponseTemplate()
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @CreatePresinedURLDocs()
  @Post('/presined-url')
  async createPresinedUrl(@Body() dto: CreatePresinedUrlDto) {
    const url = await this.commonService.createPresinedUrl(dto);
    return HttpResponse.created(url);
  }
}
