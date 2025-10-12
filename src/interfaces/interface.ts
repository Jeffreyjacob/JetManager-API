import {
  SubscriptionDuration,
  Plans,
  Organization,
  User,
  Membership,
  MembershipRole,
  TaskStatus,
  Project,
  Task,
  Attachment,
} from '../generated/prisma';

export interface IUserMutation {
  register: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    country: string;
  };
  login: {
    email: string;
    password: string;
  };
  verifyEmail: {
    email: string;
    otp: number;
  };
  resendEmail: {
    email: string;
  };
  forgetPassword: {
    email: string;
  };
  resetPassword: {
    token: string;
    password: string;
  };
}

export interface IOrganizationMutation {
  create: {
    name: string;
    subscriptionType: Plans;
    subscriptionDuration: SubscriptionDuration;
  };
  sendOrganizationalInvite: {
    email: string;
    role: MembershipRole;
    organizationId: Organization['id'];
  };
  acceptOrganizationInvite: {
    token: string;
    organizationId: Organization['id'];
  };
  removeMemberFromOrganization: {
    memberId: User['id'];
    organizationId: Organization['id'];
  };
  updateMemberOrganizationRole: {
    memberId: User['id'];
    role: MembershipRole;
    organizationId: Organization['id'];
  };
  deleteOrganization: {
    organizationId: Organization['id'];
  };
}

export interface IOrganizationQuery {
  getAllOrganization: {
    search?: string;
    page?: number;
    limit?: number;
  };
  getOrganizationMember: {
    name?: string;
    page?: number;
    limit?: number;
  };
}

export interface IProjectMutation {
  create: {
    name: string;
    description: string;
    organizationId: Organization['id'];
  };
  update: {
    name?: string;
    description?: string;
    organizationId: Organization['id'];
  };
}

export interface IProjectQuery {
  getProjectByOrganization: {
    name?: string;
    organizationId: Organization['id'];
  };
}

export interface ITaskMutation {
  create: {
    title: string;
    description?: string;
    status: TaskStatus;
    projectId: Project['id'];
    assignedTo?: User['id'];
    dueDate?: string;
    duration: number;
    organizationId: Organization['id'];
  };
  update: {
    title?: string;
    description?: string;
    assignedTo?: User['id'];
    dueDate?: string;
    duration?: number;
    organizationId: Organization['id'];
  };
  updateStatus: {
    status: TaskStatus;
    organizationId: Organization['id'];
  };
  addAttachment: {
    fileUrl: string;
    taskId: Task['id'];
    organizationId: Organization['id'];
  };
  removeAttachment: {
    organizationId: Organization['id'];
  };
}

export interface ITaskQuery {
  getTasks: {
    status?: TaskStatus;
    page?: number;
    limit?: number;
  };
}

export interface ICommentMutation {
  create: {
    content: string;
    taskId: Task['id'];
  };
  update: {
    content: string;
  };
}
