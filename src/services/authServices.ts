import { getConfig } from '../config/config';
import { prisma } from '../config/prismaConfig';
import { IUserMutation } from '../interfaces/interface';
import { AppError } from '../utils/appError';
import bcrypt from 'bcryptjs';
import { generateOtp } from '../utils/helper';
import { EmailVerificationHTMl } from '../utils/emailTemplate/verifyEmailOtp';

const config = getConfig();

export class AuthenticationServies {
  async registerUser({ data }: { data: IUserMutation['register'] }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already exist', 400);
    }

    const hashPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashPassword,
        country: data.country,
        ...(data.phone && { phone: data.phone }),
        emailOtp: generateOtp(),
        emailisVerified: false,
        emailOtpExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        emailOtp: true,
        emailOtpExpiresAt: true,
      },
    });

    if (!user) {
      throw new AppError('Unable to create user', 400);
    }

    const formattedExpiry =
      user.emailOtpExpiresAt &&
      new Date(user.emailOtpExpiresAt).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    const EmailUrl = `${config.frontendUrls.verifiyEmail}?email=${user.email}`;

    const html = EmailVerificationHTMl({
      firstname: user.firstName,
      companyName: 'JetManager',
      expiryTime: formattedExpiry || '',
      otp: user.emailOtp || 0,
      url: EmailUrl,
    });
  }
}
