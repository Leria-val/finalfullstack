import { Op } from "sequelize";
import Grade from "../models/Grade.js";
import Enrollment from "../models/Enrollment.js";
import Student from "../models/Student.js";
import Class from "../models/Class.js";
import User from "../models/User.js";
import { formatGradeResponse } from "../utils/dataFormatter.js";

const getStudentFromUser = async (user_id) => {
  return Student.findOne({ where: { user_id } });
};

export const gradeController = {

  create: async (req, res) => {
    try {
      const { role, id: teacher_id } = req.user;

      if (role !== "TEACHER" && role !== "ADMIN") {
        return res.status(403).json({ error: "Apenas professores podem lançar notas." });
      }

      const { enrollment_id, value, period, description } = req.body;

      if (!enrollment_id || value === undefined || !period) {
        return res.status(400).json({ error: "enrollment_id, value e period são obrigatórios." });
      }

      const enrollment = await Enrollment.findByPk(enrollment_id, {
        include: [{ model: Class, as: "class" }],
      });
      if (!enrollment) {
        return res.status(404).json({ error: "Matrícula não encontrada." });
      }

      if (role === "TEACHER" && enrollment.class.teacher_id !== teacher_id) {
        return res.status(403).json({ error: "Você não leciona nesta turma." });
      }

      if (value < 0 || value > 10) {
        return res.status(400).json({ error: "Nota deve ser entre 0 e 10." });
      }

      const grade = await Grade.create({ 
        enrollment_id, 
        teacher_id, 
        value, 
        period, 
        description 
      });

      const full = await Grade.findByPk(grade.id, {
        include: [{
          model: Enrollment,
          as: "enrollment",
          include: [
            {
              model: Student,
              as: "student",
              include: [{ model: User, as: "authInfo", attributes: ["name", "email"] }],
            },
            { model: Class, as: "class", attributes: ["id", "name", "subject"] },
          ],
        }],
      });

      return res.status(201).json({
        message: "Nota lançada com sucesso.",
        grade: formatGradeResponse(full),
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao lançar nota: " + error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const { role, id: user_id } = req.user;
      const {
        studentName,
        subject,
        period,
        minValue,
        maxValue,
        page = 1,
        limit = 10,
        orderBy = "createdAt",
        order = "DESC",
      } = req.query;

      const gradeWhere    = {};
      const classWhere    = {};
      const userWhere     = {};
      let enrollmentWhere = {};

      if (period)      gradeWhere.period = { [Op.iLike]: `%${period}%` };
      if (subject)     classWhere.name   = { [Op.iLike]: `%${subject}%` };
      if (studentName) userWhere.name    = { [Op.iLike]: `%${studentName}%` };

      if (minValue !== undefined || maxValue !== undefined) {
        gradeWhere.value = {};
        if (minValue !== undefined) gradeWhere.value[Op.gte] = parseFloat(minValue);
        if (maxValue !== undefined) gradeWhere.value[Op.lte] = parseFloat(maxValue);
      }

      if (role === "STUDENT") {
        const student = await getStudentFromUser(user_id);
        if (!student) {
          return res.status(404).json({ error: "Perfil de aluno não encontrado." });
        }
        enrollmentWhere.student_id = student.id;
      } else if (role === "TEACHER") {
        gradeWhere.teacher_id = user_id;
      }

      const allowedOrderFields = ["value", "period", "createdAt"];
      const safeOrderBy = allowedOrderFields.includes(orderBy) ? orderBy : "createdAt";
      const safeOrder   = ["ASC", "DESC"].includes(order.toUpperCase()) ? order.toUpperCase() : "DESC";

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { rows: grades, count: total } = await Grade.findAndCountAll({
        where: gradeWhere,
        include: [{
          model: Enrollment,
          as: "enrollment",
          where: Object.keys(enrollmentWhere).length ? enrollmentWhere : undefined,
          required: true,
          include: [
            {
              model: Student,
              as: "student",
              include: [{
                model: User,
                as: "authInfo",
                attributes: ["id", "name", "email"],
                where: Object.keys(userWhere).length ? userWhere : undefined,
                required: Object.keys(userWhere).length > 0,
              }],
            },
            {
              model: Class,
              as: "class",
              attributes: ["id", "name", "subject"],
              where: Object.keys(classWhere).length ? classWhere : undefined,
              required: Object.keys(classWhere).length > 0,
            },
          ],
        }],
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
      res.status(500).json({ error: "Erro ao listar notas: " + error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const { role, id: user_id } = req.user;

      const grade = await Grade.findByPk(req.params.id, {
        include: [{
          model: Enrollment,
          as: "enrollment",
          include: [
            {
              model: Student,
              as: "student",
              include: [{ model: User, as: "authInfo", attributes: ["name", "email"] }],
            },
            { model: Class, as: "class", attributes: ["id", "name", "subject"] },
          ],
        }],
      });

      if (!grade) {
        return res.status(404).json({ error: "Nota não encontrada." });
      }

      if (role === "STUDENT") {
        const student = await getStudentFromUser(user_id);
        if (!student || grade.enrollment.student_id !== student.id) {
          return res.status(403).json({ error: "Acesso negado." });
        }
      }

      return res.status(200).json({ grade: formatGradeResponse(grade) });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar nota: " + error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { role, id: user_id } = req.user;

      if (role !== "TEACHER" && role !== "ADMIN") {
        return res.status(403).json({ error: "Apenas professores podem editar notas." });
      }

      const grade = await Grade.findByPk(req.params.id);
      if (!grade) {
        return res.status(404).json({ error: "Nota não encontrada." });
      }

      if (role === "TEACHER" && grade.teacher_id !== user_id) {
        return res.status(403).json({ error: "Você não pode editar notas de outro professor." });
      }

      const { value, period, description } = req.body;

      if (value !== undefined && (value < 0 || value > 10)) {
        return res.status(400).json({ error: "Nota deve ser entre 0 e 10." });
      }

      await grade.update({ value, period, description });

      return res.status(200).json({
        message: "Nota atualizada com sucesso.",
        grade: formatGradeResponse(grade),
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar nota: " + error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { role, id: user_id } = req.user;

      if (role !== "TEACHER" && role !== "ADMIN") {
        return res.status(403).json({ error: "Apenas professores podem remover notas." });
      }

      const grade = await Grade.findByPk(req.params.id);
      if (!grade) {
        return res.status(404).json({ error: "Nota não encontrada." });
      }

      if (role === "TEACHER" && grade.teacher_id !== user_id) {
        return res.status(403).json({ error: "Você não pode remover notas de outro professor." });
      }

      await grade.destroy();

      return res.status(200).json({ message: "Nota removida com sucesso." });
    } catch (error) {
      res.status(500).json({ error: "Erro ao remover nota: " + error.message });
    }
  },

};

export default gradeController;