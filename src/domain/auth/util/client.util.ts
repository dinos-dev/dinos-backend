import { PlatFormEnumType, PlatFormType } from '../helper/platform.const';

export async function detectPlatform(userAgent: string): Promise<PlatFormEnumType> {
  let currentOS;

  const web = /mozilla/i.test(userAgent);

  // WEB 브라우저 요청
  if (web) {
    currentOS = PlatFormType.WEB;
  }
  // APP 요청
  else {
    if (userAgent.search('okhttp') > -1) {
      currentOS = PlatFormType.ANDROID;
    } else if (userAgent.search('alamofire') > -1) {
      currentOS = PlatFormType.IOS;
    } else {
      currentOS = PlatFormType.UNKNOWN;
    }
  }
  return currentOS;
}
