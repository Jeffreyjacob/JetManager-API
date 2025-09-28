import { NextFunction, Request, Response } from 'express';
import { AuthenticationServies } from '../services/authServices';
import { AsyncHandler } from '../utils/asyncHandler';
import { registerValidators } from '../validators/auth.validator';

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
}
