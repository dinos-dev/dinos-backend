import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isStrictPhoneNumber', async: false })
@Injectable()
export class RegexpPhoneNumberValidator implements ValidatorConstraintInterface {
  validate(phoneNumber: string) {
    // 정확히 010-1234-5678 또는 011-1234-5678 형식만 허용
    const phoneRegex = /^(010|011)-\d{4}-\d{4}$/;
    return phoneRegex.test(phoneNumber);
  }

  defaultMessage() {
    return 'Phone number must be in the format 010-1234-5678 or 011-1234-5678';
  }
}

// 데코레이터 생성
export function IsRegexpPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: RegexpPhoneNumberValidator,
    });
  };
}
