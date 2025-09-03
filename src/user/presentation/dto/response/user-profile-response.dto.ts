import { ApiProperty } from '@nestjs/swagger';
import { Expose, plainToInstance } from 'class-transformer';

export class UserProfileResponseDto {
  constructor(partial: Partial<UserProfileResponseDto>) {
    Object.assign(this, partial);
  }
  @Expose()
  @ApiProperty({
    description: '유저 프로필 아이디',
    example: 1,
    type: Number,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: '유저의 계정 아이디',
    example: 12,
    type: Number,
  })
  userId: number;

  @Expose()
  @ApiProperty({
    description: '프로필 닉네임 ',
    example: '그린다이노',
    type: String,
    required: true,
    maxLength: 20,
  })
  nickName: string;

  @Expose()
  @ApiProperty({
    description: '프로필 설명 ',
    example: '안녕하세요. xx 다이노입니다.',
    type: String,
  })
  comment: string;

  @Expose()
  @ApiProperty({
    description: '유저 프로필의 헤더 아이디(프론트에서 지정한 key 값)',
    example: 1,
    type: Number,
  })
  headerId: number;

  @Expose()
  @ApiProperty({
    description: '유저 프로필의 바디 아이디(프론트에서 지정한 key 값)',
    example: 1,
    type: Number,
  })
  bodyId: number;

  @Expose()
  @ApiProperty({
    description: '유저 프로필 헤더 색상 ( hex color )',
    example: '#FF5733',
    type: String,
  })
  headerColor: string;

  @Expose()
  @ApiProperty({
    description: '유저 프로필 바디 색상 ( hex color )',
    example: '#FF5733',
    type: String,
  })
  bodyColor: string;

  static fromResult(result: Partial<UserProfileResponseDto>): UserProfileResponseDto {
    return plainToInstance(UserProfileResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
