import { Router } from 'express';
import { Protect } from '../middlewares/authMiddleware';
import { TaskController } from '../controllers/taskController';

const taskRoute = Router();

/**
 * @openapi
 * /api/v1/task/create:
 *   post:
 *     summary: Create a new task
 *     tags: [Task]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       200:
 *         description: Your task has been created successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateTaskResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
taskRoute.route('/create').post(Protect, TaskController.createTaskController);

/**
 * @openapi
 * /api/v1/task/update/{taskId}:
 *   put:
 *     summary: Updating existing Task
 *     tags: [Task]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Id of the task, you are trying to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *     responses:
 *       200:
 *         description: Your task has been updated successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateTaskResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
taskRoute
  .route('/update/:taskId')
  .put(Protect, TaskController.updateTaskController);

taskRoute
  .route('/update/status/:taskId')
  .put(Protect, TaskController.updateTaskStatusController);

export default taskRoute;
