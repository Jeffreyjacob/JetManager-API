import { Router } from 'express';
import { Protect } from '../middlewares/authMiddleware';
import { ProjectController } from '../controllers/projectController';

const projectRoute = Router();

/**
 * @openapi
 * /api/v1/project/create:
 *   post:
 *     summary: Create a new Project
 *     tags: [Project]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       200:
 *         description: Your Project has been created successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateProjectResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
projectRoute
  .route('/create')
  .post(Protect, ProjectController.CreateProjectController);

/**
 * @openapi
 * /api/v1/project/{orgId}:
 *   get:
 *     summary: Get all projects in an organization.
 *     description: Retrieve all project in particular organization.
 *     tags: [Project]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the organization
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 *         description: search name filter for project
 *     responses:
 *       200:
 *         description: Projects fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetProjectByOrganizationResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
projectRoute
  .route('/:orgId')
  .get(Protect, ProjectController.getProjectByOrganizationIdController);

/**
 * @openapi
 * /api/v1/project/update/{projectId}:
 *   put:
 *     summary: Updating existing Project
 *     tags: [Project]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Id of the project, you are trying to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectRequest'
 *     responses:
 *       200:
 *         description: Your project has been updated successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateProjectResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
projectRoute
  .route('/update/:projectId')
  .put(Protect, ProjectController.updateProjectController);

/**
 * @openapi
 * /api/v1/project/{projectId}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Project]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetProjectById'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
projectRoute
  .route('/:projectId')
  .get(Protect, ProjectController.getProjectByIdController);

/**
 * @openapi
 * /api/v1/project/{projectId}:
 *   delete:
 *     summary: Deleting Project
 *     tags: [Project]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *     responses:
 *       200:
 *         description: Project has been deleted successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteProjectResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
projectRoute
  .route('/:projectId')
  .delete(Protect, ProjectController.deleteProject);

export default projectRoute;
