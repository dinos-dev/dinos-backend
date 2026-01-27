import { Module } from '@nestjs/common';
import { RestaurantService } from './application/restaurant.service';
import { RestaurantController } from './presentation/restaurant.controller';
import { RESTAURANT_REPOSITORY } from 'src/common/config/common.const';
import { RestaurantRepository } from './infrastructure/repository/restaurant.repository';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Module({
  controllers: [RestaurantController],
  providers: [
    RestaurantService,
    {
      provide: RESTAURANT_REPOSITORY,
      useClass: RestaurantRepository,
    },
    PrismaService,
  ],
})
export class RestaurantModule {}
