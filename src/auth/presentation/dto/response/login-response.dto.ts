import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

/**login Response Dto*/
export class LoginResponseDto {
  constructor(result: { accessToken: string; refreshToken: string }) {
    this.accessToken = result.accessToken;
    this.refreshToken = result.refreshToken;
  }

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

  static fromResult(result: { accessToken: string; refreshToken: string }): LoginResponseDto {
    return new LoginResponseDto(result);
  }
}

export class RotateAccessTokenDto {
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  @Expose()
  @ApiProperty({
    description: 'accessToken',
    example: 'eInR59.eyJiJhdCIsImlhdCI6MTc.37gbkd4jAx123c',
  })
  accessToken: string;

  static fromResult(result: string): RotateAccessTokenDto {
    return new RotateAccessTokenDto(result);
  }
}
