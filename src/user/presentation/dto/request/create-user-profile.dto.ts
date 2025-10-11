import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserProfileDto {
  @ApiProperty({
    description: '유저의 별칭 ( 닉네임 )',
    type: String,
    example: 'dinosaur',
    maxLength: 20,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  nickname: string;

  @ApiProperty({
    description: '프로필 간단 소개',
    type: String,
    example: 'hi there',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  comment?: string;

  @ApiProperty({
    description: '유저가 사용할 아바타의 헤더 아이디 ( 헤더 아이디는 프론트에서 지정 )',
    type: Number,
    example: 4,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  headerId?: number;

  @ApiProperty({
    description: '유저가 사용할 아바타의 바디 아이디 ( 바디 아이디는 프론트에서 지정 )',
    type: Number,
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  bodyId?: number;

  @ApiProperty({
    description: '유저가 사용할 아바타의 헤더 색상 ( hex code )',
    type: String,
    example: '#FF5733',
    maxLength: 8,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  headerColor?: string;

  @ApiProperty({
    description: '유저가 사용할 아바타의 바디 색상 ( hex code )',
    type: String,
    example: '#FF5732',
    maxLength: 8,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  bodyColor?: string;
}
