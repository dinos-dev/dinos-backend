import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, ValidateNested } from 'class-validator';
import { CreatePresignedUrlDto } from './create.presigned-url.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBulkPresignedUrlDto {
  @ApiProperty({
    description: 'presigned url 업로드 요청 리스트',
    type: [CreatePresignedUrlDto],
  })
  @IsArray()
  @ArrayMaxSize(10, { message: 'presigned url 업로드 요청은 최대 10개까지 가능합니다.' }) // 최대 10개
  @ValidateNested({ each: true })
  @Type(() => CreatePresignedUrlDto)
  files: CreatePresignedUrlDto[];
}
