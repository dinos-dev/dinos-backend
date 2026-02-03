import { Test, TestingModule } from '@nestjs/testing';
import { PinController } from '../../../src/pin/presentation/pin.controller';
import { PinService } from '../../../src/pin/application/pin.service';

describe('PinController', () => {
  let controller: PinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PinController],
      providers: [PinService],
    }).compile();

    controller = module.get<PinController>(PinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
