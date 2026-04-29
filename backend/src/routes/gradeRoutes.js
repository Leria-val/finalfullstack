const { Router } = require('express');
const {
    createGrade,
    listGrades,
    getGradeById,
    updateGrade,
    deleteGrade,
} = require('../controllers/gradeController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = Router();

router.use(authMiddleware)
router.post('/', createGrade);
router.get('/', listGrades);
router.get('/:id', getGradeById);
router.put('/:id', updateGrade);
router.delete('/:id', deleteGrade);

module.exports = router;