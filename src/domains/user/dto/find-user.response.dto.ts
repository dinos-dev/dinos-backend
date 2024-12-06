import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class FindOneUserResponseDto {
  @ApiProperty({
    description: '유저 id number',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '이메일',
    example: 'cs12@cs.com',
  })
  email: string;

  @ApiProperty({
    description: '이름',
    example: 'dino',
  })
  userName: string;

  @Exclude()
  @ApiProperty({
    description: '인증타입',
    example: 'kakao | naver | apple | google',
  })
  authType: string;
}
