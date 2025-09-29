import bcrypt from 'bcryptjs';

export const generateOtp = () => {
  return Math.floor(10000 + Math.random() * 90000);
};

export const comparedPassword = async ({
  candidatePassword,
  password,
}: {
  candidatePassword: string;
  password: string;
}): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, password);
};
