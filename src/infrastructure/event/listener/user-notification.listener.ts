import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SlackService } from 'src/infrastructure/slack/slack.service';
import { SERVICE_CHANNEL } from 'src/infrastructure/slack/constant/channel.const';
import { WinstonLoggerService } from 'src/infrastructure/logger/winston-logger.service';
import { getErrorStack } from 'src/common/utils/error.util';
import { UserRegisteredEvent } from 'src/auth/application/event/user-registered.event';

@Injectable()
export class UserNotificationListener {
  constructor(
    private readonly slackService: SlackService,
    private readonly logger: WinstonLoggerService,
  ) {}

  /**사용자 등록 완료 시 Slack WebHook*/
  @OnEvent('user.registered')
  async handleUserRegistered(event: UserRegisteredEvent): Promise<void> {
    try {
      const messagePrefix = event.registrationType === 'social' ? '[소셜 가입]' : '[로컬 가입]';
      const message = `${messagePrefix} ${event.email} 유저가 회원가입 하였습니다 🎉`;

      await this.slackService.sendMessage(SERVICE_CHANNEL, message);

      this.logger.log(`[사용자 등록 알림] ${event.email} - Slack 알림 전송 완료`);
    } catch (error) {
      this.logger.error(`[사용자 등록 알림 실패] ${event.email}`, getErrorStack(error));
    }
  }
}
