import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { UserEntity } from 'src/user/domain/entities/user.entity';
import { ProfileEntity } from 'src/user/domain/entities/profile.entity';
import { ProfileResponseDto } from './profile.response.dto';

export class UserWithProfileResponseDto {
  constructor(partial: Partial<UserWithProfileResponseDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty({
    description: '유저 아이디',
    example: 1,
    type: Number,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '유저 이메일',
    example: 'user@example.com',
    type: String,
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: '유저 이름',
    example: '홍길동',
    type: String,
    nullable: true,
  })
  name: string | null;

  @Expose()
  @ApiProperty({
    description: '로그인 제공자',
    example: 'GOOGLE',
    type: String,
  })
  provider: string;

  @Expose()
  @ApiProperty({
    description: '유저 프로필 정보',
    type: ProfileResponseDto,
    nullable: true,
  })
  profile: {
    nickname: string;
    comment: string | null;
  } | null;

  static fromResult(user: UserEntity, profile: ProfileEntity | null): UserWithProfileResponseDto {
    return plainToInstance(
      UserWithProfileResponseDto,
      {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        profile: profile
          ? {
              nickname: profile.nickname,
              comment: profile.comment,
            }
          : null,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
