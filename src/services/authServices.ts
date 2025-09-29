import { getConfig } from '../config/config';
import { prisma } from '../config/prismaConfig';
import { IUserMutation } from '../interfaces/interface';
import { AppError } from '../utils/appError';
import bcrypt from 'bcryptjs';
import { comparedPassword, generateOtp } from '../utils/helper';
import { EmailVerificationHTMl } from '../utils/emailTemplate/verifyEmailOtp';
import { getEmailQueue } from '../jobs/queue/emailQueue';
import { GenerateToken, setTokenCookies } from '../utils/token.utils';
import { SaveRefreshToken } from '../middlewares/authMiddleware';
import { Response } from 'express';

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

    try {
      const emailQueue = getEmailQueue();
      const job = await emailQueue.add('email', {
        to: user.email,
        subject: 'Email verification',
        body: html,
      });
    } catch (error) {
      console.error('Error adding job to queue:', error);
      throw new AppError('Failed to send verification email', 500);
    }

    return {
      message:
        'User created, Please verify your email to finish sign up process',
    };
  }

  async verifyOtp({ data }: { data: IUserMutation['verifyEmail'] }) {
    const verifyUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        emailOtp: data.otp,
        emailOtpExpiresAt: { gt: new Date() },
        emailisVerified: false,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!verifyUser) {
      throw new AppError('Otp is invalid or expired', 400);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: verifyUser.id,
      },
      data: {
        emailisVerified: true,
        emailOtp: null,
        emailOtpExpiresAt: null,
      },
    });

    if (!updatedUser) {
      throw new AppError('Unable to update user, try again', 400);
    }

    return {
      message: 'Your email has been verified',
    };
  }

  async ResendOtp({ data }: { data: IUserMutation['resendEmail'] }) {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
        emailisVerified: false,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new AppError('Unable to find user with email', 400);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailOtp: generateOtp(),
        emailOtpExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
      select: {
        emailOtp: true,
        emailOtpExpiresAt: true,
        firstName: true,
        email: true,
      },
    });

    const formattedExpiry =
      updatedUser.emailOtpExpiresAt &&
      new Date(updatedUser.emailOtpExpiresAt).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    const EmailUrl = `${config.frontendUrls.verifiyEmail}?email=${updatedUser.email}`;

    const html = EmailVerificationHTMl({
      firstname: updatedUser.firstName,
      companyName: 'JetManager',
      expiryTime: formattedExpiry || '',
      otp: updatedUser.emailOtp || 0,
      url: EmailUrl,
    });

    try {
      const emailQueue = getEmailQueue();
      await emailQueue.add('email', {
        to: updatedUser.email,
        subject: 'Email verification',
        body: html,
      });
    } catch (error) {
      console.error('Error adding job to queue:', error);
      throw new AppError('Failed to send verification email', 500);
    }

    return {
      message: 'Otp has been sent',
    };
  }

  async Login({ res, data }: { res: Response; data: IUserMutation['login'] }) {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
        isVerified: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials, try again', 400);
    }

    if (
      user.accountLockedUntil &&
      new Date(user.accountLockedUntil) > new Date()
    ) {
      const lockTimeRemaining = Math.ceil(
        Math.ceil(
          (new Date(user.accountLockedUntil).getTime() - new Date().getTime()) /
            (1000 * 60)
        )
      );

      throw new AppError(
        `Your account is locked, try again in ${lockTimeRemaining}`,
        423
      );
    }

    if (user.emailisVerified !== null && user.emailisVerified === false) {
      throw new AppError(
        'You have to verify your email, before you can login',
        400
      );
    }

    const passwordCheck = await comparedPassword({
      candidatePassword: data.password,
      password: user.password,
    });

    if (!passwordCheck) {
      const maxAttempts = 5;
      const currentAttempts = (user.loginAttempts || 0) + 1;

      if (currentAttempts >= maxAttempts) {
        const lockDuration = 30 * 60 * 1000;

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            loginAttempts: currentAttempts,
            accountLockedUntil: new Date(Date.now() + lockDuration),
          },
        });

        throw new AppError(
          'Your account is locked due Too Many attempts, Try again in 30 minutes',
          423
        );
      } else {
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            loginAttempts: currentAttempts,
          },
        });

        const attemptsLefts = maxAttempts - currentAttempts;

        throw new AppError(
          `Invalida credentials, you have ${attemptsLefts} attempts left`,
          400
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isActive: true,
        loginAttempts: 0,
        accountLockedUntil: null,
      },
    });

    if (!updatedUser) {
      throw new AppError('Unable to update user, try again', 400);
    }

    const token = GenerateToken(user);

    const { accessToken, refreshToken } = token;

    await SaveRefreshToken({ userId: user.id, refreshToken });

    setTokenCookies(res, accessToken, refreshToken);

    return {
      messsage: 'Login successful!',
    };
  }
}
