import { Op } from "sequelize";
import Student from "../models/Student.js";
import User from "../models/User.js";
import { formatStudentResponse } from "../utils/dataFormatter.js";

export const studentController = {

  create: async (req, res) => {
    try {
      const { user_id, registration_number, course, birthDate, phone } = req.body;

      if (!user_id || !registration_number || !course) {
        return res.status(400).json({ error: "userId, matrícula e curso são obrigatórios." });
      }

      const user = await User.findOne({ where: { id: user_id, role: "STUDENT" } });
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado ou sem role de aluno." });
      }

      const alreadyExists = await Student.findOne({ where: { user_id } });
      if (alreadyExists) {
        return res.status(409).json({ error: "Este usuário já possui um perfil de aluno." });
      }

      const enrollmentTaken = await Student.findOne({ where: { registration_number } });
      if (enrollmentTaken) {
        return res.status(409).json({ error: "Matrícula já cadastrada." });
      }

      const student = await Student.create({ 
        user_id, 
        registration_number, 
        course, 
        birthDate, 
        phone });

      const full = await Student.findByPk(student.id, {
        include: [{ model: User, as: "authInfo", attributes: ["id", "name", "email"] }],
      });

      return res.status(201).json({
        message: "Aluno criado com sucesso.",
        student: formatStudentResponse(full),
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar aluno: " + error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const {
        name,
        registration_number,
        course,
        page = 1,
        limit = 10,
        orderBy = "name",
        order = "ASC",
      } = req.query;

      const studentWhere = {};
      if (registration_number) studentWhere.registration_number = { [Op.iLike]: `%${registration_number}%` };
      if (course)     studentWhere.course     = { [Op.iLike]: `%${course}%` };

      const userWhere = {};
      if (name) userWhere.name = { [Op.iLike]: `%${name}%` };

      const sortableFields = {
        name:       [{ model: User, as: "authInfo" }, "name"],
        registration_number: "registration_number,",
        course:     "course",
        createdAt:  "createdAt",
      };
      const sortField = sortableFields[orderBy] || [{ model: User, as: "user" }, "name"];
      const sortDir   = ["ASC", "DESC"].includes(order.toUpperCase()) ? order.toUpperCase() : "ASC";

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { rows: students, count: total } = await Student.findAndCountAll({
        where: studentWhere,
        include: [{
          model: User,
          as: "authInfo",
          attributes: ["id", "name", "email"],
          where: Object.keys(userWhere).length ? userWhere : undefined,
          required: Object.keys(userWhere).length > 0,
        }],
        order: [Array.isArray(sortField) ? [...sortField, sortDir] : [sortField, sortDir]],
        limit: parseInt(limit),
        offset,
        distinct: true,
      });

      return res.status(200).json({
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        students: students.map(formatStudentResponse),
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar alunos: " + error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const student = await Student.findByPk(req.params.id, {
        include: [{ model: User, as: "authInfo", attributes: ["id", "name", "email", "role"] }],
      });

      if (!student) {
        return res.status(404).json({ error: "Aluno não encontrado." });
      }

      return res.status(200).json({ student: formatStudentResponse(student) });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar aluno: " + error.message });
    }
  },

  update: async (req, res) => {
    try {
      const student = await Student.findByPk(req.params.id);
      if (!student) {
        return res.status(404).json({ error: "Aluno não encontrado." });
      }

      const { registration_number, course, birthDate, phone } = req.body;

      if (registration_number && registration_number !== student.registration_number) {
        const conflict = await Student.findOne({ where: { registration_number, } });
        if (conflict) {
          return res.status(409).json({ error: "Matrícula já em uso." });
        }
      }

      await student.update({ registration_number, course, birthDate, phone });

      const updated = await Student.findByPk(student.id, {
        include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
      });

      return res.status(200).json({
        message: "Aluno atualizado com sucesso.",
        student: formatStudentResponse(updated),
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar aluno: " + error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const student = await Student.findByPk(req.params.id);
      if (!student) {
        return res.status(404).json({ error: "Aluno não encontrado." });
      }

      await student.destroy();

      return res.status(200).json({ message: "Aluno removido com sucesso." });
    } catch (error) {
      res.status(500).json({ error: "Erro ao remover aluno: " + error.message });
    }
  },

};

export default studentController;