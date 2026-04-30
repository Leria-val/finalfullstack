const { Op } = require('sequelize');
const Grade = require('../models/Grade');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Class = require('../models/Class');
const User = require('../models/User');
const { formatGradeResponse } = require('../utils/dataFormatter');

const getStudentFromUser = async (userId) => {
  return Student.findOne({ where: { userId } });
};

const createGrade = async (req, res) => {
  try {
    const { role, id: teacherId } = req.user;

    if (role !== 'teacher' && role !== 'admin') {
      return res.status(403).json({ message: 'Apenas professores podem lançar notas.' });
    }

    const { enrollmentId, value, period, description } = req.body;

    const enrollment = await Enrollment.findByPk(enrollmentId, {
      include: [{ model: Class, as: 'class' }],
    });
    if (!enrollment) {
      return res.status(404).json({ message: 'Matrícula não encontrada.' });
    }

    if (role === 'teacher' && enrollment.class.teacherId !== teacherId) {
      return res.status(403).json({ message: 'Você não leciona nesta turma.' });
    }

    if (value < 0 || value > 10) {
      return res.status(400).json({ message: 'Nota deve ser entre 0 e 10.' });
    }

    const grade = await Grade.create({ enrollmentId, teacherId, value, period, description });

    const full = await Grade.findByPk(grade.id, {
      include: [
        {
          model: Enrollment,
          as: 'enrollment',
          include: [
            { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
            { model: Class, as: 'class', attributes: ['id', 'name', 'subject'] },
          ],
        },
      ],
    });

    return res.status(201).json({
      message: 'Nota lançada com sucesso.',
      grade: formatGradeResponse(full),
    });
  } catch (error) {
    console.error('[createGrade]', error);
    return res.status(500).json({ message: 'Erro interno ao lançar nota.' });
  }
};

const listGrades = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const {
      studentName,
      subject,
      period,
      minValue,
      maxValue,
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      order = 'DESC',
    } = req.query;

    const gradeWhere = {};
    const classWhere = {};
    const userWhere = {};

    if (period) gradeWhere.period = { [Op.iLike]: `%${period}%` };
    if (minValue !== undefined || maxValue !== undefined) {
      gradeWhere.value = {};
      if (minValue !== undefined) gradeWhere.value[Op.gte] = parseFloat(minValue);
      if (maxValue !== undefined) gradeWhere.value[Op.lte] = parseFloat(maxValue);
    }
    if (subject) classWhere.name = { [Op.iLike]: `%${subject}%` };

    let enrollmentWhere = {};

    if (role === 'student') {
      const student = await getStudentFromUser(userId);
      if (!student) return res.status(404).json({ message: 'Perfil de aluno não encontrado.' });
      enrollmentWhere.studentId = student.id;

    } else if (role === 'teacher') {
      gradeWhere.teacherId = userId;
      if (studentName) userWhere.name = { [Op.iLike]: `%${studentName}%` };

    } else {
      if (studentName) userWhere.name = { [Op.iLike]: `%${studentName}%` };
    }

    const allowedOrderFields = ['value', 'period', 'createdAt'];
    const safeOrderBy = allowedOrderFields.includes(orderBy) ? orderBy : 'createdAt';
    const safeOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: grades, count: total } = await Grade.findAndCountAll({
      where: gradeWhere,
      include: [
        {
          model: Enrollment,
          as: 'enrollment',
          where: Object.keys(enrollmentWhere).length ? enrollmentWhere : undefined,
          required: true,
          include: [
            {
              model: Student,
              as: 'student',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'name', 'email'],
                  where: Object.keys(userWhere).length ? userWhere : undefined,
                  required: Object.keys(userWhere).length > 0,
                },
              ],
            },
            {
              model: Class,
              as: 'class',
              attributes: ['id', 'name', 'subject'],
              where: Object.keys(classWhere).length ? classWhere : undefined,
              required: Object.keys(classWhere).length > 0,
            },
          ],
        },
      ],
      order: [[safeOrderBy, safeOrder]],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    return res.status(200).json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      grades: grades.map(formatGradeResponse),
    });
  } catch (error) {
    console.error('[listGrades]', error);
    return res.status(500).json({ message: 'Erro interno ao listar notas.' });
  }
};

const getGradeById = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    const grade = await Grade.findByPk(req.params.id, {
      include: [
        {
          model: Enrollment,
          as: 'enrollment',
          include: [
            { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
            { model: Class, as: 'class', attributes: ['id', 'name', 'subject'] },
          ],
        },
      ],
    });

    if (!grade) return res.status(404).json({ message: 'Nota não encontrada.' });

    // Aluno só pode ver a própria nota
    if (role === 'student') {
      const student = await getStudentFromUser(userId);
      if (!student || grade.enrollment.studentId !== student.id) {
        return res.status(403).json({ message: 'Acesso negado.' });
      }
    }

    return res.status(200).json({ grade: formatGradeResponse(grade) });
  } catch (error) {
    console.error('[getGradeById]', error);
    return res.status(500).json({ message: 'Erro interno ao buscar nota.' });
  }
};

const updateGrade = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    if (role !== 'teacher' && role !== 'admin') {
      return res.status(403).json({ message: 'Apenas professores podem editar notas.' });
    }

    const grade = await Grade.findByPk(req.params.id);
    if (!grade) return res.status(404).json({ message: 'Nota não encontrada.' });

    if (role === 'teacher' && grade.teacherId !== userId) {
      return res.status(403).json({ message: 'Você não pode editar notas de outro professor.' });
    }

    const { value, period, description } = req.body;

    if (value !== undefined && (value < 0 || value > 10)) {
      return res.status(400).json({ message: 'Nota deve ser entre 0 e 10.' });
    }

    await grade.update({ value, period, description });

    return res.status(200).json({
      message: 'Nota atualizada com sucesso.',
      grade: formatGradeResponse(grade),
    });
  } catch (error) {
    console.error('[updateGrade]', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar nota.' });
  }
};

const deleteGrade = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    if (role !== 'teacher' && role !== 'admin') {
      return res.status(403).json({ message: 'Apenas professores podem remover notas.' });
    }

    const grade = await Grade.findByPk(req.params.id);
    if (!grade) return res.status(404).json({ message: 'Nota não encontrada.' });

    if (role === 'teacher' && grade.teacherId !== userId) {
      return res.status(403).json({ message: 'Você não pode remover notas de outro professor.' });
    }

    await grade.destroy();
    return res.status(200).json({ message: 'Nota removida com sucesso.' });
  } catch (error) {
    console.error('[deleteGrade]', error);
    return res.status(500).json({ message: 'Erro interno ao remover nota.' });
  }
};

module.exports = { createGrade, listGrades, getGradeById, updateGrade, deleteGrade };