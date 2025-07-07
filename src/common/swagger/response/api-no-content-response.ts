import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiNoContentResponse, getSchemaPath } from '@nestjs/swagger';
import { NoContentResponseDto } from '../dto/no-content-response.dto';

/** 204(No Content) Response Template*/
export const ApiNoContentResponseTemplate = <DtoClass extends Type<unknown>>(params?: {
  description?: string;
  type?: DtoClass;
  isArray?: boolean;
}) => {
  if (params?.type) {
    const schema = {
      description: params.description,
      schema: {
        allOf: [
          // NoContentResponseDto 의 프로퍼티를 가져옴
          { $ref: getSchemaPath(NoContentResponseDto) },

          {
            properties: {
              result: params.isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(params.type) },
                  }
                : {
                    $ref: getSchemaPath(params.type),
                  },
            },
          },
        ],
      },
    };
    return applyDecorators(ApiExtraModels(NoContentResponseDto, params?.type), ApiNoContentResponse(schema));
  } else {
    const schema = {
      description: params?.description,
      schema: {
        allOf: [
          // ResponseDto 의 프로퍼티를 가져옴
          { $ref: getSchemaPath(NoContentResponseDto) },
        ],
      },
    };
    return applyDecorators(ApiExtraModels(NoContentResponseDto), ApiNoContentResponse(schema));
  }
};
