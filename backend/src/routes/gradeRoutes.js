import { Router } from 'express';
import { gradeController } from '../controllers/gradeController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = Router();

// Todas as rotas de nota exigem login
router.use(authMiddleware);

// Professor: Pode lançar e atualizar notas
router.post('/', roleMiddleware('TEACHER'), gradeController.launch);
router.put('/:id', roleMiddleware('TEACHER'), gradeController.update);

// Aluno: Pode ver suas próprias notas | Admin/Teacher: Podem ver todas
router.get('/my-grades', gradeController.getStudentGrades); 

// Geral: Buscar uma nota específica por ID
router.get('/:id', gradeController.getById);

export default router;