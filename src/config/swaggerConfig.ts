import {
  SubscriptionDuration,
  Plans,
  MembershipRole,
} from '../generated/prisma';

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
    securitySchemes: {
      AccessToken: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
      },
      RefreshToken: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
      },
    },
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
      VerifyEmailRequest: {
        type: 'object',
        required: ['email', 'otp'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'test@example.com',
          },
          otp: {
            type: 'integer',
            example: 123456,
          },
        },
      },
      VerifyEmailResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'User Email has been verified!' },
        },
      },
      ResendEmailOTPRequest: {
        type: 'object',
        required: ['eamil'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'test@example.com',
          },
        },
      },
      ResendEmailResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example: 'Otp has been sent, Please check your email!',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'test@example.com',
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'secret1234',
          },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'User login successful!' },
        },
      },
      ForgetPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'test@example.com',
          },
        },
      },
      ForgetPasswordResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example:
              'A link has been sent to your email to reset your password',
          },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['token', 'password'],
        properties: {
          token: {
            type: 'string',
            example: 'err33q3kk343433355',
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'secret1234',
          },
        },
      },
      ResetPasswordResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example: 'User password has been resetted successfully!',
          },
        },
      },
      AuthUserResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '89b-12d3-a456-426614174000' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          country: { type: 'string', example: 'United States' },
          phone: { type: 'string', nullable: true, example: '+1 555 123 4567' },
          organizations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'org-123e4567' },
                name: { type: 'string', example: 'Acme Corp' },
              },
            },
          },
          activies: {
            type: 'array',
            items: {
              type: 'object',
              id: { type: 'string', example: 'act-123e4567' },
              action: { type: 'string', example: 'LOGIN' },
            },
          },
        },
      },
      CreateOrganizationRequest: {
        type: 'object',
        required: ['name', 'subscriptionType', 'subscriptionDuration'],
        properties: {
          name: {
            type: 'string',
            example: 'Jet manager',
          },
          subscriptionType: {
            type: 'string',
            enum: Object.keys(Plans),
            example: 'BASIC, ENTERPRISE, PRO',
          },
          subscriptionDuration: {
            type: 'string',
            enum: Object.keys(SubscriptionDuration),
            example: 'MONTHLY, QUARTERLY, HALFYEAR, YEARLY',
          },
        },
      },
      CreateOrganizationResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example: 'Your organization has been created',
          },
          url: {
            type: 'string',
            format: 'uri',
            example: 'https://stripe/url',
          },
        },
      },
      SendOrganizationInviteRequest: {
        type: 'object',
        required: ['email', 'role', 'organizationId'],
        properties: {
          email: {
            type: 'string',
            example: 'test@example.com',
          },
          role: {
            type: 'string',
            enum: Object.keys(MembershipRole),
            example: 'OWNER, ADMIN , WORKER',
          },
          organizationId: {
            type: 'string',
            example: 'organizationId',
          },
        },
      },
      SendOrganizationInviteResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Invite sent successfully!',
          },
        },
      },
      AcceptOrganizationInviteRequest: {
        type: 'object',
        required: ['token', 'organizationId'],
        properties: {
          token: {
            type: 'string',
            example: '3jjj334343qe',
          },
          organizationId: {
            type: 'string',
            example: 'e55c7aa1-982c-4956-9944-3b908070c00e',
          },
        },
      },
      AcceptOrganizationInvaiteResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'You has been added to organization!',
          },
        },
      },
      RemoveMemberFromOrganizationRequest: {
        type: 'object',
        required: ['memberId', 'organizationId'],
        properties: {
          memberId: {
            type: 'string',
            example: 'memberId',
          },
          organizationId: {
            type: 'string',
            example: 'organizationid',
          },
        },
      },
      RemoveMemberFromOrganizationResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Member has been remove from organization',
          },
        },
      },
      updateMemberOrganizationRoleRequest: {
        type: 'object',
        required: ['memberId', 'role', 'organizationId'],
        properties: {
          memberId: {
            type: 'string',
            example: 'memberId',
          },
          role: {
            type: 'string',
            enum: Object.keys(MembershipRole),
            example: 'OWNER, ADMIN, WORKER',
          },
          organizationId: {
            type: 'string',
            example: 'organizationid',
          },
        },
      },
      updateMemberOrganizationRoleResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Member role has been update successfully!',
          },
        },
      },
      GetOrganizationMemberResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'array',
            example: "[{id:'organizationId',name:'organizationName'}]",
          },
          currentPage: {
            type: 'integer',
            example: 1,
          },
          totalCount: {
            type: 'integer',
            example: 20,
          },
          totalPages: {
            type: 'integer',
            example: 3,
          },
        },
      },
      GetOrganizationByIdResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'array',
            example: "[{id:'organizationId',name:'organizationName'}]",
          },
        },
      },
      GetAllUserOrganizationResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'array',
            example: "[{id:'organizationId',name:'organizationName'}]",
          },
          currentPage: {
            type: 'integer',
            example: 1,
          },
          totalCount: {
            type: 'integer',
            example: 20,
          },
          totalPages: {
            type: 'integer',
            example: 3,
          },
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
