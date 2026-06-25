import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/common/swagger/response/api-error-common-response';
import { HttpResponse } from 'src/common/http/http-response';
import { RestaurantService } from '../application/restaurant.service';
import { SearchRestaurantQueryDto } from './dto/request/search-restaurant.query.dto';
import { SearchRestaurantResponseDto } from './dto/response/search-restaurant.response.dto';
import { SearchRestaurantDocs } from './swagger/rest-swagger.decorator';

@ApiTags('Restaurants - 음식점')
@ApiBearerAuth()
@ApiCommonErrorResponseTemplate()
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get('search')
  @SearchRestaurantDocs()
  async searchNearby(@Query() query: SearchRestaurantQueryDto): Promise<HttpResponse<SearchRestaurantResponseDto[]>> {
    const restaurants = await this.restaurantService.searchNearby(query);
    const result = restaurants.map((restaurant) => SearchRestaurantResponseDto.fromDto(restaurant));
    return HttpResponse.ok(result);
  }
}
