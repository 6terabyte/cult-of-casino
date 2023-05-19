import bcrypt from 'bcryptjs';

export const hash = (pass: string): string => {
  return bcrypt.hashSync(pass, 10);
};

export const hashCheck = (pass: string, hash: string): boolean => {
  return bcrypt.compareSync(pass, hash);
};
