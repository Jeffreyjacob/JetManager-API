import Joi, { ObjectSchema } from 'joi';
import { IProjectMutation, IProjectQuery } from '../interfaces/interface';
import { Project } from '@prisma/client';

export const createProjectValidators = async (
  reqBody: IProjectMutation['create']
): Promise<IProjectMutation['create']> => {
  const validators: ObjectSchema<IProjectMutation['create']> = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    organizationId: Joi.string().required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const updateProjectValidators = async (
  reqBody: IProjectMutation['update']
): Promise<IProjectMutation['update']> => {
  const validators: ObjectSchema<IProjectMutation['update']> = Joi.object({
    name: Joi.optional(),
    description: Joi.optional(),
    organizationId: Joi.string().required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const getProjectbyOrganizationValidator = async (
  reqBody: IProjectQuery['getProjectByOrganization']
): Promise<IProjectQuery['getProjectByOrganization']> => {
  const validators: ObjectSchema<IProjectQuery['getProjectByOrganization']> =
    Joi.object({
      name: Joi.string().optional(),
      organizationId: Joi.string().required(),
    });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const deleteProjectValidator = async (reqBody: {
  projectId: Project['id'];
}): Promise<{ projectId: Project['id'] }> => {
  const validators: ObjectSchema<{ projectId: Project['id'] }> = Joi.object({
    projectId: Joi.string().required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};
