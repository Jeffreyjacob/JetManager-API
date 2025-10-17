import { NextFunction, Request, Response } from 'express';
import { User } from '../generated/prisma';
import { AppError } from '../utils/appError';
import {
  GenerateToken,
  setTokenCookies,
  VerifyAccessToken,
  VerifyRefreshToken,
} from '../utils/token.utils';
import { prisma } from '../config/prismaConfig';

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export const Protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new AppError('invalida or expired token, Please login again', 401);
    }

    const decoded = VerifyAccessToken(accessToken);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      throw new AppError(
        'the user this token belongs too, no longer exist',
        401
      );
    }

    req.user = user;
    next();
  } catch (error: any) {
    next(error);
  }
};

export const SaveRefreshToken = async ({
  userId,
  refreshToken,
}: {
  userId: User['id'];
  refreshToken: string;
}) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.token.create({
    data: {
      userId: userId,
      token: refreshToken,
      isExpiresAt: expiresAt,
    },
  });
};

export const RefreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh = req.cookies.refreshToken;
    if (!refresh) {
      throw new AppError('Invalid or expired refresh token', 400);
    }

    const decoded = VerifyRefreshToken(refresh);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      throw new AppError('Invalid refresh token, Please login again', 401);
    }

    const storedToken = await prisma.token.findFirst({
      where: {
        userId: user.id,
        token: refresh,
        isRevoked: false,
        isExpiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // generating new access and refresh token
    const token = GenerateToken(user);

    const { accessToken, refreshToken } = token;

    // saving new generated refresh token to DB
    await SaveRefreshToken({
      userId: user.id,
      refreshToken,
    });

    // update old refresh token to isRevoked true
    await prisma.token.update({
      where: {
        id: storedToken.id,
      },
      data: {
        isRevoked: true,
      },
    });

    // delete all old isRevoked tokens for the user in DB
    await prisma.token.deleteMany({
      where: {
        userId: user.id,
        isRevoked: true,
      },
    });

    // set new access and refresh token to the res.cookie

    setTokenCookies(res, accessToken, refreshToken);

    req.user = user;
    next();
  } catch (error: any) {
    next(error);
  }
};
