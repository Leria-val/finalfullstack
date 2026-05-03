import { Op } from "sequelize";
import User from "../models/User.js";

export const userController = {
  // Crear Admin o Profesor
  create: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios (nome, email, senha, cargo)." });
      }

      //  No permitir crear estudiantes desde aquí para evitar conflictos con studentController
      if (!['ADMIN', 'TEACHER'].includes(role)) {
        return res.status(400).json({ error: "Este endpoint é exclusivo para ADMIN e TEACHER." });
      }

    
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(409).json({ error: "E-mail já cadastrado no sistema." });
      }


      const newUser = await User.create({
        name,
        email,
        password,
        role
      });

      return res.status(201).json({
        message: `Usuário (${role}) criado com sucesso.`,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar usuário: " + error.message });
    }
  },

  
  getAll: async (req, res) => {
    try {
      const { name, email, role, page = 1, limit = 10 } = req.query;
      
      const where = {};
      
      // Filtros dinámicos
      if (name) where.name = { [Op.iLike]: `%${name}%` };
      if (email) where.email = { [Op.iLike]: `%${email}%` };
      if (role) where.role = role;

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { rows: users, count: total } = await User.findAndCountAll({
        where,
        attributes: ['id', 'name', 'email', 'role', 'createdAt'],
        limit: parseInt(limit),
        offset,
        order: [['name', 'ASC']]
      });

      return res.status(200).json({
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        users
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar usuários: " + error.message });
    }
  },

  
  getById: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'name', 'email', 'role', 'createdAt']
      });

      if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

      return res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuário: " + error.message });
    }
  },

 
  update: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

      const { name, email, role } = req.body;


      if (req.userId === user.id && role && role !== 'ADMIN') {
        return res.status(400).json({ error: "Você não pode remover seu próprio cargo de ADMIN." });
      }

      await user.update({ name, email, role });

      return res.status(200).json({
        message: "Usuário atualizado com sucesso.",
        user: { id: user.id, name, email, role }
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar usuário: " + error.message });
    }
  },


  delete: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

      // Impedir que el admin se borre a sí mismo
      if (req.userId === user.id) {
        return res.status(400).json({ error: "Não é possível excluir sua própria conta." });
      }

      await user.destroy();
      return res.status(200).json({ message: "Usuário removido com sucesso." });
    } catch (error) {
      res.status(500).json({ error: "Erro ao remover usuário: " + error.message });
    }
  }
};

export default userController;