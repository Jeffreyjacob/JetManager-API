import Joi, { ObjectSchema } from 'joi';
import { ITaskMutation, ITaskQuery } from '../interfaces/interface';
import { TaskStatus } from '../generated/prisma';

export const createTaskValidators = async (
  reqBody: ITaskMutation['create']
): Promise<ITaskMutation['create']> => {
  const validators: ObjectSchema<ITaskMutation['create']> = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    status: Joi.string()
      .valid(...Object.values(TaskStatus))
      .optional(),
    projectId: Joi.string().required(),
    assignedTo: Joi.string().optional(),
    dueDate: Joi.string().optional(),
    duration: Joi.number().required(),
    organizationId: Joi.string().required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const updateTaskValidators = async (
  reqBody: ITaskMutation['update']
): Promise<ITaskMutation['update']> => {
  const validators: ObjectSchema<ITaskMutation['update']> = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    assignedTo: Joi.string().optional(),
    dueDate: Joi.string().optional(),
    duration: Joi.number().optional(),
    organizationId: Joi.string().required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const updateStatusValidators = async (
  reqBody: ITaskMutation['updateStatus']
): Promise<ITaskMutation['updateStatus']> => {
  const validators: ObjectSchema<ITaskMutation['updateStatus']> = Joi.object({
    status: Joi.string()
      .valid(...Object.values(TaskStatus))
      .required(),
    organizationId: Joi.string().required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const getTaskByProjectIdValidators = async (
  reqBody: ITaskQuery['getTasks']
): Promise<ITaskQuery['getTasks']> => {
  const validators: ObjectSchema<ITaskQuery['getTasks']> = Joi.object({
    status: Joi.string()
      .valid(...Object.values(TaskStatus))
      .optional(),
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const addAttachmentValidators = async (
  reqBody: ITaskMutation['addAttachment']
): Promise<ITaskMutation['addAttachment']> => {
  const validators: ObjectSchema<ITaskMutation['addAttachment']> = Joi.object({
    fileUrl: Joi.string().required(),
    taskId: Joi.string().required(),
    organizationId: Joi.string().required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const removeAttachmentValidators = async (
  reqBody: ITaskMutation['removeAttachment']
): Promise<ITaskMutation['removeAttachment']> => {
  const validators: ObjectSchema<ITaskMutation['removeAttachment']> =
    Joi.object({
      organizationId: Joi.string().required(),
    });

  return validators.validateAsync(reqBody, { abortEarly: false });
};
