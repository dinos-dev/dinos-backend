import { Module } from '@nestjs/common';
import { PinService } from './application/pin.service';
import { PinController } from './presentation/pin.controller';

@Module({
  controllers: [PinController],
  providers: [PinService],
})
export class PinModule {}
