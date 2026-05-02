import { Router } from 'express';
import studentController  from '../controllers/studentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = Router();
router.use(authMiddleware);

router.post('/', 
  roleMiddleware('ADMIN'), 
  studentController.create
);

router.get('/', 
  roleMiddleware(['ADMIN', 'TEACHER']), 
  studentController.getAll
);

router.get('/:id', 
  roleMiddleware(['ADMIN', 'TEACHER']), 
  studentController.getById
);

router.put('/:id', 
  roleMiddleware('ADMIN'), 
  studentController.update
);

router.delete('/:id', 
  roleMiddleware('ADMIN'), 
  studentController.delete
);

export default router;
