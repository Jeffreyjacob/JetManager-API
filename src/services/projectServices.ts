import { prisma } from '../config/prismaConfig';
import { Organization, Prisma, Project } from '../generated/prisma';
import { IProjectMutation, IProjectQuery } from '../interfaces/interface';
import { AppError } from '../utils/appError';

export class ProjectServices {
  async createProject({ data }: { data: IProjectMutation['create'] }) {
    const organization = await prisma.organization.findUnique({
      where: {
        id: data.organizationId,
      },
    });

    if (!organization) {
      throw new AppError('Unable to find organization', 404);
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
      throw new AppError('Unable to find subscription', 404);
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
      packageRecord.projects >= subscription.features?.maxProjects
    ) {
      throw new AppError(
        'You have reach your limit of project for your subscription, Please upgrade to continue using our service',
        400
      );
    }

    // check if project already exist

    const project = await prisma.project.findFirst({
      where: {
        ...data,
      },
    });

    if (project) {
      throw new AppError('Project already exist', 400);
    }

    // creating new project
    const newProject = await prisma.project.create({
      data: {
        ...data,
      },
    });

    // updating package record

    await prisma.packageRecord.update({
      where: {
        id: packageRecord.id,
      },
      data: {
        projects: {
          increment: 1,
        },
      },
    });

    return {
      message: 'Project has been created',
    };
  }

  async updateProject({
    projectId,
    data,
  }: {
    projectId: Project['id'];
    data: IProjectMutation['update'];
  }) {
    const { organizationId, ...otherData } = data;
    const updateProject = await prisma.project.update({
      where: {
        id: projectId,
        organizationId,
      },
      data: {
        ...otherData,
      },
    });

    if (!updateProject) {
      throw new AppError('Unable to update product', 400);
    }

    return {
      message: 'Project has been updated',
    };
  }

  async getProjectById({ projectId }: { projectId: Project['id'] }) {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    return {
      data: project,
    };
  }

  async getProjectByOrganizationId({
    data,
  }: {
    data: IProjectQuery['getProjectByOrganization'];
  }) {
    const name = data.name && {
      name: {
        contains: data.name,
        mode: Prisma.QueryMode.insensitive,
      },
    };

    const projects = await prisma.project.findMany({
      where: {
        ...name,
        organizationId: data.organizationId,
      },
    });

    return {
      data: projects,
    };
  }

  async deleteProject({ projectId }: { projectId: Project['id'] }) {
    const deltedProject = await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    if (!deltedProject) {
      throw new AppError('Unable to find project', 404);
    }

    return {
      message: 'Project has been deleted!',
    };
  }
}
