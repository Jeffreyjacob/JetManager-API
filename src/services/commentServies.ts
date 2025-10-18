import { prisma } from '../config/prismaConfig';
import { Comment, MembershipRole, User } from '@prisma/client';
import { ICommentMutation } from '../interfaces/interface';
import { AppError } from '../utils/appError';

export class CommentServices {
  async createComment({
    userId,
    data,
  }: {
    userId: User['id'];
    data: ICommentMutation['create'];
  }) {
    const checkTask = await prisma.task.findUnique({
      where: {
        id: data.taskId,
      },
    });

    if (!checkTask) {
      throw new AppError('Unable to find task', 404);
    }

    const project = await prisma.project.findUnique({
      where: {
        id: checkTask.projectId,
      },
    });

    if (!project) {
      throw new AppError('Unable to find project', 404);
    }

    const member = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: project.organizationId,
        },
      },
    });

    if (!member) {
      throw new AppError(
        'You are not member of this organization, You can not comment on this task',
        404
      );
    }

    const comment = await prisma.comment.create({
      data: {
        ...data,
        userId,
      },
    });

    return {
      message: 'Comment has been created!',
    };
  }

  async updateComment({
    data,
    commentId,
    userId,
  }: {
    data: ICommentMutation['update'];
    commentId: Comment['id'];
    userId: User['id'];
  }) {
    const updateComment = await prisma.comment.update({
      where: {
        userId,
        id: commentId,
      },
      data: {
        content: data.content,
      },
    });

    if (!updateComment) {
      throw new AppError('Unable to update comment', 404);
    }

    return {
      message: 'Comment has been updated',
    };
  }

  async deleteComment({
    userId,
    commentId,
  }: {
    userId: User['id'];
    commentId: Comment['id'];
  }) {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new AppError('Unable to find comment', 404);
    }

    const task = await prisma.task.findUnique({
      where: {
        id: comment.taskId,
      },
      include: {
        project: true,
      },
    });

    if (!task) {
      throw new AppError('Unble to find task', 404);
    }

    const member = await prisma.membership.findFirst({
      where: {
        userId,
        organizationId: task.project.organizationId,
      },
    });

    if (!member) {
      throw new AppError(
        "You are not member of this organization, You can't delet this comment",
        404
      );
    }

    if (member.role === MembershipRole.WORKER && comment.userId !== userId) {
      throw new AppError(
        "You don't have authorization to delete this comment",
        404
      );
    }

    const deleteComment = await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    if (!deleteComment) {
      throw new AppError('Unable to delete comment', 404);
    }

    return {
      message: 'Comment has been deleted!',
    };
  }
}
