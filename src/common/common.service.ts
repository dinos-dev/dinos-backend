import { ObjectCannedACL, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_CONFIG } from './const/env-keys.const';

import { v4 as Uuid } from 'uuid';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { PRESINED_URL_EXPIRESIN } from './const/common.const';

@Injectable()
export class CommonService {
  private readonly s3: S3;
  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      credentials: {
        accessKeyId: configService.get<string>(ENV_CONFIG.AWS.S3_ACCESS_KEY_ID),
        secretAccessKey: configService.get<string>(ENV_CONFIG.AWS.S3_SECRET_KEY),
      },
    });
  }

  async createPresinedUrl(): Promise<string> {
    const params = {
      Bucket: this.configService.get<string>(ENV_CONFIG.AWS.BUKET_NAME),
      Key: `public/temp/${Uuid()}`,
      ACL: ObjectCannedACL.public_read,
    };
    try {
      const url = await getSignedUrl(this.s3, new PutObjectCommand(params), {
        expiresIn: PRESINED_URL_EXPIRESIN,
      });
      return url;
    } catch (err) {
      console.log('error->', err);
      throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
    }
  }
}
