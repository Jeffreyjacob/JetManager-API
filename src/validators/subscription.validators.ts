import Joi, { ObjectSchema } from 'joi';
import {
  ISubscriptionMutation,
  SubscriptionSwitchEnum,
} from '../interfaces/interface';
import { Plans, SubscriptionDuration } from '../generated/prisma';

export const cancelSubscriptionValidators = async (
  reqBody: ISubscriptionMutation['cancelSubscription']
): Promise<ISubscriptionMutation['cancelSubscription']> => {
  const validators: ObjectSchema<ISubscriptionMutation['cancelSubscription']> =
    Joi.object({
      organizationId: Joi.string().required(),
      cancellationReason: Joi.string().optional(),
    });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const resumeSubscriptionValidators = async (
  reqBody: ISubscriptionMutation['resumeSubscription']
): Promise<ISubscriptionMutation['resumeSubscription']> => {
  const validators: ObjectSchema<ISubscriptionMutation['resumeSubscription']> =
    Joi.object({
      organizationId: Joi.string().required(),
    });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const restartSubscriptionValidators = async (
  reqBody: ISubscriptionMutation['restartSubscription']
): Promise<ISubscriptionMutation['restartSubscription']> => {
  const validators: ObjectSchema<ISubscriptionMutation['restartSubscription']> =
    Joi.object({
      organizationId: Joi.string().required(),
      subscriptionDuration: Joi.string()
        .valid(...Object.values(SubscriptionDuration))
        .required(),
      subscriptionType: Joi.string()
        .valid(...Object.values(Plans))
        .required(),
    });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const changeSubscriptionValidators = async (
  reqBody: ISubscriptionMutation['changeSubscriptionPlan']
): Promise<ISubscriptionMutation['changeSubscriptionPlan']> => {
  const validators: ObjectSchema<
    ISubscriptionMutation['changeSubscriptionPlan']
  > = Joi.object({
    organizationId: Joi.string().required(),
    when: Joi.string()
      .valid(...Object.values(SubscriptionSwitchEnum))
      .required(),
    subscriptionDuration: Joi.string()
      .valid(...Object.values(SubscriptionDuration))
      .required(),
    subscriptionType: Joi.string()
      .valid(...Object.values(Plans))
      .required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};
