import { Router } from 'express';
import { Protect } from '../middlewares/authMiddleware';
import { ProjectController } from '../controllers/projectController';

const projectRoute = Router();

projectRoute
  .route('/create')
  .post(Protect, ProjectController.CreateProjectController);

export default projectRoute;
