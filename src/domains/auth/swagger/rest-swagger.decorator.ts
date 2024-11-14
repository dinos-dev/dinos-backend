import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { ApiCreatedResponseTemplate } from 'src/core/swagger/api-created-response';
import { ApiErrorResponseTemplate } from 'src/core/swagger/api-error-response';
import { SocialUserDto } from 'src/domains/user/dto/social-user.dto';
import { LoginResponseDto } from '../dtos/login-response.dto';

/**소셜 가입 & 로그인*/
export const SocialLoginDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '소셜 가입 및 로그인 인증 ',
      description: `
      - 소셜 플랫폼 유형별로 회원가입 및 로그인 검증 완료후 Access, Refresh Token을 발행한다.`,
    }),
    ApiBody({
      type: SocialUserDto,
    }),
    ApiCreatedResponseTemplate({
      description: '소셜 가입 및 로그인 성공',
      type: LoginResponseDto,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.BAD_REQUEST,
        errorFormatList: [HttpErrorConstants.VALIDATE_ERROR],
      },
    ]),
  );
};
