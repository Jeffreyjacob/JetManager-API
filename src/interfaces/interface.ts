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
}

export interface IUserQuery {}
