import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { PasswordRegex } from 'src/core/helper/password.util';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';

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
  @IsOptional()
  @ApiProperty({
    description: '유저의 이름',
    example: '아무개',
    required: false,
  })
  name: string;

  @IsString()
  @Matches(PasswordRegex, {
    message: HttpErrorConstants.INVALID_BEARER_TOKEN.message,
  })
  @IsNotEmpty()
  @ApiProperty({
    description: '패스워드',
    example: 'abcd123!@',
    required: true,
  })
  password: string;
}
