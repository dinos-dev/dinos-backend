import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PinService } from '../application/pin.service';
import { TogglePinDto } from './dto/request/toggle-pin.request.dto';
import { UserId } from 'src/common/decorator/user-id.decorator';
import { TogglePinCommand } from '../application/command/toggle-pin.command';
import { PinResponseDto } from './dto/response/pin.response.dto';
import { HttpResponse } from 'src/common/http/http-response';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/common/swagger/response/api-error-common-response';
import { NearbyPinsDocs, TogglePinDocs } from './swagger/rest-swagger.decorator';
import { NearbyPinsQueryDto } from './dto/request/nearby-pins-query.dto';
import { NearbyPinResponseDto } from './dto/response/nearby-pins.response.dto';

@ApiTags('Pins - 핀')
@ApiBearerAuth()
@ApiCommonErrorResponseTemplate()
@Controller('pins')
export class PinController {
  constructor(private readonly pinService: PinService) {}

  @Post('toggle')
  @TogglePinDocs()
  async togglePin(@UserId() userId: number, @Body() dto: TogglePinDto): Promise<HttpResponse<PinResponseDto>> {
    const command = new TogglePinCommand(userId, dto.name, dto.address, dto.latitude, dto.longitude, dto.type);
    const pin = await this.pinService.togglePin(command);
    const result = PinResponseDto.fromResult(pin);
    return HttpResponse.created(result);
  }

  @Get('nearby')
  @NearbyPinsDocs()
  async getNearbyPins(
    @UserId() userId: number,
    @Query() query: NearbyPinsQueryDto,
  ): Promise<HttpResponse<NearbyPinResponseDto[]>> {
    const pins = await this.pinService.getNearbyPins(userId, query);
    const result = pins.map((pin) => NearbyPinResponseDto.fromDto(pin));
    return HttpResponse.ok(result);
  }
}
