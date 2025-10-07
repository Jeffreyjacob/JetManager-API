import { NextFunction, Request, Response } from 'express';
import { OrganizationServices } from '../services/organizationServices';
import { AsyncHandler } from '../utils/asyncHandler';
import {
  acceptOrganizationInviteValidator,
  createOrganizationValidator,
  removeMemberFromOrganizationValidator,
  sendOrganizationInviteValidator,
  updateMemberOrganizationRoleValidators,
} from '../validators/organization.validator';
import {
  OrganizationRestrict,
  OrganizationSubscriptionCheck,
} from '../middlewares/orgaizationMiddleware';
import { MembershipRole, Organization } from '../generated/prisma';

export class OrganizationController {
  private static organizationServices = new OrganizationServices();

  static createOrganizationController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await createOrganizationValidator(req.body);

      const result =
        await OrganizationController.organizationServices.createOrganization({
          userId: req.user.id,
          data: validatedBody,
        });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static sendOrganizationInviteController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await sendOrganizationInviteValidator(req.body);

      await OrganizationSubscriptionCheck(validatedBody.organizationId);

      // check if logged user has permission to perform action
      await OrganizationRestrict(
        req.user.id,
        validatedBody.organizationId,
        MembershipRole.OWNER,
        MembershipRole.ADMIN
      );

      const result =
        await OrganizationController.organizationServices.sendOrganizationInvite(
          {
            userId: req.user.id,
            data: validatedBody,
          }
        );

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static acceptOrganizationInviteController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await acceptOrganizationInviteValidator(req.body);

      const result =
        await OrganizationController.organizationServices.acceptOrganizationInvite(
          {
            data: validatedBody,
            userId: req.user.id,
          }
        );

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static removeMemberFromOrganization = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await removeMemberFromOrganizationValidator(
        req.body
      );

      await OrganizationSubscriptionCheck(validatedBody.organizationId);
      await OrganizationRestrict(
        req.user.id,
        validatedBody.organizationId,
        MembershipRole.OWNER,
        MembershipRole.ADMIN
      );

      const result =
        await OrganizationController.organizationServices.removeMemberFromOrganization(
          {
            userId: req.user.id,
            data: validatedBody,
          }
        );

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static updateMemberOrganizationRole = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await updateMemberOrganizationRoleValidators(
        req.body
      );

      await OrganizationSubscriptionCheck(validatedBody.organizationId);
      await OrganizationRestrict(
        req.user.id,
        validatedBody.organizationId,
        MembershipRole.OWNER
      );

      const result =
        await OrganizationController.organizationServices.updateMemberOrganizationRole(
          {
            data: validatedBody,
          }
        );

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );
}
