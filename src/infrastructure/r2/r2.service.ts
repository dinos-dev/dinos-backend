import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as Uuid } from 'uuid';

import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { IFileUploadService, PresignedUrlParams } from 'src/common/interface/file-upload.interface';
import { WinstonLoggerService } from '../logger/winston-logger.service';
import { PresignedUrlResponseDto } from 'src/common/dto/presigned-url.response.dto';

@Injectable()
export class R2Service implements IFileUploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly cdnUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: WinstonLoggerService,
  ) {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${this.configService.get<string>('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY')!,
        secretAccessKey: this.configService.get<string>('R2_SECRET_KEY')!,
      },
      forcePathStyle: true,
      requestChecksumCalculation: 'WHEN_REQUIRED',
    });

    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME')!;
    this.cdnUrl = this.configService.get<string>('R2_CDN_URL')!;
  }

  /**
   * @param params - 파일 정보(filename, size, mimeType)
   * @param prefix - 파일 저장 경로
   * @returns 파일 업로드 URL
   */
  async createPresignedUrl(params: PresignedUrlParams, prefix: string): Promise<PresignedUrlResponseDto> {
    const fileExtension = params.filename.split('.').pop();
    const key = `${prefix}/${Date.now()}_${Uuid()}.${fileExtension}`;

    try {
      const url = await getSignedUrl(
        this.s3Client,
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          ContentType: params.mimeType,
          ContentLength: params.size,
        }),
        { expiresIn: 3600 }, // 1 시간
      );

      return {
        presignedUrl: url,
        cdnUrl: this.getCdnUrl(key),
      };
    } catch (err) {
      this.logger.error(`Failed to create presigned url: ${err.message}`);
      throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
    }
  }

  getCdnUrl(key: string): string {
    return `${this.cdnUrl}/${key}`;
  }
}
