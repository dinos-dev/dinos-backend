import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';
import { UserEntity } from 'src/user/domain/entities/user.entity';
import { ProfileEntity } from 'src/user/domain/entities/profile.entity';

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
    description: '유저 프로필 정보',
    type: 'object',
    properties: {
      nickname: {
        type: 'string',
        description: '닉네임',
        example: '그린다이노',
      },
      comment: {
        type: 'string',
        description: '프로필 설명',
        example: '안녕하세요!',
        nullable: true,
      },
    },
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
