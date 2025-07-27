import { CreateUserProfileDto } from 'src/user/presentation/dto/request/create-user-profile.dto';

const generateNickName = (): string => {
  const adjectives = ['happy', 'lazy', 'blue', 'fuzzy', 'quick'];
  const animals = ['dino', 'cat', 'fox', 'panda', 'lion'];
  const nickname = `${adjectives[Math.floor(Math.random() * adjectives.length)]}-${animals[Math.floor(Math.random() * animals.length)]}-${Math.floor(Math.random() * 1000)}`;
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

export const buildDefaultProfile = (input?: Partial<CreateUserProfileDto>): CreateUserProfileDto => {
  return {
    nickName: input?.nickName ?? generateNickName(),
    comment: input?.comment ?? '소개를 작성해주세요',
    headerId: input?.headerId ?? generateRandomInt(1, 5),
    bodyId: input?.bodyId ?? generateRandomInt(1, 5),
    headerColor: input?.headerColor ?? generateHexColor(),
    bodyColor: input?.bodyColor ?? generateHexColor(),
  };
};
