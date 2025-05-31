import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Provider } from 'src/domain/auth/constant/provider.enum';

export class FindOneUserResponseDto {
  @ApiProperty({
    description: '유저 id number',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: '이메일',
    example: 'cs12@cs.com',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: '이름',
    example: 'dino',
    type: String,
  })
  name: string;

  @Exclude()
  @ApiProperty({
    description: '인증타입',
    example: 'local',
    enum: Provider,
  })
  provider: Provider;
}
