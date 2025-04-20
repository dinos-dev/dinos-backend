import { ApiProperty } from '@nestjs/swagger';

/**login Response Dto*/
export class LoginResponseDto {
  @ApiProperty({
    description: 'accessToken',
    example: 'eInR59.eyJiJhdCIsImlhdCI6MTc.37gbkd4jAx123c',
  })
  accessToken: string;

  @ApiProperty({
    description: 'refreshToken',
    example: 'eInR59.eyJiJhdCIsImlhdCI6NCwfQ.37gzl2sdhc',
  })
  refreshToken: string;
}

export class RotateAccessTokenDto {
  @ApiProperty({
    description: 'accessToken',
    example: 'eInR59.eyJiJhdCIsImlhdCI6MTc.37gbkd4jAx123c',
  })
  accessToken: string;
}
