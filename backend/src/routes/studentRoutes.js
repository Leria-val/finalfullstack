const { Router } = require('express');
const {
  createStudent,
  listStudents,
  getStudenById,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = Router();

router.use(authMiddleware);
router.post('/', roleMiddleware(['admin']), createStudent);
router.get('/:Id', roleMiddleware(['admin', 'teacher']), listStudents);
router.get('/:Id', roleMiddleware(['admin', 'teacher']), getStudenById);
router.put('/:Id', roleMiddleware(['admin', 'teacher']), updateStudent);
router.delete('/:Id', roleMiddleware (['admin']), deleteStudent);

module.exports = router;
