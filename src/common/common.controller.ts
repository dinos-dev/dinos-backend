import { Body, Controller, Post } from '@nestjs/common';
import { CommonService } from './common.service';

import { HttpResponse } from 'src/common/http/http-response';
// import { CreatePresignedUrlDocs } from 'src/common/swagger/rest-swagger.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/common/swagger/response/api-error-common-response';
import { CreatePresignedUrlDto } from './dto/create.presigned-url.dto';

@ApiTags('Common - 공용 API 핸들러 모듈')
@ApiCommonErrorResponseTemplate()
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  // @CreatePresignedUrlDocs()
  @Post('/presigned-url')
  async CreatePresignedUrl(@Body() dto: CreatePresignedUrlDto) {
    const url = await this.commonService.createPresignedUrl(dto);
    return HttpResponse.created(url);
  }
}
