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
