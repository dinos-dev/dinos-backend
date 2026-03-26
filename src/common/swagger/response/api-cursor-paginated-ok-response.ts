import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponseDto } from '../dto/response-dto';

/**
 * 커서 기반 페이징 응답 Swagger 데코레이터
 * CursorPaginatedResponseDto<T>는 TypeScript 제네릭이라 런타임에 T가 소거.
 * ApiOkResponseTemplate에 제네릭 타입을 넘기면 Swagger가 data 배열의 item 타입을 알 수 없기에 스키마 직접 명시
 */
export const ApiCursorPaginatedOkResponse = <DtoClass extends Type<unknown>>(params: {
  description?: string;
  type: DtoClass;
}) => {
  return applyDecorators(
    ApiExtraModels(ResponseDto, params.type),
    ApiOkResponse({
      description: params.description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties: {
              result: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: getSchemaPath(params.type) },
                  },
                  nextCursor: {
                    type: 'number',
                    nullable: true,
                    example: 5,
                    description: '다음 페이지 커서. null이면 마지막 페이지',
                  },
                  hasNext: {
                    type: 'boolean',
                    example: true,
                    description: '다음 페이지 존재 여부',
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};
