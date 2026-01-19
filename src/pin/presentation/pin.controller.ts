import { Controller } from '@nestjs/common';
import { PinService } from '../application/pin.service';

@Controller('pin')
export class PinController {
  constructor(private readonly pinService: PinService) {}
}
