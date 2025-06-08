import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Provider } from 'src/domain/auth/constant/provider.enum';

export class FindOneUserResponseDto {
  @Expose()
  @ApiProperty({
    description: '유저 id number',
    example: 1,
    type: Number,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '이메일',
    example: 'cs12@cs.com',
    type: String,
  })
  email: string;

  @Expose()
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
