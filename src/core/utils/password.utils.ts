import * as bcrypt from 'bcrypt';

/**패스워드 해싱*/
export const hashedPassword = (
  plainText: string,
  hashRound: number,
): string => {
  return bcrypt.hashSync(plainText, hashRound);
};

// /**패스워드 검증*/
// export const validatedPassword = async (
//   password: string,
//   hashedPassword: string,
// ) => {};

// /**비밀번호 일치 여부 검증*/
// export const comparedPassword = async (
//   password: string,
//   hashedPassword: string,
// ) => {};
