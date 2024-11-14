/** user-agent 타입을 체크하기 위한 상수 객체 */
export const PlatFormType = Object.freeze({
  WEB: 'web',
  IOS: 'ios',
  ANDROID: 'android',
  UNKONWN: 'unknown',
} as const);

type PlatFormType = (typeof PlatFormType)[keyof typeof PlatFormType];
