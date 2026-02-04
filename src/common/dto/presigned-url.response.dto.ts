import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlResponseDto {
  @ApiProperty({
    description: 'presigned url ( 업로드 요청 시 프론트에서 이용 가능한 presigned url )',
    type: String,
    example: 'https://example.com/presigned-url',
  })
  presignedUrl: string;

  @ApiProperty({
    description: 'cdn url ( 업로드 완료 후 경로값을 백단으로 보내기 위한 cdn url )',
    type: String,
    example: 'https://example.com/cdn-url',
  })
  cdnUrl: string;
}
