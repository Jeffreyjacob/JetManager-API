import Joi, { ObjectSchema } from 'joi';
import {
  IOrganizationMutation,
  IOrganizationQuery,
} from '../interfaces/interface';
import {
  SubscriptionDuration,
  Plans,
  MembershipRole,
} from '../generated/prisma';

export const createOrganizationValidator = async (
  reqBody: IOrganizationMutation['create']
): Promise<IOrganizationMutation['create']> => {
  const validator: ObjectSchema<IOrganizationMutation['create']> = Joi.object({
    name: Joi.string().required(),
    subscriptionDuration: Joi.string()
      .valid(...Object.keys(SubscriptionDuration))
      .required(),
    subscriptionType: Joi.string()
      .valid(...Object.keys(Plans))
      .required(),
  });

  return validator.validateAsync(reqBody, { abortEarly: false });
};

export const sendOrganizationInviteValidator = async (
  reqBody: IOrganizationMutation['sendOrganizationalInvite']
): Promise<IOrganizationMutation['sendOrganizationalInvite']> => {
  const validators: ObjectSchema<
    IOrganizationMutation['sendOrganizationalInvite']
  > = Joi.object({
    email: Joi.string().lowercase().required(),
    role: Joi.string()
      .valid(...Object.keys(MembershipRole))
      .required(),
    organizationId: Joi.string().required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const acceptOrganizationInviteValidator = async (
  reqBody: IOrganizationMutation['acceptOrganizationInvite']
): Promise<IOrganizationMutation['acceptOrganizationInvite']> => {
  const validator: ObjectSchema<
    IOrganizationMutation['acceptOrganizationInvite']
  > = Joi.object({
    token: Joi.string().required(),
    organizationId: Joi.string().required(),
  });

  return validator.validateAsync(reqBody, { abortEarly: false });
};

export const removeMemberFromOrganizationValidator = async (
  reqBody: IOrganizationMutation['removeMemberFromOrganization']
): Promise<IOrganizationMutation['removeMemberFromOrganization']> => {
  const validator: ObjectSchema<
    IOrganizationMutation['removeMemberFromOrganization']
  > = Joi.object({
    memberId: Joi.string().required(),
    organizationId: Joi.string().required(),
  });

  return validator.validateAsync(reqBody, { abortEarly: false });
};

export const updateMemberOrganizationRoleValidators = async (
  reqBody: IOrganizationMutation['updateMemberOrganizationRole']
): Promise<IOrganizationMutation['updateMemberOrganizationRole']> => {
  const validators: ObjectSchema<
    IOrganizationMutation['updateMemberOrganizationRole']
  > = Joi.object({
    memberId: Joi.string().required(),
    role: Joi.string()
      .valid(...Object.keys(MembershipRole))
      .required(),
    organizationId: Joi.string().required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const getOrganizationMemberValidator = async (
  reqBody: IOrganizationQuery['getOrganizationMember']
): Promise<IOrganizationQuery['getOrganizationMember']> => {
  const validators: ObjectSchema<IOrganizationQuery['getOrganizationMember']> =
    Joi.object({
      name: Joi.string().optional(),
      page: Joi.number().min(1).optional(),
      limit: Joi.number().min(1).optional(),
    });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const getAllOrganizationValidator = async (
  reqBody: IOrganizationQuery['getAllOrganization']
): Promise<IOrganizationQuery['getAllOrganization']> => {
  const validator: ObjectSchema<IOrganizationQuery['getAllOrganization']> =
    Joi.object({
      search: Joi.string().optional(),
      page: Joi.number().min(1).optional(),
      limit: Joi.number().min(1).optional(),
    });

  return validator.validateAsync(reqBody, { abortEarly: false });
};
