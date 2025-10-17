import jwt from 'jsonwebtoken';
import { getConfig } from '../config/config';
import { Response } from 'express';
import { User } from '../generated/prisma';

interface TokenPayload {
  id: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

const config = getConfig();
export const GenerateToken = (user: User): TokenResponse => {
  const accessToken = jwt.sign(
    { id: user.id },
    config.tokens.accessToken.tokenKey,
    {
      expiresIn: '15m',
    }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    config.tokens.refreshToken.tokenKey,
    {
      expiresIn: '7d',
    }
  );

  return { accessToken, refreshToken };
};

export const VerifyAccessToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(
    token,
    config.tokens.accessToken.tokenKey
  ) as TokenPayload;

  return decoded;
};

export const VerifyRefreshToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(
    token,
    config.tokens.refreshToken.tokenKey
  ) as TokenPayload;

  return decoded;
};

export const setTokenCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie('accessToken', accessToken, {
    httpOnly: config.env === 'production' ? true : false,
    sameSite: 'strict',
    secure: config.env === 'production' ? true : false,
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: config.env === 'production' ? true : false,
    sameSite: 'strict',
    secure: config.env === 'production' ? true : false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

export const ClearTokenCookies = (res: Response): void => {
  res.clearCookie('accessToken', {
    httpOnly: config.env === 'production' ? true : false,
    sameSite: 'strict',
    secure: config.env === 'production' ? true : false,
    maxAge: 7 * 24 * 60 * 1000,
    path: '/',
  });

  res.clearCookie('refreshToken', {
    httpOnly: config.env === 'production' ? true : false,
    sameSite: 'strict',
    secure: config.env === 'production' ? true : false,
    maxAge: 7 * 24 * 60 * 1000,
    path: '/',
  });
};
