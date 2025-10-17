import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { Protect } from '../middlewares/authMiddleware';

const authRoutes = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserRequest'
 *     responses:
 *       200:
 *         description: User Registration Successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterUserResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.route('/register').post(AuthController.RegisterUser);

/**
 * @openapi
 * /api/v1/auth/verifyEmail:
 *   post:
 *     summary: Verify User Email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyEmailRequest'
 *     responses:
 *       200:
 *         description: User Registration Successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyEmailResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.route('/verifyEmail').post(AuthController.VerifyEmail);

/**
 * @openapi
 * /api/v1/auth/resendEmailOtp:
 *   post:
 *     summary: Resend Email Otp
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendEmailOTPRequest'
 *     responses:
 *       200:
 *         description: User Registration Successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResendEmailResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.route('/resendEmailOtp').post(AuthController.ResendEmailOtp);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: User Registration Successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.route('/login').post(AuthController.Login);

/**
 * @openapi
 * /api/v1/auth/forgetPassword:
 *   post:
 *     summary: It's used to send password reset link to your email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgetPasswordRequest'
 *     responses:
 *       200:
 *         description:   It's used to send password reset link to your email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForgetPasswordResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.route('/forgetPassword').post(AuthController.ForgetPassword);

/**
 * @openapi
 * /api/v1/auth/resetPassword:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: To Reset your password and enter their new password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResetPasswordResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.route('/resetPassword').post(AuthController.ResetPassword);

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh expired access token
 *     description: |
 *       Uses the `refresh_token` cookie to issue a new access token.
 *       The client does not need to pass the refresh token manually.
 *     tags:
 *       - Auth
 *     security:
 *       - RefreshToken: []
 *     responses:
 *       200:
 *         description: A new access token was issued.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token.
 */
authRoutes.route('/refresh').post(AuthController.RefreshAccessTokenController);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout authenticated user
 *     tags:
 *       - Auth
 *     security:
 *       - AccessToken: []
 *     responses:
 *       200:
 *         description: Log out authenticated users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Unable to logout user at the moment
 */
authRoutes.route('/logout').post(Protect, AuthController.Logout);

/**
 * @openapi
 * /api/v1/auth/user:
 *   get:
 *     summary: Get authenticated user
 *     tags: [Auth]
 *     security:
 *       - AccessToken: []
 *     responses:
 *       '200':
 *         description: Authenticated user details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUserResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.route('/user').get(Protect, AuthController.authUser);

export default authRoutes;
