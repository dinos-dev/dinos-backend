import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PIN_QUERY_REPOSITORY, PIN_REPOSITORY, RESTAURANT_REPOSITORY } from 'src/common/config/common.const';
import { getErrorMessage, getErrorStack } from 'src/common/utils/error.util';
import { IPinRepository } from '../domain/repository/pin.repository.interface';
import { IRestaurantRepository } from 'src/restaurant/domain/repository/restaurant.repository.interface';
import { TogglePinCommand } from './command/toggle-pin.command';
import { PinEntity } from '../domain/entities/pin.entity';
import { Transactional } from '@nestjs-cls/transactional';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { WinstonLoggerService } from 'src/infrastructure/logger/winston-logger.service';
import { IPinQuery } from './interface/pin-query.interface';
import { BoundingBoxDto } from './dto/bounding-box.dto';
import { LocationQueryOptionsDto } from './dto/location-query-options.dto';
import { PinWithRestaurantDto } from './dto/pin-with-restaurant.dto';
import { NearbyPinsQueryDto } from '../presentation/dto/request/nearby-pins-query.dto';

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
  async togglePin(command: TogglePinCommand): Promise<{ pin: PinEntity; action: 'created' | 'deleted' }> {
    //? 1. 가게 존재 검증 (자체 수집된 restaurants 참조 — 없으면 404)
    const restaurantExists = await this.restaurantRepository.existsById(command.restaurantId);
    if (!restaurantExists) {
      throw new NotFoundException(HttpErrorConstants.NOT_FOUND_RESTAURANT);
    }

    try {
      //? 2. pin 조회
      const pin = await this.pinQuery.findByUserIdAndRestaurantId(command.userId, command.restaurantId);

      //? 3. 핀의 존재 여부에 따른 생성 또는 제거 ( toggle )
      if (pin) {
        const removed = await this.pinRepository.removeById(pin.id);
        return { pin: removed, action: 'deleted' };
      }

      //? 4. pin이 없을 경우 생성
      const pinEntity = PinEntity.create({
        userId: command.userId,
        restaurantId: command.restaurantId,
        // type: command.type,
      });

      const created = await this.pinRepository.create(pinEntity);
      return { pin: created, action: 'created' };
    } catch (error) {
      this.logger.error(getErrorMessage(error), getErrorStack(error));
      throw new InternalServerErrorException(HttpErrorConstants.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get Nearby Pins
   * @param userId number
   * @param query NearbyPinsQueryDto
   * @returns PinWithRestaurantDto[]
   */
  async getNearbyPins(userId: number, query: NearbyPinsQueryDto): Promise<PinWithRestaurantDto[]> {
    const boundingBox = BoundingBoxDto.create({
      minLat: query.minLat,
      maxLat: query.maxLat,
      minLng: query.minLng,
      maxLng: query.maxLng,
    });

    const options = LocationQueryOptionsDto.create({
      userLat: query.userLat,
      userLng: query.userLng,
      limit: query.limit,
      // type: query.type,
    });

    return this.pinQuery.findNearbyPinnedRestaurants(userId, boundingBox, options);
  }
}
