import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { SocialAuthEnum } from '../consts/social-auth.enum';

export class SocialUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '소셜 인증 플랫폼에서 발급한 토큰',
    example: '2900xlkc12390xklpyc09222..',
    required: true,
  })
  token: string;

  @IsNotEmpty()
  @IsEnum(SocialAuthEnum)
  @ApiProperty({
    description: '소셜 인증 유형',
    example: 'google, apple, naver, kakao',
    required: true,
  })
  socialAuthType: SocialAuthEnum;
}
