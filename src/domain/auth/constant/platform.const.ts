/** user-agent 타입을 체크하기 위한 상수 객체 */

export const PlatFormType = Object.freeze({
  WEB: 'WEB',
  IOS: 'IOS',
  ANDROID: 'ANDROID',
  UNKNOWN: 'UNKNOWN',
} as const);

type PlatFormType = (typeof PlatFormType)[keyof typeof PlatFormType];

/**DB field 값에서 사용되는 ENUM 상수 객체*/
export enum PlatFormEnumType {
  WEB = 'WEB',
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  UNKNOWN = 'UNKNOWN',
}
