import * as bcrypt from 'bcrypt';

// 핸드폰 번호 해싱
export const hashedPhone = (plainText: string, hashRound: number): string => {
  return bcrypt.hashSync(plainText, hashRound);
};

// /**핸드폰 검증*/
// export const validatedPhone = async (
//   password: string,
//   hashedPassword: string,
// ) => {};
