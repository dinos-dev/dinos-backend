import { PresignedUrlResponseDto } from '../dto/presigned-url.response.dto';

export interface PresignedUrlParams {
  filename: string;
  size: number;
  mimeType: string;
}

export interface IFileUploadService {
  createPresignedUrl(params: PresignedUrlParams, prefix: string): Promise<PresignedUrlResponseDto>;
  getCdnUrl(key: string): string;
}
