import {
  SubscriptionDuration,
  Plans,
  Organization,
  User,
  Membership,
  MembershipRole,
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
  };
}
