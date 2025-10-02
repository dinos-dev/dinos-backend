// import { applyDecorators, Type } from '@nestjs/common';
// import { ApiExtraModels, ApiNoContentResponse, getSchemaPath } from '@nestjs/swagger';
// import { NoContentResponseDto } from '../dto/no-content-response.dto';

// /** 204(No Content) Response Template*/
// export const ApiNoContentResponseTemplate = <DtoClass extends Type<unknown>>(params?: {
//   description?: string;
//   type?: DtoClass;
//   isArray?: boolean;
// }) => {
//   if (params?.type) {
//     const schema = {
//       description: params.description,
//       schema: {
//         allOf: [
//           // NoContentResponseDto 의 프로퍼티를 가져옴
//           { $ref: getSchemaPath(NoContentResponseDto) },

//           {
//             properties: {
//               result: params.isArray
//                 ? {
//                     type: 'array',
//                     items: { $ref: getSchemaPath(params.type) },
//                   }
//                 : {
//                     $ref: getSchemaPath(params.type),
//                   },
//             },
//           },
//         ],
//       },
//     };
//     return applyDecorators(ApiExtraModels(NoContentResponseDto, params?.type), ApiNoContentResponse(schema));
//   } else {
//     const schema = {
//       description: params?.description,
//       schema: {
//         allOf: [
//           // ResponseDto 의 프로퍼티를 가져옴
//           { $ref: getSchemaPath(NoContentResponseDto) },
//         ],
//       },
//     };
//     return applyDecorators(ApiExtraModels(NoContentResponseDto), ApiNoContentResponse(schema));
//   }
// };

import { applyDecorators, Type } from '@nestjs/common';
import { ApiNoContentResponse } from '@nestjs/swagger';

/** 204(No Content) Response Template*/
export const ApiNoContentResponseTemplate = <DtoClass extends Type<unknown>>(params?: {
  description?: string;
  type?: DtoClass;
  isArray?: boolean;
}) => {
  // 204 No Content는 응답 본문이 없으므로 스키마를 정의하지 않음
  const schema = {
    description: params?.description || 'No Content',
    // schema를 정의하지 않아서 빈 응답으로 표시
  };

  return applyDecorators(ApiNoContentResponse(schema));
};
