import { NextFunction, Request, Response } from 'express';
import { SubscriptionServices } from '../services/subscriptionServices';
import { AsyncHandler } from '../utils/asyncHandler';
import {
  cancelSubscriptionValidators,
  changeSubscriptionValidators,
  restartSubscriptionValidators,
  resumeSubscriptionValidators,
} from '../validators/subscription.validators';
import { MembershipRole } from '@prisma/client';
import { OrganizationRestrict } from '../middlewares/orgaizationMiddleware';

export class SubscriptionController {
  private static subscriptionServices = new SubscriptionServices();

  static cancelSubscriptionController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await cancelSubscriptionValidators(req.body);

      await OrganizationRestrict(
        req.user.id,
        validatedBody.organizationId,
        MembershipRole.OWNER
      );

      const result =
        await SubscriptionController.subscriptionServices.cancelSubsription({
          data: validatedBody,
          userId: req.user.id,
        });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static resumeSubscriptionController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await resumeSubscriptionValidators(req.body);

      await OrganizationRestrict(
        req.user.id,
        validatedBody.organizationId,
        MembershipRole.OWNER
      );

      const result =
        await SubscriptionController.subscriptionServices.resumeSubscription({
          data: validatedBody,
          userId: req.user.id,
        });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static restartSubscriptionController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await restartSubscriptionValidators(req.body);

      await OrganizationRestrict(
        req.user.id,
        validatedBody.organizationId,
        MembershipRole.OWNER
      );

      const result =
        await SubscriptionController.subscriptionServices.restartSubscription({
          data: validatedBody,
          userId: req.user.id,
        });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static changeSubscriptionController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await changeSubscriptionValidators(req.body);

      await OrganizationRestrict(
        req.user.id,
        validatedBody.organizationId,
        MembershipRole.OWNER
      );

      const result =
        await SubscriptionController.subscriptionServices.changeSubscription({
          data: validatedBody,
          userId: req.user.id,
        });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static getSubscriptionByOrganization = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const organizationId = req.params.organizationId;

      const result =
        await SubscriptionController.subscriptionServices.getSubsctiptoonByOrganization(
          {
            organizationId,
          }
        );

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );
}
