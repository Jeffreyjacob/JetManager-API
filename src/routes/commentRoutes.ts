import { Router } from 'express';
import { Protect } from '../middlewares/authMiddleware';
import { CommentControler } from '../controllers/commentController';

const commentRoute = Router();

/**
 * @openapi
 * /api/v1/comment/create:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comment]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentRequest'
 *     responses:
 *       200:
 *         description: Your comment has been created!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateCommentResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
commentRoute
  .route('/create')
  .post(Protect, CommentControler.createCommentController);

/**
 * @openapi
 * /api/v1/comment/update/{commentId}:
 *   put:
 *     summary: Updating comment
 *     tags: [Comment]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Id of the comment, you are trying to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCommentRequest'
 *     responses:
 *       200:
 *         description: Your comment has been updated successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateCommentResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
commentRoute
  .route('/update/:commentId')
  .put(Protect, CommentControler.updateCommentController);

/**
 * @openapi
 * /api/v1/comment/{commentId}:
 *   delete:
 *     summary: Deleting comment
 *     tags: [Comment]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: comment has been deleted successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteCommentResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
commentRoute
  .route('/:commentId')
  .delete(Protect, CommentControler.deleteCommentController);

export default commentRoute;
