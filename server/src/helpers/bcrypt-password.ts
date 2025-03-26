import * as bcrypt from 'bcrypt';
const saltRounds = 10;

export const hashPassword = async (password: string) => {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error: any) {
    throw new Error(error);
  }
};

export const comparePassword = async (password: string, hash: string) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error: any) {
    throw new Error(error);
  }
};
