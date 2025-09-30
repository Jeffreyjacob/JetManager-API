import { SubscriptionDuration, Plans } from '../generated/prisma';

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
}
