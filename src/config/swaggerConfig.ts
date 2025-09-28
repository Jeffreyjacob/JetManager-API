export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'JetManager API',
    version: '1.0.0',
    description: 'API documentation for JetManager API',
  },
  servers: [
    {
      url: 'http://localhost:8000',
      description: 'Local server',
    },
  ],
  components: {
    schemas: {
      RegisterUserRequest: {
        type: 'object',
        required: ['email', 'firstName', 'lastName', 'password', 'country'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'test@example.com',
          },
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'secret1234',
          },
          country: {
            type: 'string',
            example: 'United States',
          },
          phone: {
            type: 'string',
            example: '+1 555 123 4567',
          },
        },
      },
      RegisterUserResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'User registered successfully' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Something went wrong' },
          status: { type: 'integer', example: 400 },
        },
      },
    },
  },
};

export const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', "'./src/routes/*.js'"],
};
