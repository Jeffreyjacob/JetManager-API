import { NextFunction, Request, Response } from 'express';
import { CommentServices } from '../services/commentServies';
import { AsyncHandler } from '../utils/asyncHandler';
import {
  createCommentValidators,
  updateCommentValidator,
} from '../validators/comment.validator';

export class CommentControler {
  private static commentService = new CommentServices();

  static createCommentController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validatedBody = await createCommentValidators(req.body);

      const result = await CommentControler.commentService.createComment({
        data: validatedBody,
        userId: req.user.id,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static updateCommentController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const commentId = req.params.commentId;
      const validatedBody = await updateCommentValidator(req.body);

      const result = await CommentControler.commentService.updateComment({
        data: validatedBody,
        commentId,
        userId: req.user.id,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  static deleteCommentController = AsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const commentId = req.params.commentId;

      const result = await CommentControler.commentService.deleteComment({
        commentId,
        userId: req.user.id,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    }
  );
}
