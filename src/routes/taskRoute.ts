import { Router } from 'express';
import { Protect } from '../middlewares/authMiddleware';
import { TaskController } from '../controllers/taskController';
import { MulterUploadFile } from '../middlewares/multer';
import CacheMiddleware, { CacheService } from '../utils/cacheServices';

const taskRoute = Router();

const cacheMiddleware = new CacheMiddleware(new CacheService());

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
taskRoute
  .route('/create')
  .post(
    Protect,
    cacheMiddleware.invalidate('auto:/task'),
    TaskController.createTaskController
  );

/**
 * @openapi
 * /api/v1/task/attachment/add:
 *   post:
 *     summary: Upload an attachment to a task
 *     tags: [Task]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/AddAttachmentRequest'
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddAttachmentResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
taskRoute
  .route('/attachment/add')
  .post(
    Protect,
    cacheMiddleware.invalidate('auto:/task'),
    MulterUploadFile.single('file'),
    TaskController.addAttachment
  );

/**
 * @openapi
 * /api/v1/task/attachment/remove/{attachmentId}:
 *   delete:
 *     summary: removing attachment from task
 *     tags: [Task]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Id of attachment, you are trying to remove
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RemoveAttachmentRequest'
 *     responses:
 *       200:
 *         description: Your attachment has been removed successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RemoveAttachmentResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
taskRoute
  .route('/attachment/remove/:attachmentId')
  .delete(Protect, TaskController.deleteAttachmentController);

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
  .put(
    Protect,
    cacheMiddleware.invalidate('auto:/task'),
    TaskController.updateTaskController
  );

/**
 * @openapi
 * /api/v1/task/update/status/{taskId}:
 *   put:
 *     summary: Updating task status
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
 *             $ref: '#/components/schemas/UpdateTaskStatusRequest'
 *     responses:
 *       200:
 *         description: Your task has been updated successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateTaskStatusResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
taskRoute
  .route('/update/status/:taskId')
  .put(
    Protect,
    cacheMiddleware.invalidate('auto:/task'),
    TaskController.updateTaskStatusController
  );

/**
 * @openapi
 * /api/v1/task/{taskId}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Task]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task
 *     responses:
 *       200:
 *         description: task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetTaskByIdResponse'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
taskRoute
  .route('/:taskId')
  .get(
    Protect,
    cacheMiddleware.invalidate('auto:/task'),
    TaskController.getTaskByIdController
  );

/**
 * @openapi
 * /api/v1/task/{taskId}:
 *   delete:
 *     summary: Deleting Task
 *     tags: [Task]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task
 *     responses:
 *       200:
 *         description: task has been deleted successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteTaskResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
taskRoute
  .route('/:taskId')
  .delete(
    Protect,
    cacheMiddleware.invalidate('auto:/task'),
    TaskController.deleteTask
  );

/**
 * @openapi
 * /api/v1/task/project/{projectId}:
 *   get:
 *     summary: Get tasks by projectId
 *     tags: [Task]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *         description: Task status
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: limit
 *     responses:
 *       200:
 *         description: tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetTaskByProductResponse'
 *       404:
 *         description: task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
taskRoute
  .route('/project/:projectId')
  .get(
    Protect,
    cacheMiddleware.response(300),
    TaskController.getTaskByProjectIdController
  );

export default taskRoute;
