import Class from "../models/Class.js";
import User from "../models/User.js";
import { Op } from "sequelize";

export const classController = {
  create: async (req, res) => {
    try {
      const { name, subject, teacher_id, period, room } = req.body;
      
      // Validação do professor
      const teacher = await User.findByPk(teacher_id);
      if (!teacher || teacher.role !== 'TEACHER') {
        return res.status(400).json({ 
          error: "ID de professor inválido ou usuário não é um TEACHER." 
        });
      }
      
      const newClass = await Class.create({ 
        name, 
        subject, 
        teacher_id,
        period,
        room
      });

      // Retorna a turma com os dados do professor para o frontend atualizar a lista na hora
      const classWithTeacher = await Class.findByPk(newClass.id, {
        include: [{ model: User, as: 'teacher', attributes: ['id', 'name'] }]
      });

      res.status(201).json({ 
        message: "Turma criada com sucesso!", 
        class: classWithTeacher 
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar turma: " + error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const { name, page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const where = {};
      if (name) {
        where.name = { [Op.iLike]: `%${name}%` };
      }

      const { count, rows } = await Class.findAndCountAll({
        where,
        include: [{ 
          model: User, 
          as: 'teacher', 
          attributes: ['id', 'name', 'email'] 
        }],
        limit: parseInt(limit),
        offset: offset,
        order: [['createdAt', 'DESC']],
        distinct: true
      });

      // Resposta no formato que o Classes.jsx e Dashboard esperam
      res.status(200).json({
        total: count,
        classes: rows,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar turmas: " + error.message });
    }
  },

  // Adicionando Delete para garantir funcionalidade total
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Class.destroy({ where: { id } });
      if (!deleted) return res.status(404).json({ error: "Turma não encontrada." });
      res.status(200).json({ message: "Turma excluída com sucesso!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};