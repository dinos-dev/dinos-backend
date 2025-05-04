import { Instant, Duration, Period, LocalDateTime, ZoneId, ZonedDateTime } from '@js-joda/core';
import '@js-joda/timezone';

export class DateUtils {
  /**
   * .env의 expiresIn을 파싱하여 만료 시간(Date 객체) 계산
   * @param expiresIn 형식: '3600', '60m', '24h', '7d', 'P180D'
   * @returns Date 객체
   */
  static calculateExpiresAt(expiresIn: string): Date {
    const now = Instant.now();
    let duration: Duration;

    if (expiresIn.startsWith('P')) {
      const period = Period.parse(expiresIn);
      const days = period.years() * 365 + period.months() * 30 + period.days();
      duration = Duration.ofDays(days);
    } else {
      const match = expiresIn.match(/^(\d+)([smhdwM])?$/);
      if (!match) {
        throw new Error(`Invalid expiresIn format: ${expiresIn}. Expected: '3600', '60m', '24h', '7d', 'P180D'`);
      }

      const value = parseInt(match[1], 10);
      const unit = match[2] || 's';

      switch (unit) {
        case 's':
          duration = Duration.ofSeconds(value);
          break;
        case 'm':
          duration = Duration.ofMinutes(value);
          break;
        case 'h':
          duration = Duration.ofHours(value);
          break;
        case 'd':
          duration = Duration.ofDays(value);
          break;
        case 'w':
          duration = Duration.ofDays(value * 7);
          break;
        case 'M':
          duration = Duration.ofDays(value * 30);
          break;
        default:
          throw new Error(`Unsupported unit: ${unit}`);
      }
    }

    const expiresAt = now.plus(duration);
    return new Date(expiresAt.toEpochMilli());
  }

  /**
   * Date 객체를 Unix 타임스탬프로 변환
   * @param date Date 객체
   * @returns Unix 타임스탬프 (밀리초)
   */
  static toUnixTimestamp(date: Date): number {
    return date.getTime();
  }

  /**
   * Unix 타임스탬프를 ISO 문자열로 변환
   * @param timestamp Unix 타임스탬프 (밀리초)
   * @returns ISO 문자열 (예: '2023-10-15T12:00:00Z')
   */
  static toISO(timestamp: number): string {
    return Instant.ofEpochMilli(timestamp).toString();
  }

  /**
   * PostgreSQL TIMESTAMP에서 JS-Joda Instant로 변환
   * @param pgTimestamp PostgreSQL TIMESTAMP (예: '2023-10-15 12:00:00')
   * @returns Instant
   */
  static fromPostgresTimestamp(pgTimestamp: string): Instant {
    return LocalDateTime.parse(pgTimestamp.replace(' ', 'T')).atZone(ZoneId.UTC).toInstant();
  }

  /**
   * JS-Joda Instant를 PostgreSQL TIMESTAMP으로 변환
   * @param instant JS-Joda Instant
   * @returns PostgreSQL TIMESTAMP (예: '2023-10-15 12:00:00')
   */
  static toPostgresTimestamp(instant: Instant): string {
    return ZonedDateTime.ofInstant(instant, ZoneId.UTC).toLocalDateTime().toString().replace('T', ' ');
  }
}
