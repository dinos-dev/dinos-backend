import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient } from '@slack/web-api';
import { WinstonLoggerService } from 'src/infrastructure/logger/winston-logger.service';
import { getErrorMessage, getErrorStack } from 'src/common/utils/error.util';

@Injectable()
export class SlackService {
  private readonly webClient: WebClient;
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: WinstonLoggerService,
  ) {
    this.webClient = new WebClient(this.configService.get<string>('SLACK_API_TOKEN'));
  }

  /**
   * Basic Send Slack Message Hook
   * @param channel
   * @param text
   * @returns void
   */
  async sendMessage(channel: string, text: string): Promise<void> {
    try {
      await this.webClient.chat.postMessage({
        channel,
        text,
      });
      this.logger.log(`Slack message sent to ${channel}: ${text}`);
    } catch (error) {
      this.logger.error(`Failed to send Slack message to ${channel}: ${getErrorMessage(error)}`, getErrorStack(error));
      throw error;
    }
  }

  /**
   * Common Send Error Slack Message Hook
   * @param channel
   * @param error
   * @param context
   * @return void
   */
  async sendErrorNotification(channel: string, error: Error, context?: any): Promise<void> {
    try {
      const message = {
        channel,
        text: `🚨 *Error Occurred* 🚨\n*Message*: ${error.message}\n*Stack*: \`\`\`${error.stack}\`\`\`\n*Context*: \`\`\`${JSON.stringify(context, null, 2)}\`\`\``,
      };
      this.logger.log('Sending error notification to Slack: ' + JSON.stringify(message));

      await this.webClient.chat.postMessage(message);
      this.logger.log(`Error notification sent to Slack channel: ${channel}`);
    } catch (slackError) {
      this.logger.error(`Failed to send Slack notification: ${getErrorMessage(slackError)}`);
    }
  }
}
