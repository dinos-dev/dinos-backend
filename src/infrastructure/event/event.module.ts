import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { SlackModule } from '../slack/slack.module';
import { UserNotificationListener } from './listener/user-notification.listener';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    SlackModule,
  ],
  providers: [UserNotificationListener],
  exports: [EventEmitterModule],
})
export class EventModule {}
