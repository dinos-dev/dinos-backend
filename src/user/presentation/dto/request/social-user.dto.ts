import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Provider } from 'src/auth/domain/constant/provider.enum';

export class SocialUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '소셜 로그인 아이디',
    example: '1234567890',
    required: true,
  })
  providerId: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: '이메일',
    example: 'test@test.com',
    required: true,
  })
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '유저의 이름',
    example: '아무개',
    required: false,
  })
  name: string;

  @IsEnum(Provider)
  @IsNotEmpty()
  @ApiProperty({
    description: '소셜 로그인 타입',
    example: 'google, naver, apple, kakao',
    required: true,
  })
  provider: Provider;
}
