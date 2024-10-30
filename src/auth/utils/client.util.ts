import { PlatFormType } from '../consts/platform.const';

export function detectPlatform(userAgent: string): string {
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
      currentOS = PlatFormType.UNKONWN;
    }
  }
  return currentOS;
}
