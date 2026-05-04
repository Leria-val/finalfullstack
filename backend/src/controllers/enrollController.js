import { Op } from "sequelize";
import Enrollment from "../models/Enrollment.js";
import Student from "../models/Student.js";
import Class from "../models/Class.js";
import User from "../models/User.js";

/* ── response formatter ─────────────────────────────────────────── */
const formatEnrollment = (e) => ({
  id:          e.id,
  studentName: e.student?.authInfo?.name          ?? "—",
  enrollment:  e.student?.registration_number     ?? "—",
  className:   e.class?.name                      ?? "—",
  subject:     e.class?.subject                   ?? "—",
  teacherName: e.class?.teacher?.name             ?? "—",
  status:      e.status                           ?? "active",
  createdAt:   e.createdAt,
  student_id:  e.student_id,
  class_id:    e.class_id,
});

export const enrollController = {

  /* POST / — create enrollment */
  enroll: async (req, res) => {
    try {
      const { student_id, class_id } = req.body;

      if (!student_id || !class_id) {
        return res.status(400).json({ error: "student_id e class_id são obrigatórios." });
      }

      const existingEnroll = await Enrollment.findOne({ where: { student_id, class_id } });
      if (existingEnroll) {
        return res.status(400).json({ error: "Este aluno já está matriculado nesta turma." });
      }

      const enrollment = await Enrollment.create({ student_id, class_id });

      const full = await Enrollment.findByPk(enrollment.id, {
        include: [
          {
            model: Student, as: "student",
            include: [{ model: User, as: "authInfo", attributes: ["name", "email"] }],
          },
          {
            model: Class, as: "class", attributes: ["id", "name", "subject"],
            include: [{ model: User, as: "teacher", attributes: ["name"] }],
          },
        ],
      });

      return res.status(201).json({
        message: "Matrícula realizada com sucesso!",
        enrollment: formatEnrollment(full),
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao matricular: " + error.message });
    }
  },

  /* GET / — list all enrollments with pagination + search */
  getAll: async (req, res) => {
    try {
      const { studentName, page = 1, limit = 10 } = req.query;

      const userWhere = {};
      if (studentName) userWhere.name = { [Op.iLike]: `%${studentName}%` };

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { rows: enrollments, count: total } = await Enrollment.findAndCountAll({
        include: [
          {
            model: Student, as: "student", required: true,
            include: [{
              model: User, as: "authInfo", attributes: ["name", "email"],
              where: Object.keys(userWhere).length ? userWhere : undefined,
              required: Object.keys(userWhere).length > 0,
            }],
          },
          {
            model: Class, as: "class", attributes: ["id", "name", "subject"],
            include: [{ model: User, as: "teacher", attributes: ["name"] }],
          },
        ],
        limit: parseInt(limit),
        offset,
        order: [["createdAt", "DESC"]],
        distinct: true,
      });

      return res.status(200).json({
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        enrollments: enrollments.map(formatEnrollment),
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar matrículas: " + error.message });
    }
  },

  /* DELETE /:id — cancel enrollment */
  delete: async (req, res) => {
    try {
      const enrollment = await Enrollment.findByPk(req.params.id);
      if (!enrollment) {
        return res.status(404).json({ error: "Matrícula não encontrada." });
      }
      await enrollment.destroy();
      return res.status(200).json({ message: "Matrícula cancelada com sucesso." });
    } catch (error) {
      res.status(500).json({ error: "Erro ao cancelar matrícula: " + error.message });
    }
  },

  /* GET /class/:classId — students in a class */
  getStudentsByClass: async (req, res) => {
    const { classId } = req.params;
    try {
      const classWithStudents = await Class.findByPk(classId, {
        include: [{ model: Student, as: "students", include: ["authInfo"] }],
      });
      if (!classWithStudents) {
        return res.status(404).json({ error: "Turma não encontrada." });
      }
      res.json(classWithStudents.students);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default enrollController;