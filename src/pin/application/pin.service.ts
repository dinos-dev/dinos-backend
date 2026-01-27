import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PIN_QUERY_REPOSITORY, PIN_REPOSITORY, RESTAURANT_REPOSITORY } from 'src/common/config/common.const';
import { IPinRepository } from '../domain/repository/pin.repository.interface';
import { IRestaurantRepository } from 'src/restaurant/domain/repository/restaurant.repository.interface';
import { TogglePinCommand } from './command/toggle-pin.command';
import { PinEntity } from '../domain/entities/pin.entity';
import { RestaurantEntity } from 'src/restaurant/domain/entities/restaurant.entity';
import { Transactional } from '@nestjs-cls/transactional';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { WinstonLoggerService } from 'src/infrastructure/logger/winston-logger.service';
import { IPinQuery } from './interface/pin-query.interface';

@Injectable()
export class PinService {
  constructor(
    @Inject(PIN_REPOSITORY)
    private readonly pinRepository: IPinRepository,
    @Inject(RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: IRestaurantRepository,
    @Inject(PIN_QUERY_REPOSITORY)
    private readonly pinQuery: IPinQuery,
    private readonly logger: WinstonLoggerService,
  ) {}

  /**
   * Toggle Pin
   * @param command TogglePinCommand
   * @returns PinEntity
   */
  @Transactional()
  async togglePin(command: TogglePinCommand): Promise<PinEntity> {
    try {
      //? 1. restaurantEntity 생성
      const restaurantEntity = RestaurantEntity.create({
        name: command.name,
        refPlaceId: command.refPlaceId,
        address: command.address,
        latitude: command.latitude,
        longitude: command.longitude,
        webviewUrl: command.webviewUrl,
      });

      //? 2. restaurantEntity 동기화
      const upsertRestaurantEntity = await this.restaurantRepository.upsertRestaurantByRefPlaceId(restaurantEntity);

      //? 3. pin 조회
      const pin = await this.pinQuery.findByUserIdAndRestaurantId(command.userId, upsertRestaurantEntity.id);

      //? 4. 핀의 존재 여부에 따른 생성 또는 제거 ( toggle )
      if (pin) {
        return await this.pinRepository.removeById(pin.id);
      }

      //? 5. pin이 없을 경우 생성
      const pinEntity = PinEntity.create({
        userId: command.userId,
        restaurantId: upsertRestaurantEntity.id,
        reviewId: null,
        type: command.type,
      });

      return this.pinRepository.create(pinEntity);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
    }
  }
}
