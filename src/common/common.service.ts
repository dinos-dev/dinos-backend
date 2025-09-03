// import { ObjectCannedACL, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
// import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';

// import { v4 as Uuid } from 'uuid';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { HttpErrorConstants } from 'src/common/http/http-error-objects';
// import { CreatePresignedUrlDto } from './dto/create.presigned-url.dto';
// import { RESIGNED_URL_EXPIRES_IN } from 'src/common/config/common.const';

// @Injectable()
// export class CommonService {
//   private readonly s3: S3;
//   constructor(private readonly configService: ConfigService) {
//     this.s3 = new S3({
//       credentials: {
//         accessKeyId: configService.get<string>('S3_ACCESS_KEY_ID'),
//         secretAccessKey: configService.get<string>('S3_SECRET_KEY'),
//       },
//     });
//   }

//   /**
//    * PresignedUrl 생성
//    * @param dto CreatePresignedUrlDto
//    * @returns PresignedUrl
//    */
//   async createPresignedUrl(dto: CreatePresignedUrlDto): Promise<string> {
//     const fileExtension = dto.filename.split('.').pop();

//     const params = {
//       Bucket: this.configService.get<string>('BUCKET_NAME'),
//       Key: `public/temp/${Date.now()}_${Uuid()}.${fileExtension}`,
//       ACL: ObjectCannedACL.public_read,
//       ContentType: dto.mimeType,
//       ContentLength: dto.size,
//     };
//     try {
//       const url = await getSignedUrl(this.s3, new PutObjectCommand(params), {
//         expiresIn: RESIGNED_URL_EXPIRES_IN,
//       });
//       return url;
//     } catch (err) {
//       console.log('error->', err);
//       throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
//     }
//   }
// }
