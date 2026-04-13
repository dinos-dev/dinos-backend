import { UserProfileCommand } from '../command/user-profile.command';

const generatenickname = (): string => {
  const adjectives = [
    '행복한',
    '느긋한',
    '파란',
    '푹신한',
    '빠른',
    '귀여운',
    '용감한',
    '신나는',
    '졸린',
    '배고픈',
    '차가운',
    '따뜻한',
    '조용한',
    '엉뚱한',
    '수줍은',
    '활발한',
    '포근한',
    '의젓한',
  ];
  const animals = [
    '공룡',
    '고양이',
    '여우',
    '판다',
    '사자',
    '토끼',
    '펭귄',
    '다람쥐',
    '강아지',
    '햄스터',
    '기린',
    '코끼리',
    '오리',
    '수달',
    '늑대',
    '양',
  ];
  const nickname = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${animals[Math.floor(Math.random() * animals.length)]}${Math.floor(Math.random() * 1000)}`;
  return nickname.substring(0, 20); // 최대 20자 제한
};

const generateRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateHexColor = (): string => {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')
    .toUpperCase()}`;
};

export const buildDefaultProfile = (userId: number, input?: Partial<UserProfileCommand>): UserProfileCommand => {
  return {
    userId,
    nickname: input?.nickname ?? generatenickname(),
    comment: input?.comment ?? '소개를 작성해주세요',
    headerId: input?.headerId ?? generateRandomInt(1, 5),
    bodyId: input?.bodyId ?? generateRandomInt(1, 5),
    headerColor: input?.headerColor ?? generateHexColor(),
    bodyColor: input?.bodyColor ?? generateHexColor(),
  };
};
