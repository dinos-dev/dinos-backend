import { Inject, Injectable } from '@nestjs/common';
import { FILE_UPLOAD_SERVICE } from 'src/common/config/common.const';
import { CreatePresignedUrlDto } from 'src/common/dto/create.presigned-url.dto';
import { PresignedUrlResponseDto } from 'src/common/dto/presigned-url.response.dto';
import { IFileUploadService } from 'src/common/interface/file-upload.interface';

@Injectable()
export class ReviewService {
  constructor(
    @Inject(FILE_UPLOAD_SERVICE)
    private readonly fileUploadService: IFileUploadService,
  ) {}

  async getSignedUrl(dto: CreatePresignedUrlDto): Promise<PresignedUrlResponseDto> {
    return await this.fileUploadService.createPresignedUrl(dto, 'reviews');
  }
}
