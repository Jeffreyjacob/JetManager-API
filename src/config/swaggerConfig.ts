import {
  SubscriptionDuration,
  Plans,
  MembershipRole,
  TaskStatus,
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
            type: 'object',
            example: "{id:'organizationId',name:'organizationName'}",
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
      CreateProjectRequest: {
        type: 'object',
        required: ['name', 'description', 'organizationId'],
        properties: {
          name: {
            type: 'string',
            example: 'Project Name',
          },
          description: {
            type: 'string',
            example: 'Project Description',
          },
          organizationId: {
            type: 'string',
            example: 'Organization Id',
          },
        },
      },
      CreateProjectResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Project has been created successfully!',
          },
        },
      },
      UpdateProjectRequest: {
        type: 'object',
        required: ['organizationId'],
        properties: {
          name: {
            type: 'string',
            example: 'Project Name',
          },
          description: {
            type: 'string',
            example: 'Project description',
          },
          organizationId: {
            type: 'string',
            example: 'Organization Id',
          },
        },
      },
      UpdateProjectResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'object',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Your Project has been updated successfully!',
          },
        },
      },
      GetProjectByOrganizationResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'array',
            example:
              "[{id:'projectid',name:'project name',description:'project description'}]",
          },
        },
      },
      GetProjectById: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            example:
              "{id:'projectId',name:'project name',description:'project description'}",
          },
        },
      },
      DeleteProjectResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Your project has been deleted!',
          },
        },
      },
      CreateTaskRequest: {
        type: 'object',
        required: ['title', 'projectId', 'organizationId', 'duration'],
        properties: {
          title: {
            type: 'string',
            example: 'Task title',
          },
          description: {
            type: 'string',
            example: 'Task description',
          },
          status: {
            type: 'string',
            enum: Object.values(TaskStatus),
            example: `TO_DO PROGRESS DONE`,
          },
          projectId: {
            type: 'string',
            example: 'project id',
          },
          assignedTo: {
            type: 'string',
            example: 'Assigned User',
          },
          dueDate: {
            type: 'string',
            example: 'due Date',
          },
          duration: {
            type: 'integer',
            example: 4,
          },
          organizationId: {
            type: 'string',
            example: 'organizationid',
          },
        },
      },
      CreateTaskResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Task created successfully',
          },
        },
      },
      UpdateTaskRequest: {
        type: 'object',
        required: ['organizationId'],
        properties: {
          title: {
            type: 'string',
            example: 'Task title',
          },
          description: {
            type: 'string',
            example: 'Task description',
          },
          projectId: {
            type: 'string',
            example: 'project id',
          },
          assignedTo: {
            type: 'string',
            example: 'Assigned User',
          },
          dueDate: {
            type: 'string',
            example: 'due Date',
          },
          duration: {
            type: 'integer',
            example: 4,
          },
          organizationId: {
            type: 'string',
            example: 'organizationid',
          },
        },
      },
      UpdateTaskResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Task updated successfully',
          },
        },
      },
      UpdateTaskStatusRequest: {
        type: 'object',
        required: ['status', 'organizationId'],
        properties: {
          status: {
            type: 'string',
            enum: Object.values(TaskStatus),
            example: `TO_DO PROGRESS DONE`,
          },
          organizationId: {
            type: 'string',
            example: 'organizationid',
          },
        },
      },
      UpdateTaskStatusResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Task status updated successfully',
          },
        },
      },
      GetTaskByProductResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'array',
            example:
              "[{id:'task id',title:'task title',description:'task description'}]",
          },
          currentPage: {
            type: 'integer',
            exmaple: 1,
          },
          totalPages: {
            type: 'integer',
            example: 10,
          },
          totalCount: {
            type: 'integer',
            example: 20,
          },
        },
      },
      GetTaskByIdResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            example:
              "{id:'taskId',name:'taskName',description:'task description'}",
          },
        },
      },
      DeleteTaskResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'task has been deleted',
          },
        },
      },
      CreateCommentRequest: {
        type: 'object',
        required: ['content', 'taskId', 'userId'],
        properties: {
          content: {
            type: 'string',
            example: 'Your Comment',
          },
          taskId: {
            type: 'string',
            example: 'Task id',
          },
        },
      },
      CreateCommentResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Comment has been created!',
          },
        },
      },
      UpdateCommentRequest: {
        type: 'object',
        required: ['content'],
        properties: {
          content: {
            type: 'string',
            example: 'Your Comment',
          },
        },
      },
      UpdateCommentResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Comment has been updated!',
          },
        },
      },
      DeleteCommentResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Comment has been deleted!',
          },
        },
      },
      AddAttachmentRequest: {
        type: 'object',
        required: ['taskId', 'organizationId', 'file'],
        properties: {
          taskId: {
            type: 'string',
            example: 'Task id',
          },
          organizationId: {
            type: 'string',
            example: 'organizationId',
          },
          file: {
            type: 'string',
            format: 'binary',
            description: 'File Upload',
          },
        },
      },
      AddAttachmentResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'attachment has been added!',
          },
        },
      },
      RemoveAttachmentRequest: {
        type: 'object',
        required: ['organizationId'],
        properties: {
          organizationId: {
            type: 'string',
            example: 'OrganizationId',
          },
        },
      },
      RemoveAttachmentResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'attachment has been removed!',
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
