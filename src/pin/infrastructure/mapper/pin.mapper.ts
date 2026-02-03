import { Pin } from '@prisma/client';
import { PinType } from 'src/pin/domain/const/pin.enum';
import { PinEntity } from 'src/pin/domain/entities/pin.entity';

export class PinMapper {
  static toDomain(prismaPin: Pin): PinEntity {
    return new PinEntity(
      prismaPin.id,
      prismaPin.userId,
      prismaPin.restaurantId,
      prismaPin.reviewId,
      prismaPin.type as PinType,
      prismaPin.createdAt,
      prismaPin.updatedAt,
    );
  }
}
