import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**login Response Dto*/
export class LoginResponseDto {
  @Expose()
  @ApiProperty({
    description: 'accessToken',
    example: 'eInR59.eyJiJhdCIsImlhdCI6MTc.37gbkd4jAx123c',
  })
  accessToken: string;

  @Expose()
  @ApiProperty({
    description: 'refreshToken',
    example: 'eInR59.eyJiJhdCIsImlhdCI6NCwfQ.37gzl2sdhc',
  })
  refreshToken: string;
}

export class RotateAccessTokenDto {
  @Expose()
  @ApiProperty({
    description: 'accessToken',
    example: 'eInR59.eyJiJhdCIsImlhdCI6MTc.37gbkd4jAx123c',
  })
  accessToken: string;
}
