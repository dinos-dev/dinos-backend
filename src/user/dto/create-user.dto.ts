import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsRegexpPhoneNumber } from 'src/common/validators/regexp.phone-number';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsRegexpPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}
