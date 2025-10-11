import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class SendFriendRequestDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: '친구 요청을 받는 사용자의 UserId',
    example: 1,
    required: true,
  })
  receiverId: number;
}
