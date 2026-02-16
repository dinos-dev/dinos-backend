import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
// import { PinType } from 'src/pin/domain/const/pin.enum';

export class TogglePinDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '네이버 장소 ( Naver Place )에서 받아온 가게 이름',
    example: '유키돈까스',
    required: true,
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '네이버 장소 ( Naver Place )에서 받아온 가게 주소',
    example: '서울특별시 강남구 역삼동 123-456',
    required: true,
  })
  address: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    description: '네이버 장소 ( Naver Place )에서 받아온 가게 위도',
    example: 37.511281,
    required: true,
  })
  latitude: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    description: '네이버 장소 ( Naver Place )에서 받아온 가게 경도',
    example: 127.005068637,
    required: true,
  })
  longitude: number;

  // @IsNotEmpty()
  // @IsEnum(PinType)
  // @IsNotIn([PinType.VISITED], { message: 'VISITED 유형의 핀 생성이 불가합니다. ( PLANNED 유형만 생성 가능 )' })
  // @ApiProperty({
  //   description: '핀의 타입 ( PLANNED, VISITED )',
  //   example: 'PLANNED',
  //   required: true,
  //   enum: PinType,
  // })
  // type: PinType;
}
