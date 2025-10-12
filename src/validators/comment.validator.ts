import Joi, { ObjectSchema } from 'joi';
import { ICommentMutation } from '../interfaces/interface';

export const createCommentValidators = async (
  reqBody: ICommentMutation['create']
): Promise<ICommentMutation['create']> => {
  const validators: ObjectSchema<ICommentMutation['create']> = Joi.object({
    content: Joi.string().required(),
    taskId: Joi.string().required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const updateCommentValidator = async (
  reqBody: ICommentMutation['update']
): Promise<ICommentMutation['update']> => {
  const validators: ObjectSchema<ICommentMutation['update']> = Joi.object({
    content: Joi.string().required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};
