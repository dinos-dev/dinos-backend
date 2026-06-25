import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RESTAURANT_SEARCH_QUERY_REPOSITORY } from 'src/common/config/common.const';
import { HttpErrorConstants } from 'src/common/http/http-error-objects';
import { SearchRestaurantQueryDto } from '../presentation/dto/request/search-restaurant.query.dto';
import { RestaurantSearchQuery } from './dto/restaurant-search.query';
import { RestaurantSearchResult } from './dto/restaurant-search.result';
import { IRestaurantSearchQuery } from './interface/restaurant-search-query.interface';

@Injectable()
export class RestaurantService {
  constructor(
    @Inject(RESTAURANT_SEARCH_QUERY_REPOSITORY)
    private readonly restaurantSearchQuery: IRestaurantSearchQuery,
  ) {}

  /**
   * 사용자 좌표 기준 음식점명 검색
   * @param query 기준 좌표 + 반경 + 키워드 + 조회 개수 제한
   * @returns 거리순 검색 결과
   */
  async searchNearby(query: SearchRestaurantQueryDto): Promise<RestaurantSearchResult[]> {
    const { latitude, longitude, radiusMeters, keyword, limit } = query;
    const trimmedKeyword = keyword.trim();

    this.assertValidKeyword(trimmedKeyword);

    const searchQuery = RestaurantSearchQuery.create({
      latitude,
      longitude,
      radiusMeters,
      keyword: trimmedKeyword,
      limit,
    });

    return this.restaurantSearchQuery.searchNearby(searchQuery);
  }

  /**
   * keyword 값 length 값 체크
   */
  private assertValidKeyword(keyword: string): void {
    if (keyword.length === 0) {
      throw new BadRequestException(HttpErrorConstants.VALIDATE_ERROR);
    }
  }
}
