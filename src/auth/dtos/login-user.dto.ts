import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: '이메일',
    example: 'test@test.com',
    required: true,
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '패스워드',
    example: 'kkkk@@@@k1!',
    required: true,
  })
  password: string;
}
