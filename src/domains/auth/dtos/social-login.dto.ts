import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { SocialUserType } from '../consts/social-type.const';

export class SocialLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '소셜 플랫폼에서 로그인 성공 완료시 반환되는 Token',
    example: '소셜 유저 토큰',
    required: true,
  })
  token: string;

  @IsEnum(SocialUserType)
  @IsNotEmpty()
  @ApiProperty({
    description: '소셜 유저 타입',
    example: 'google, apple, naver, kakao',
    required: true,
  })
  type: SocialUserType;
}
