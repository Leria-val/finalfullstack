import { Op } from "sequelize";
import sequelize from "../config/connection.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import { formatStudentResponse } from "../utils/dataFormatter.js";

export const studentController = {

  create: async (req, res) => {
    const t = await sequelize.transaction(); 
    try {
      const { 
        name, email, password, // Datos de User
        registration_number, musical_level, instrument, birth_date, phone // Datos de Student
      } = req.body;

      
      if (!name || !email || !password || !registration_number || !birth_date || !phone) {
        return res.status(400).json({ error: "Dados de usuário e acadêmicos são obrigatórios." });
      }

      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        await t.rollback();
        return res.status(409).json({ error: "E-mail já cadastrado." });
      }

      const registrationExists = await Student.findOne({ where: { registration_number } });
      if (registrationExists) {
        await t.rollback();
        return res.status(409).json({ error: "Matrícula já cadastrada." });
      }


      const user = await User.create({
        name,
        email,
        password,
        role: "STUDENT" 
      }, { transaction: t });

     
      const student = await Student.create({ 
        user_id: user.id, 
        registration_number, 
        musical_level, 
        instrument, 
        birth_date, 
        phone,
        status: 'ACTIVE'
      }, { transaction: t });

      await t.commit(); 


      const full = await Student.findByPk(student.id, {
        include: [{ model: User, as: "authInfo", attributes: ["id", "name", "email"] }],
      });

      return res.status(201).json({
        message: "Aluno e conta criados com sucesso.",
        student: formatStudentResponse(full),
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: "Erro ao criar aluno: " + error.message });
    }
  },

  getAll: async (req, res) => {
  try {
    const {
      name,
      registration_number,
      instrument,
      page = 1,
      limit = 10,
      orderBy = "name",
      order = "ASC",
    } = req.query;

    const studentWhere = {};
    if (registration_number) {
      studentWhere.registration_number = { [Op.iLike]: `%${registration_number}%` };
    }
    if (instrument) {
      studentWhere.instrument = { [Op.iLike]: `%${instrument}%` };
    }

    const userWhere = {};
    if (name) {
      userWhere.name = { [Op.iLike]: `%${name}%` };
    }

    const sortableFields = {
      name: [{ model: User, as: "authInfo" }, "name"],
      registration_number: "registration_number",
      instrument: "instrument",
      createdAt: "createdAt",
    };

    const sortField = sortableFields[orderBy] || [{ model: User, as: "authInfo" }, "name"];
    const sortDir = ["ASC", "DESC"].includes(order.toUpperCase()) ? order.toUpperCase() : "ASC";
    const offset = (parseInt(page) - 1) * parseInt(limit);

    
    const { rows: students, count: total } = await Student.findAndCountAll({
      where: studentWhere,
      include: [{
        model: User,
        as: "authInfo",
        attributes: ["id", "name", "email"],
        where: Object.keys(userWhere).length ? userWhere : undefined,
        required: Object.keys(userWhere).length > 0, // Inner join si hay búsqueda, left join si no
      }],
      order: [Array.isArray(sortField) ? [...sortField, sortDir] : [sortField, sortDir]],
      limit: parseInt(limit),
      offset,
      distinct: true, 
    });

    const formattedStudents = students.map(s => ({
      id: s.id,
      registration_number: s.registration_number,
      instrument: s.instrument,
      musical_level: s.musical_level,
      status: s.status,
      name: s.authInfo?.name, 
      email: s.authInfo?.email,
      userId: s.user_id,
      createdAt: s.createdAt
    }));

    return res.status(200).json({
      total, 
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      students: formattedStudents, 
    });
  } catch (error) {
    console.error("Detalle del error:", error);
    res.status(500).json({ error: "Erro ao listar alunos: " + error.message });
  }
},

  getById: async (req, res) => {
    try {
      const student = await Student.findByPk(req.params.id, {
        include: [{ model: User, as: "authInfo", attributes: ["id", "name", "email", "role"] }],
      });

      if (!student) return res.status(404).json({ error: "Aluno não encontrado." });

      return res.status(200).json({ student: formatStudentResponse(student) });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar aluno: " + error.message });
    }
  },

  update: async (req, res) => {
    try {
      const student = await Student.findByPk(req.params.id);
      if (!student) return res.status(404).json({ error: "Aluno não encontrado." });

      const { registration_number, musical_level, instrument, birth_date, phone, status } = req.body;

      if (registration_number && registration_number !== student.registration_number) {
        const conflict = await Student.findOne({ where: { registration_number } });
        if (conflict) return res.status(409).json({ error: "Matrícula já em uso." });
      }

      await student.update({ registration_number, musical_level, instrument, birth_date, phone, status });

      const updated = await Student.findByPk(student.id, {
        include: [{ model: User, as: "authInfo", attributes: ["id", "name", "email"] }],
      });

      return res.status(200).json({
        message: "Dados acadêmicos atualizados com sucesso.",
        student: formatStudentResponse(updated),
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar aluno: " + error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const student = await Student.findByPk(req.params.id);
      if (!student) return res.status(404).json({ error: "Aluno não encontrado." });

    

      return res.status(200).json({ message: "Aluno e conta removidos com sucesso." });
    } catch (error) {
      res.status(500).json({ error: "Erro ao remover aluno: " + error.message });
    }
  },

};

export default studentController;