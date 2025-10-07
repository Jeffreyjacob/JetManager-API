import { OrganizationInvite } from '../../generated/prisma';

export interface EmailJobData {
  to: string | string[];
  subject: string;
  body: string;
  template?: string;
  data?: Record<string, any>;
}

export interface ExpiringInviteData {
  InviteId: OrganizationInvite['id'];
}
