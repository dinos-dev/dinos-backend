import { randomUUID } from 'crypto';

/**
 * UUID 기반 초대 코드 생성
 * */
export const generateInviteCode = (): string => {
  const uuid = randomUUID().replace(/-/g, '');
  const code = uuid.substring(0, 11).toUpperCase();

  return code.replace(/0/g, 'O').replace(/1/g, 'I').substring(0, 11);
};
