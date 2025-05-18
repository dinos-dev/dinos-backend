/** user-agent 타입을 체크하기 위한 상수 객체 */

export const PlatFormType = Object.freeze({
  WEB: 'web',
  IOS: 'ios',
  ANDROID: 'android',
  UNKNOWN: 'unknown',
} as const);

type PlatFormType = (typeof PlatFormType)[keyof typeof PlatFormType];

/**DB field 값에서 사용되는 ENUM 상수 객체*/
export enum PlatFormEnumType {
  WEB = 'web',
  IOS = 'ios',
  ANDROID = 'android',
  UNKNOWN = 'unknown',
}
