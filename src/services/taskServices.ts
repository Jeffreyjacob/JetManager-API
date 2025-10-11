import { prisma } from '../config/prismaConfig';
import {
  MembershipRole,
  Project,
  Task,
  TaskStatus,
  User,
} from '../generated/prisma';
import { ITaskMutation, ITaskQuery } from '../interfaces/interface';
import { getEmailQueue } from '../jobs/queue/emailQueue';
import { AppError } from '../utils/appError';
import { taskDueReminderTemplate } from '../utils/emailTemplate/taskReminderEmail';

export class TaskServices {
  async createTask({ data }: { data: ITaskMutation['create'] }) {
    const { organizationId, ...otherData } = data;
    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      throw new AppError('Unable to find organizationId', 404);
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId: organization.id,
      },
      include: {
        features: true,
      },
    });

    if (!subscription) {
      throw new AppError('Unable to find organization subscription', 404);
    }

    const packageRecord = await prisma.packageRecord.findFirst({
      where: {
        subscriptionId: subscription.id,
        subscriptionCycleId: subscription.subscriptionCycleId || '',
      },
    });

    if (!packageRecord) {
      throw new AppError('Unable to find subscription package record', 404);
    }

    if (
      subscription.features &&
      packageRecord.tasks >= subscription.features.maxTasks
    ) {
      throw new AppError(
        'You have reach your limit for organization subscription plan for your subscription plan,Please upgrade to continue using this service ',
        400
      );
    }

    const checkAssignedUser =
      data.assignedTo &&
      (await prisma.membership.findFirst({
        where: {
          organizationId: organizationId,
          userId: data.assignedTo,
        },
      }));

    if (data.assignedTo && !checkAssignedUser) {
      throw new AppError(
        'This User assigned to this task is not member of this organization',
        400
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        organizationId: organizationId,
      },
    });

    if (!project) {
      throw new AppError(
        'Unable to find project or project does not belong to selected Organization',
        404
      );
    }

    const dueDate = data.dueDate && new Date(data.dueDate);

    if (dueDate && dueDate.getTime() < Date.now()) {
      throw new AppError('due date must be greater than current time', 400);
    }

    const newTask = await prisma.task.create({
      data: {
        ...otherData,
      },
    });

    await prisma.packageRecord.update({
      where: {
        id: packageRecord.id,
      },
      data: {
        tasks: {
          increment: 1,
        },
      },
    });

    if (newTask.dueDate && newTask.assignedTo) {
      // if there is user assigned to the task, schedule email reminder if they don't completed the task before the dueDate

      const assignedUser = await prisma.user.findUnique({
        where: {
          id: data.assignedTo,
        },
      });

      const html = taskDueReminderTemplate({
        organizationName: organization.name,
        taskTitle: newTask.title,
        dueDate: new Date(newTask.dueDate).toDateString(),
        name: assignedUser?.firstName || '',
      });

      const delay =
        new Date(newTask.dueDate).getTime() - 5 * 60 * 1000 - Date.now();

      const emailJob = getEmailQueue();
      if (delay > 0) {
        const dueDateReminder = await emailJob.add(
          'email',
          {
            to: assignedUser?.email,
            subject: `Your Task with id ${newTask.id} is due`,
            body: html,
          },
          {
            delay,
          }
        );

        if (dueDateReminder.id) {
          await prisma.task.update({
            where: {
              id: newTask.id,
            },
            data: {
              dueDateReminderId: dueDateReminder.id,
            },
          });
        }
      }
    }

    return {
      message: 'Task has been created successfully!',
    };
  }

  async updateTask({
    taskId,
    data,
  }: {
    taskId: Task['id'];
    data: ITaskMutation['update'];
  }) {
    const { organizationId, ...otherData } = data;

    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!existingTask) {
      throw new AppError('Unable to find task', 404);
    }

    const dueDate = data.dueDate && new Date(data.dueDate);

    if (dueDate && dueDate.getTime() < Date.now()) {
      throw new AppError("Duedate can't be less than now ", 400);
    }

    const checkAssignedUser =
      data.assignedTo &&
      (await prisma.membership.findFirst({
        where: {
          userId: data.assignedTo,
          organizationId: organizationId,
        },
      }));

    if (data.assignedTo && !checkAssignedUser) {
      throw new AppError('user is not a member of this organization', 400);
    }

    const updateTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...otherData,
      },
    });

    if (!updateTask) {
      throw new AppError('Unable to update task', 400);
    }

    // schedule task reminder, if user is assigned the task in update task or new dueDate is passed

    const assigenedUserChanged =
      (data.assignedTo && data.assignedTo !== existingTask.assignedTo) ||
      (!existingTask.assignedTo && data.assignedTo);
    const dueDateChanged =
      (data.dueDate &&
        existingTask.dueDate &&
        new Date(data.dueDate).getTime() !==
          new Date(existingTask.dueDate).getTime()) ||
      (!existingTask.dueDate && data.dueDate);

    if (assigenedUserChanged || dueDateChanged) {
      const emailQueue = getEmailQueue();
      if (existingTask.dueDateReminderId) {
        const oldReminder = await emailQueue.getJob(
          existingTask.dueDateReminderId
        );

        if (oldReminder) {
          await oldReminder.remove();
        }

        await prisma.task.update({
          where: {
            id: taskId,
          },
          data: {
            dueDateReminderId: null,
          },
        });
      }

      if (updateTask.dueDate && updateTask.assignedTo) {
        const assignedUser = await prisma.user.findUnique({
          where: {
            id: updateTask.assignedTo,
          },
        });

        const organization = await prisma.organization.findUnique({
          where: {
            id: organizationId,
          },
        });

        if (!organization) {
          throw new AppError('unable to find organization ', 404);
        }

        const delay =
          new Date(updateTask.dueDate).getTime() - 5 * 60 * 1000 - Date.now();

        if (delay > 0) {
          const html = taskDueReminderTemplate({
            organizationName: organization.name,
            name: assignedUser?.firstName || '',
            taskTitle: updateTask.title,
            dueDate: new Date(updateTask.dueDate).toDateString(),
          });

          const reminderJob = await emailQueue.add(
            'email',
            {
              to: assignedUser?.email,
              subject: `Your ${updateTask.title} Task would soon be due`,
              body: html,
            },
            {
              delay,
            }
          );

          if (reminderJob.id) {
            await prisma.task.update({
              where: {
                id: taskId,
              },
              data: {
                dueDateReminderId: reminderJob.id,
              },
            });
          }
        }
      }
    }

    return {
      message: 'Task has been updated successfully!',
    };
  }

  async updateTaskStatus({
    userId,
    taskId,
    data,
  }: {
    userId: User['id'];
    taskId: Task['id'];
    data: ITaskMutation['updateStatus'];
  }) {
    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!existingTask) {
      throw new AppError('Unable to find task', 404);
    }

    const checkIfUserIsMemeber = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: data.organizationId,
        },
      },
    });

    if (!checkIfUserIsMemeber) {
      throw new AppError(
        "You don't belong to organization which this task was created,You can update the status",
        400
      );
    }

    if (
      checkIfUserIsMemeber.role === MembershipRole.WORKER &&
      checkIfUserIsMemeber.userId !== existingTask.assignedTo
    ) {
      throw new AppError(
        "This task was not assigned to you, you can't update the status",
        400
      );
    }

    const updateTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status: data.status,
      },
    });

    if (data.status === TaskStatus.DONE) {
      if (updateTask.dueDateReminderId) {
        const emailQueue = getEmailQueue();
        const reminderJob = await emailQueue.getJob(
          updateTask.dueDateReminderId
        );

        if (reminderJob) {
          await reminderJob.remove();
        }

        await prisma.task.update({
          where: {
            id: taskId,
          },
          data: {
            dueDateReminderId: null,
          },
        });
      }
    }

    return {
      message: 'Task status updated!',
    };
  }

  async getTaskByProject({
    projectId,
    data,
  }: {
    projectId: Project['id'];
    data: ITaskQuery['getTasks'];
  }) {
    const status = data.status && {
      status: data.status,
    };

    const page = data.page || 1;
    const take = data.limit || 10;
    const skip = (page - 1) * take;

    const where = {
      ...status,
      projectId,
    };

    const totalCount = await prisma.task.count({ where });
    const totalPages = Math.ceil(totalCount / take);

    const tasks = await prisma.task.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: tasks,
      currentPage: page,
      totalPages,
      totalCount,
    };
  }
}
