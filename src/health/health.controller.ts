import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { Public } from 'src/common/decorator/public-access.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // mongo & etc 기타 database 연결 상태 확인은 추후에 추가
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }
}


