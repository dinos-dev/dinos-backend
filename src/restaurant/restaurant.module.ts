import { Module } from '@nestjs/common';
import { RestaurantService } from './application/restaurant.service';
import { RestaurantController } from './presentation/restaurant.controller';
import { RESTAURANT_REPOSITORY, RESTAURANT_SEARCH_QUERY_REPOSITORY } from 'src/common/config/common.const';
import { RestaurantRepository } from './infrastructure/repository/restaurant.repository';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { RestaurantSearchQueryHandler } from './infrastructure/query/restaurant-search.query';

@Module({
  controllers: [RestaurantController],
  providers: [
    RestaurantService,
    {
      provide: RESTAURANT_REPOSITORY,
      useClass: RestaurantRepository,
    },
    {
      provide: RESTAURANT_SEARCH_QUERY_REPOSITORY,
      useClass: RestaurantSearchQueryHandler,
    },
    PrismaService,
  ],
})
export class RestaurantModule {}
