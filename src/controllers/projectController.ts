import { NextFunction, Request, Response } from 'express';
import { ProjectServices } from '../services/projectServices';
import { AsyncHandler } from '../utils/asyncHandler';
import {
  createProjectValidators,
  deleteProjectValidator,
  getProjectbyOrganizationValidator,
  updateProjectValidators,
} from '../validators/project.validator';
import {
  OrganizationRestrict,
  OrganizationSubscriptionCheck,
} from '../middlewares/orgaizationMiddleware';
import {
  MembershipRole,
  Organization,
  Project,
  User,
} from '../generated/prisma';

export class ProjectController {
  private static projectService = new ProjectServices();

  static CreateProjectController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await createProjectValidators(req.body);

      await OrganizationSubscriptionCheck(validatedBody.organizationId);
      await OrganizationRestrict(
        req.user.id as User['id'],
        validatedBody.organizationId,
        MembershipRole.OWNER,
        MembershipRole.ADMIN
      );

      const result = await ProjectController.projectService.createProject({
        data: validatedBody,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static updateProjectController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const projectId = req.params.projectId;
      const validatedBody = await updateProjectValidators(req.body);

      await OrganizationSubscriptionCheck(validatedBody.organizationId);
      await OrganizationRestrict(
        req.user.id as User['id'],
        validatedBody.organizationId,
        MembershipRole.OWNER,
        MembershipRole.ADMIN
      );

      const result = await ProjectController.projectService.updateProject({
        projectId: projectId as Project['id'],
        data: validatedBody,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static getProjectByIdController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const projectId = req.params.projectId;

      const result = await ProjectController.projectService.getProjectById({
        projectId: projectId,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static getProjectByOrganizationIdController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const organizationId = req.params.orgId;
      console.log(organizationId, 'organizationId');
      const name = req.query.name as string;

      const query = {
        ...(name && { name }),
        organizationId,
      };

      const validatedBody = await getProjectbyOrganizationValidator(query);

      const result =
        await ProjectController.projectService.getProjectByOrganizationId({
          data: validatedBody,
        });

      console.log(result);

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static deleteProject = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await deleteProjectValidator(req.body);

      const result = await ProjectController.projectService.deleteProject({
        projectId: validatedBody.projectId,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );
}
