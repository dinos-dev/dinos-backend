import { Module } from '@nestjs/common';
import { PinService } from './application/pin.service';
import { PinController } from './presentation/pin.controller';
import { PIN_QUERY_REPOSITORY, PIN_REPOSITORY, RESTAURANT_REPOSITORY } from 'src/common/config/common.const';
import { PinRepository } from './infrastructure/repository/pin.repository';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { RestaurantRepository } from 'src/restaurant/infrastructure/repository/restaurant.repository';
import { PinQuery } from './infrastructure/query/pin.query';

@Module({
  controllers: [PinController],
  providers: [
    PinService,
    {
      provide: PIN_REPOSITORY,
      useClass: PinRepository,
    },
    {
      provide: RESTAURANT_REPOSITORY,
      useClass: RestaurantRepository,
    },
    {
      provide: PIN_QUERY_REPOSITORY,
      useClass: PinQuery,
    },
    PrismaService,
  ],
})
export class PinModule {}
