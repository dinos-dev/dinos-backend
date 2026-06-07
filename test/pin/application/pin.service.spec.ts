import { Test, TestingModule } from '@nestjs/testing';
import { PinService } from '../../../src/pin/application/pin.service';
import { PIN_QUERY_REPOSITORY, PIN_REPOSITORY, RESTAURANT_REPOSITORY } from '../../../src/common/config/common.const';
import { WinstonLoggerService } from '../../../src/infrastructure/logger/winston-logger.service';

describe('PinService', () => {
  let service: PinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PinService,
        { provide: PIN_REPOSITORY, useValue: {} },
        { provide: RESTAURANT_REPOSITORY, useValue: {} },
        { provide: PIN_QUERY_REPOSITORY, useValue: {} },
        { provide: WinstonLoggerService, useValue: { error: jest.fn() } },
      ],
    }).compile();

    service = module.get<PinService>(PinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
