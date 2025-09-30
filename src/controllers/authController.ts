import { NextFunction, Request, Response } from 'express';
import { AuthenticationServies } from '../services/authServices';
import { AsyncHandler } from '../utils/asyncHandler';
import {
  forgetPasswordValidators,
  loginValidators,
  registerValidators,
  resendEmailOtpValidators,
  resetPasswordValidators,
  verifyEmailValidators,
} from '../validators/auth.validator';
import { RefreshAccessToken } from '../middlewares/authMiddleware';

export class AuthController {
  private static authService = new AuthenticationServies();

  static RegisterUser = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await registerValidators(req.body);

      const result = await AuthController.authService.registerUser({
        data: validatedBody,
      });

      return res.status(201).json({
        success: true,
        ...result,
      });
    }
  );

  static VerifyEmail = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await verifyEmailValidators(req.body);

      const result = await AuthController.authService.verifyOtp({
        data: validatedBody,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static ResendEmailOtp = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await resendEmailOtpValidators(req.body);

      const result = await AuthController.authService.ResendOtp({
        data: validatedBody,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static Login = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await loginValidators(req.body);

      const result = await AuthController.authService.Login({
        res,
        data: validatedBody,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static ForgetPassword = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await forgetPasswordValidators(req.body);

      const result = await AuthController.authService.forgetPassword({
        data: validatedBody,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static ResetPassword = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await resetPasswordValidators(req.body);

      const result = await AuthController.authService.ResetPassword({
        data: validatedBody,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static RefreshAccessTokenController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      console.log('Inside refresh route');
      await RefreshAccessToken(req, res, next);

      return res.status(200).json({
        success: true,
        message: 'Your token has been refreshed',
      });
    }
  );

  static Logout = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await AuthController.authService.LogOut({
        req,
        res,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static authUser = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await AuthController.authService.authUser({
        userId: req.user.id,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );
}
