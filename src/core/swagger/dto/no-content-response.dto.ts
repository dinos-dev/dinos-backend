import { ApiProperty } from '@nestjs/swagger';

export class NoContentResponseDto<T> {
  data: T;
  @ApiProperty({
    default: 204,
  })
  status: number;
  @ApiProperty({
    default: 'NO_CONTENT',
  })
  message: string;
}
