import { Router } from 'express';
import { Protect } from '../middlewares/authMiddleware';
import { SubscriptionController } from '../controllers/subscriptionController';

const subscriptionRoute = Router();

/**
 * @openapi
 * /api/v1/subscription/cancel:
 *   post:
 *     summary: cancel subscription when subscription duration ends,
 *     tags: [Subscription]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelSubscriptionRequest'
 *     responses:
 *       200:
 *         description: Your subscription has been cancelled successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CancelSubscriptionResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
subscriptionRoute
  .route('/cancel')
  .post(Protect, SubscriptionController.cancelSubscriptionController);

/**
 * @openapi
 * /api/v1/subscription/resume:
 *   post:
 *     summary: resume subscription which has been scheduled to be cancelled at the end of subscription duration,
 *     tags: [Subscription]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResumeSubscriptionRequest'
 *     responses:
 *       200:
 *         description: Your subscription has been resumed successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResumeSubscriptionResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
subscriptionRoute
  .route('/resume')
  .post(Protect, SubscriptionController.resumeSubscriptionController);

/**
 * @openapi
 * /api/v1/subscription/restart:
 *   post:
 *     summary: restart subscription ,
 *     tags: [Subscription]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RestartSubscriptionRequest'
 *     responses:
 *       200:
 *         description: Your subscription has been initiated and being processed!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RestartSubscriptionResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
subscriptionRoute
  .route('/restart')
  .post(Protect, SubscriptionController.restartSubscriptionController);

/**
 * @openapi
 * /api/v1/subscription/resume:
 *   post:
 *     summary: resume subscription which has been scheduled to be cancelled at the end of subscription duration,
 *     tags: [Subscription]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResumeSubscriptionRequest'
 *     responses:
 *       200:
 *         description: Your subscription has been resumed successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResumeSubscriptionResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
subscriptionRoute
  .route('/resume')
  .post(Protect, SubscriptionController.resumeSubscriptionController);

/**
 * @openapi
 * /api/v1/subscription/changePlan:
 *   post:
 *     summary: change subscription plan,
 *     tags: [Subscription]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeSubscriptionPlanRequest'
 *     responses:
 *       200:
 *         description: Your subscription has been changed!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChangeSubscriptionPlanResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
subscriptionRoute
  .route('/changePlan')
  .post(Protect, SubscriptionController.changeSubscriptionController);

/**
 * @openapi
 * /api/v1/subscription/{organizationId}:
 *   get:
 *     summary: Get subscription by organization
 *     tags: [Subscription]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the organization
 *     responses:
 *       200:
 *         description: organizational subscription retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetOrganizationBySubscriptionResponse'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
subscriptionRoute
  .route('/:organizationId')
  .get(Protect, SubscriptionController.getSubscriptionByOrganization);

export default subscriptionRoute;
