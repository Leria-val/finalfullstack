import { Router } from 'express';
import { gradeController } from '../controllers/gradeController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = Router();

// Todas as rotas de nota exigem login
router.use(authMiddleware);

router.post('/', roleMiddleware('TEACHER'), gradeController.create); 
router.get('/:id', gradeController.getById);
router.put('/:id', roleMiddleware('TEACHER'), gradeController.update);
router.delete('/:id', roleMiddleware('TEACHER'), gradeController.delete);

// Aluno: Pode ver suas próprias notas | Admin/Teacher: Podem ver todas
router.get('/my-grades', gradeController.getAll); 
//router.get('/', gradeController.getAll);


export default router;