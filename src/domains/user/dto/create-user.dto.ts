import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IsRegexpPhoneNumber } from 'src/common/validators/regexp.phone-number';
import { SocialAuthEnum } from 'src/domains/auth/consts/social-auth.enum';

export class CreateUserDto {
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

  @IsEnum(SocialAuthEnum)
  @IsNotEmpty()
  @ApiProperty({
    description: '가입(인증) 유형',
    example: 'google, naver, apple, kakao',
    required: true,
  })
  authType: SocialAuthEnum;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsRegexpPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;
}
