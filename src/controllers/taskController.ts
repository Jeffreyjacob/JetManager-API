import { NextFunction, Request, Response } from 'express';
import { TaskServices } from '../services/taskServices';
import { AsyncHandler } from '../utils/asyncHandler';
import {
  createTaskValidators,
  getTaskByProjectIdValidators,
  updateStatusValidators,
  updateTaskValidators,
} from '../validators/task.validator';
import {
  OrganizationRestrict,
  OrganizationSubscriptionCheck,
} from '../middlewares/orgaizationMiddleware';
import {
  MembershipRole,
  Project,
  Task,
  TaskStatus,
  User,
} from '../generated/prisma';

export class TaskController {
  private static taskService = new TaskServices();

  static createTaskController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await createTaskValidators(req.body);

      await OrganizationSubscriptionCheck(validatedBody.organizationId);
      await OrganizationRestrict(
        req.user.id,
        validatedBody.organizationId,
        MembershipRole.OWNER,
        MembershipRole.ADMIN
      );

      const result = await TaskController.taskService.createTask({
        data: validatedBody,
      });

      return res.status(201).json({
        success: true,
        ...result,
      });
    }
  );

  static updateTaskController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const taskId = req.params.taskId;
      const validatedBody = await updateTaskValidators(req.body);

      await OrganizationSubscriptionCheck(validatedBody.organizationId);
      await OrganizationRestrict(
        req.user.id,
        validatedBody.organizationId,
        MembershipRole.ADMIN,
        MembershipRole.OWNER
      );

      const result = await TaskController.taskService.updateTask({
        taskId: taskId as Task['id'],
        data: validatedBody,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static updateTaskStatusController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const taskId = req.params.taskId;
      const validatedBody = await updateStatusValidators(req.body);
      await OrganizationSubscriptionCheck(validatedBody.organizationId);
      await OrganizationRestrict(
        req.user.id,
        validatedBody.organizationId,
        MembershipRole.WORKER,
        MembershipRole.ADMIN,
        MembershipRole.OWNER
      );

      const result = await TaskController.taskService.updateTaskStatus({
        taskId: taskId as Task['id'],
        data: validatedBody,
        userId: req.user.id as User['id'],
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static getTaskByProjectIdController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const projectId = req.params.projectId;

      const status = req.query.status as string;
      const page = req.query.page as string;
      const limit = req.query.limit as string;

      const query = {
        ...(status && { status: status as TaskStatus }),
        ...(page && { page: parseInt(page) }),
        ...(limit && { limit: parseInt(limit) }),
      };

      const validatedBody = await getTaskByProjectIdValidators(query);

      const result = await TaskController.taskService.getTaskByProject({
        data: validatedBody,
        projectId: projectId as Project['id'],
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static getTaskByIdController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const taskId = req.params.taskId;

      const result = await TaskController.taskService.getTaskById({
        taskId: taskId as Task['id'],
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static deleteTask = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const taskId = req.params.taskId;

      const result = await TaskController.taskService.deleteTask({
        taskId: taskId as Task['id'],
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );
}
