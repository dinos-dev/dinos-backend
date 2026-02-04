import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsString, Max } from 'class-validator';

export class CreatePresignedUrlDto {
  @ApiProperty({
    name: 'filename',
    description: '업로드 하고자 하는 파일명을 추출해서 포함',
    example: 'my_profile',
  })
  @IsNotEmpty()
  @IsString()
  filename: string;

  @ApiProperty({
    name: 'size',
    description: '업로드 하고자 하는 파일의 사이즈를 추출해서 포함 ( 단위: byte, 최대 10MB까지 가능 )',
    example: 1048576,
  })
  @IsNotEmpty()
  @IsNumber()
  @Max(10 * 1024 * 1024, { message: '업로드 하고자 하는 파일의 사이즈는 최대 10MB까지 가능합니다.' }) // 10MB 제한
  size: number;

  @ApiProperty({
    name: 'mimeType',
    description: '업로드 하고자 하는 파일의 mimetype을 추출해서 포함 -> image/png, image/jpeg, image/jpg 3가지만 허용 ',
    example: 'image/jpeg',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['image/png', 'image/jpeg', 'image/jpg'])
  mimeType: string;
}
