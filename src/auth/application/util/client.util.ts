import { PlatformEnumType, PlatformType } from '../../domain/constant/platform.const';

export async function detectPlatform(userAgent: string): Promise<PlatformEnumType> {
  let currentOS;

  const web = /mozilla/i.test(userAgent);

  // WEB 브라우저 요청
  if (web) {
    currentOS = PlatformType.WEB;
  }
  // APP 요청
  else {
    if (userAgent.search('okhttp') > -1) {
      currentOS = PlatformType.ANDROID;
    } else if (userAgent.search('alamofire') > -1) {
      currentOS = PlatformType.IOS;
    } else {
      currentOS = PlatformType.UNKNOWN;
    }
  }
  return currentOS;
}
