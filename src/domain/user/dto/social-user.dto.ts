import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Provider } from 'src/domain/auth/helper/provider.enum';

export class SocialUserDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: '이메일',
    example: 'test@test.com',
    required: true,
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '유저의 이름',
    example: '아무개',
    required: true,
  })
  userName: string;

  @IsEnum(Provider)
  @IsNotEmpty()
  @ApiProperty({
    description: '소셜 로그인 타입',
    example: 'google, naver, apple, kakao',
    required: true,
  })
  authType: Provider;
}
