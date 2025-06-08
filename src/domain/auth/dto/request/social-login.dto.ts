import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SocialLoginDto {
  @ApiProperty({
    description: 'OAuth Token (소셜 OAuth ID Token)',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjA3YjgwYTM2NTQ',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
