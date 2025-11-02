import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { HttpErrorConstants } from '../http/http-error-objects';

/**
 * 필드별 validation 에러 상세 정보 인터페이스
 */
export interface ValidationErrorDetail {
  field: string;
  value: unknown;
  constraints: Record<string, string>;
  message: string;
}

/**
 * 전역 ValidationPipe 설정 생성
 *
 * @description
 * - DTO 기반 validation 수행
 * - 필드별 상세 에러 정보 반환
 * - whitelist를 통한 불필요한 속성 제거
 */
export function createGlobalValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false,
    exceptionFactory: (errors: ValidationError[]) => {
      // 필드별 에러 정보 추출 (간단한 map 사용)
      const validationErrors: ValidationErrorDetail[] = errors.map((error) => ({
        field: error.property,
        value: error.value,
        constraints: error.constraints || {},
        message: Object.values(error.constraints || {})[0] || '입력값이 유효하지 않습니다.',
      }));

      // 개발 환경에서만 로깅
      if (process.env.NODE_ENV !== 'production') {
        console.log('Validation errors --->', validationErrors);
      }

      // 구조화된 에러 응답 반환
      return new BadRequestException({
        ...HttpErrorConstants.VALIDATE_ERROR,
        validationErrors,
      });
    },
  });
}
