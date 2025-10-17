import Joi, { ObjectSchema } from 'joi';
import { IUserMutation } from '../interfaces/interface';
import { countriesISO } from '../utils/countryIso';

const validCountries = countriesISO.map((c) => c.name);

export const registerValidators = async (
  reBody: IUserMutation['register']
): Promise<IUserMutation['register']> => {
  const validators: ObjectSchema<IUserMutation['register']> = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().lowercase().required(),
    password: Joi.string().required(),
    country: Joi.string()
      .valid(...validCountries)
      .required(),
    phone: Joi.string().optional(),
  });

  return validators.validateAsync(reBody, { abortEarly: false });
};

export const verifyEmailValidators = async (
  reqBody: IUserMutation['verifyEmail']
): Promise<IUserMutation['verifyEmail']> => {
  const validators: ObjectSchema<IUserMutation['verifyEmail']> = Joi.object({
    email: Joi.string().lowercase().required(),
    otp: Joi.number().required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const loginValidators = async (
  reqBody: IUserMutation['login']
): Promise<IUserMutation['login']> => {
  const validators: ObjectSchema<IUserMutation['login']> = Joi.object({
    email: Joi.string().lowercase().required(),
    password: Joi.string().min(6).required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const resendEmailOtpValidators = async (
  reqBody: IUserMutation['resendEmail']
) => {
  const validators: ObjectSchema<IUserMutation['resendEmail']> = Joi.object({
    email: Joi.string().lowercase().required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const forgetPasswordValidators = async (
  reqBody: IUserMutation['forgetPassword']
): Promise<IUserMutation['forgetPassword']> => {
  const validators: ObjectSchema<IUserMutation['forgetPassword']> = Joi.object({
    email: Joi.string().required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};

export const resetPasswordValidators = async (
  reqBody: IUserMutation['resetPassword']
): Promise<IUserMutation['resetPassword']> => {
  const validators: ObjectSchema<IUserMutation['resetPassword']> = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
  });

  return validators.validateAsync(reqBody, { abortEarly: false });
};
