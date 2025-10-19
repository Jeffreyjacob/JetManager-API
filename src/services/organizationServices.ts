import {
  IOrganizationMutation,
  IOrganizationQuery,
} from '../interfaces/interface';
import { InviteStatus, Organization, Prisma, User } from '@prisma/client';
import { prisma } from '../config/prismaConfig';
import { AppError } from '../utils/appError';
import { stripe } from '../utils/stripe';
import { getPlanDetials } from '../utils/subscription.utils';
import { SubscriptionStatus, MembershipRole } from '@prisma/client';
import { STRIPE_PRICE_IDS } from '../utils/stripePriceId';
import { getConfig } from '../config/config';
import crypto from 'crypto';
import { getExpiringInviteQueue } from '../jobs/queue/expiredInviteQueue';
import { getEmailQueue } from '../jobs/queue/emailQueue';
import { OrganizationInviteEmail } from '../utils/emailTemplate/organizationInviteEmail';

const config = getConfig();
export class OrganizationServices {
  async createOrganization({
    userId,
    data,
  }: {
    userId: User['id'];
    data: IOrganizationMutation['create'];
  }) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError('Unable to found user', 404);
    }

    const existingOrganization = await prisma.organization.findFirst({
      where: {
        name: data.name,
        ownerId: userId,
      },
    });

    if (existingOrganization) {
      throw new AppError('organization with this name already exist', 400);
    }

    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        ownerId: userId,
      },
    });

    // create memeber as owner for organization

    const memebership = await prisma.membership.create({
      data: {
        userId,
        organizationId: organization.id,
        role: MembershipRole.OWNER,
      },
    });

    const stripeCustomer = await stripe.customers.create({
      name: user.firstName,
      email: user.email,
    });

    const planDetails = getPlanDetials({
      plan: data.subscriptionType,
      duration: data.subscriptionDuration,
    });

    const today = new Date();
    const endTrialDay = new Date(
      today.setDate(today.getDate() + planDetails.trialDays)
    );

    const stripe_price_id =
      STRIPE_PRICE_IDS[data.subscriptionType][data.subscriptionDuration];

    const subscription = await prisma.subscription.create({
      data: {
        organizationId: organization.id,
        subscriptionType: data.subscriptionType,
        subscriptionDuration: data.subscriptionDuration,
        status: SubscriptionStatus.PENDING,
        startDate: new Date(),
        endDate: endTrialDay,
        price: planDetails.price,
        stripeCustomerId: stripeCustomer.id,
      },
    });

    const url =
      config.env === 'production' ? config.backendUrl : 'http://localhost:8000';

    console.log(url);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomer.id,
      line_items: [{ price: stripe_price_id, quantity: 1 }],
      subscription_data: {
        trial_period_days: planDetails.trialDays,
      },
      success_url: `${url}${config.apiPrefix}/organization/${organization.id}/billing/success`,
      cancel_url: `${url}${config.apiPrefix}/organization/${organization.id}/billing/cancel`,
      metadata: {
        organizationId: organization.id,
        userId: user.id,
      },
    });

    console.log(session.url);

    return {
      message:
        'Organization profile create, click on the link provided to start your free trial of your subscription plan picked',
      url: session.url,
    };
  }
  async getAllOrganization({
    userId,
    data,
  }: {
    userId: User['id'];
    data: IOrganizationQuery['getAllOrganization'];
  }) {
    const page = data.page || 1;
    const take = data.limit || 10;
    const skip = (page - 1) * 100;

    const where = {
      userId: userId,
      ...(data.search && {
        organization: {
          name: {
            contains: data.search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      }),
    };

    const totalCount = await prisma.membership.count({ where });
    const totalPage = Math.ceil(totalCount / take);

    const organizations = await prisma.membership.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: organizations,
      totalCount,
      totalPage,
      currentPage: page,
    };
  }

  async getOrganizationbyId({
    userId,
    organizationId,
  }: {
    userId: User['id'];
    organizationId: Organization['id'];
  }) {
    const memeber = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!memeber) {
      throw new AppError(
        "You can't view organization details that you don't belong too",
        400
      );
    }

    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
      },
      include: {
        projects: true,
        memberships: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!organization) {
      throw new AppError('Unable to find organization', 404);
    }

    return {
      data: organization,
    };
  }

  async sendOrganizationInvite({
    data,
    userId,
  }: {
    data: IOrganizationMutation['sendOrganizationalInvite'];
    userId: User['id'];
  }) {
    const inviter = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!inviter) throw new AppError('Inviter not found', 404);

    const organization = await prisma.organization.findUnique({
      where: {
        id: data.organizationId,
      },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    const existinguser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existinguser) {
      const existingMembership = await prisma.membership.findUnique({
        where: {
          userId_organizationId: {
            userId: existinguser.id,
            organizationId: data.organizationId,
          },
        },
      });

      if (existingMembership) {
        throw new AppError('User alreadt part of organization', 400);
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite = await prisma.organizationInvite.create({
      data: {
        organizationId: data.organizationId,
        inviterId: inviter.id,
        email: data.email,
        role: data.role,
        token,
        expiresAt,
      },
    });

    // update invite to expired after 7 days, if the ivite has not been accepted

    const expiringInviteJob = getExpiringInviteQueue();

    const ExpiringInvitejob = await expiringInviteJob.add(
      'expiringInvite',
      {
        InviteId: invite.id,
      },
      {
        delay: expiresAt.getTime() - Date.now(),
      }
    );

    if (ExpiringInvitejob.id) {
      await prisma.organizationInvite.update({
        where: {
          id: invite.id,
        },
        data: {
          expiredJobId: ExpiringInvitejob.id,
        },
      });
    }

    // check if user which the invite is suppose to be sent too, is already registered user or not registered

    const checkIfInvitedUserIsRegistered = await prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    const inviteLink = checkIfInvitedUserIsRegistered
      ? `${config.frontendUrls.baseUrl}/invite/accept?token=${token}&organizationId=${data.organizationId}`
      : `${config.frontendUrls.baseUrl}/signup?inviteToken=${token}&organizationId=${data.organizationId}`;

    const html = OrganizationInviteEmail({
      inviterName: inviter.firstName,
      inviteUrl: inviteLink,
      organizationName: organization.name,
      role: data.role,
    });

    try {
      const emailJob = getEmailQueue();
      await emailJob.add('email', {
        to: data.email,
        subject: `Invitation to join ${organization.name}`,
        body: html,
      });
    } catch (error: any) {
      console.error('Unable to send email');
    }

    return { message: 'Invitation sent successfully' };
  }

  async acceptOrganizationInvite({
    data,
    userId,
  }: {
    userId: User['id'];
    data: IOrganizationMutation['acceptOrganizationInvite'];
  }) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new AppError('Unable to find user', 404);
    }

    const invite = await prisma.organizationInvite.findFirst({
      where: {
        token: data.token,
        expiresAt: { gt: new Date() },
      },
    });

    if (!invite) {
      throw new AppError('Invalid token or expired invite', 400);
    }

    if (invite.status === InviteStatus.ACCEPTED) {
      throw new AppError('Invite has already been accepted', 400);
    }

    if (invite.email !== user.email) {
      throw new AppError(
        "Please check again, this invite isn't meant for you ",
        400
      );
    }

    // check if organization has not exceed their subscription limit of member

    const organization = await prisma.organization.findUnique({
      where: {
        id: invite.organizationId,
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
      throw new AppError('Unable to find organization', 400);
    }

    const packageRecord = await prisma.packageRecord.findFirst({
      where: {
        subscriptionId: subscription.id,
        subscriptionCycleId: subscription.subscriptionCycleId || '',
      },
    });

    if (!packageRecord) {
      throw new AppError('Unable to find subscription package record', 400);
    }

    console.log(subscription.features?.maxWorkers, 'max worker feature');
    console.log('packageRecord', packageRecord.workers);

    if (
      subscription.features?.maxWorkers &&
      packageRecord?.workers >= subscription.features.maxWorkers
    ) {
      throw new AppError(
        'This organization has reached their workers limit for their subscription,' +
          ' please contact organization owner to upgrade their plan',
        400
      );
    }

    const existingUserInOrganization = await prisma.membership.findFirst({
      where: {
        userId: user.id,
        organizationId: organization.id,
      },
    });

    if (existingUserInOrganization) {
      throw new AppError('You have already been added to organization', 400);
    }

    if (invite.role === MembershipRole.OWNER) {
      throw new AppError(
        'Sorry you can not be added to this organization as ROLE of OWNER, Please contact organization owner',
        400
      );
    }

    // add user has member to the organization, if they are still under their subscription limit
    await prisma.membership.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: invite.role,
      },
    });

    // update their package record
    await prisma.packageRecord.update({
      where: {
        id: packageRecord.id,
      },
      data: {
        workers: { increment: 1 },
      },
    });

    await prisma.organizationInvite.update({
      where: {
        id: invite.id,
      },
      data: {
        status: InviteStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    });

    // cancel expiring invite job

    if (invite.expiredJobId) {
      const expiringInviteJob = getExpiringInviteQueue();
      const job = await expiringInviteJob.getJob(invite.expiredJobId);
      if (job) {
        await job.remove();
      }

      await prisma.organizationInvite.update({
        where: {
          id: invite.id,
        },
        data: {
          expiredJobId: null,
        },
      });
    }

    return {
      message: `You have been added to ${organization.name} organization`,
    };
  }

  async removeMemberFromOrganization({
    userId,
    data,
  }: {
    userId: User['id'];
    data: IOrganizationMutation['removeMemberFromOrganization'];
  }) {
    const organization = await prisma.organization.findUnique({
      where: {
        id: data.organizationId,
      },
    });

    if (!organization) {
      throw new AppError('Unable to find organization', 404);
    }

    // check if memeber, you are trying to remove existing in organization

    const member = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: data.memberId,
          organizationId: data.organizationId,
        },
      },
    });

    if (!member) {
      throw new AppError(
        'member you are trying to remove, does not exist in this organization,Please check again',
        400
      );
    }

    if (member.role === MembershipRole.OWNER) {
      throw new AppError("You can't remove Owner of organization", 400);
    }

    await prisma.membership.delete({
      where: {
        id: member.id,
      },
    });

    return {
      message: 'Member has been remove from organization successfully!',
    };
  }

  async updateMemberOrganizationRole({
    data,
  }: {
    data: IOrganizationMutation['updateMemberOrganizationRole'];
  }) {
    const organization = await prisma.organization.findUnique({
      where: {
        id: data.organizationId,
      },
    });

    const member = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: data.memberId,
          organizationId: data.organizationId,
        },
      },
    });

    if (!member) {
      throw new AppError('member does not belong to this organization', 400);
    }

    if (data.role === MembershipRole.OWNER) {
      throw new AppError(
        "You can't update member role to owner,there can only be one owner ",
        400
      );
    }

    if (member.role === data.role) {
      throw new AppError(
        'Member already assigned role, you can only updated to different Role',
        400
      );
    }

    if (member.role === MembershipRole.OWNER) {
      throw new AppError("You can't Update Owner of organization Role", 400);
    }

    const updateMemberRole = await prisma.membership.update({
      where: {
        id: member.id,
      },
      data: {
        role: data.role,
      },
    });

    if (!updateMemberRole) {
      throw new AppError('Unable to update member role at the moment', 400);
    }

    return {
      message: 'Member role has been updated',
    };
  }

  async getOrganizationMembers({
    data,
    userId,
    organizationId,
  }: {
    userId: User['id'];
    data: IOrganizationQuery['getOrganizationMember'];
    organizationId: Organization['id'];
  }) {
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      throw new AppError('Unable to find organization', 404);
    }

    const member = await prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!member) {
      throw new AppError(
        "You can't get the list of members for an organization, you don't belong too",
        400
      );
    }
    console.log(data);

    const where = {
      organizationId,
      ...(data.name && {
        user: {
          OR: [
            {
              firstName: {
                contains: data.name,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              lastName: {
                contains: data.name,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        },
      }),
    };

    const page = data.page || 1;
    const take = data.limit || 10;
    const skip = (page - 1) * take;

    const totalCount = await prisma.membership.count({
      where,
    });

    const totalPages = Math.ceil(totalCount / take);

    const memberList = await prisma.membership.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      data: memberList,
      currentPage: page,
      totalCount,
      totalPages,
    };
  }
}
