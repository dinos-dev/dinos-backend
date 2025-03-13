import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { ApiCreatedResponseTemplate } from 'src/core/swagger/response/api-created-response';
import { ApiErrorResponseTemplate } from 'src/core/swagger/response/api-error-response';
import { SocialUserDto } from 'src/domains/user/dto/social-user.dto';
import { LoginResponseDto, RotateAccessTokenDto } from '../dtos/login-response.dto';

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

/**엑세스 토큰 재발급 */
export const RotateAccessTokenDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '엑세스 토큰 재발급',
      description: `
      - 리프레시 토큰으로 엑세스 토큰을 재발급한다.
      - 검증 절차(1. Bearer 여부,  2. Refresh 형태,  3. Token Signature,  4. RefToken 테이블에 정상적으로 등록된 토큰인지 여부) `,
    }),
    ApiHeader({
      name: 'authorization',
      description: 'refresh token in Bearer format',
      required: true,
    }),
    ApiCreatedResponseTemplate({
      description: '엑세스 토큰 재발급 성공',
      type: RotateAccessTokenDto,
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.BAD_REQUEST,
        errorFormatList: [HttpErrorConstants.VALIDATE_ERROR],
      },
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
    ]),
  );
};

/**로그아웃 */
export const LogOutDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: '로그아웃',
      description: `
      - 헤더에 authorization key로 Bearer AccessToken을 요청
      - 응답 성공시 204 noContent를 반환한다 
      `,
    }),
    ApiHeader({
      name: 'authorization',
      description: 'access token in Bearer format',
      required: true,
    }),
    ApiNoContentResponse({
      description: '로그아웃 성공 - 반환되는 데이터는 별도로 없다',
    }),
    ApiErrorResponseTemplate([
      {
        status: StatusCodes.UNAUTHORIZED,
        errorFormatList: HttpErrorConstants.COMMON_UNAUTHORIZED_TOKEN_ERROR,
      },
    ]),
  );
};
