import { Module } from '@nestjs/common';
import { RestaurantService } from './application/restaurant.service';
import { RestaurantController } from './presentation/restaurant.controller';

@Module({
  controllers: [RestaurantController],
  providers: [RestaurantService],
})
export class RestaurantModule {}
