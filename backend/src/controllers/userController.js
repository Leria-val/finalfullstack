import { Op } from "sequelize";
import sequelize from "../config/connection.js";
import User from "../models/User.js";
import Student from "../models/Student.js";

export const userController = {

  create: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) {
        await t.rollback();
        return res.status(400).json({ error: "Todos os campos são obrigatórios (nome, email, senha, cargo)." });
      }

      if (!["ADMIN", "TEACHER", "STUDENT"].includes(role?.toUpperCase())) {
        await t.rollback();
        return res.status(400).json({ error: "Cargo inválido. Use: ADMIN, TEACHER ou STUDENT." });
      }

      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        await t.rollback();
        return res.status(409).json({ error: "E-mail já cadastrado no sistema." });
      }

      const newUser = await User.create({ name, email, password, role: role.toUpperCase() }, { transaction: t });

      // BUG FIX: quando o papel é STUDENT, criar automaticamente o registro
      // na tabela students para que o dashboard e matrículas funcionem corretamente
      if (role.toUpperCase() === "STUDENT") {
        const timestamp = Date.now();
        await Student.create({
          user_id: newUser.id,
          registration_number: `AUTO-${timestamp}`,
          birth_date: "2000-01-01",
          phone: "00000000000",
          status: "ACTIVE",
        }, { transaction: t });
      }

      await t.commit();

      return res.status(201).json({
        message: `Usuário (${role.toUpperCase()}) criado com sucesso.`,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ error: "Erro ao criar usuário: " + error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const { name, email, role, page = 1, limit = 10 } = req.query;

      const where = {};
      if (name)  where.name  = { [Op.iLike]: `%${name}%` };
      if (email) where.email = { [Op.iLike]: `%${email}%` };
      if (role)  where.role  = role.toUpperCase(); // FIX: normalize to uppercase

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { rows: users, count: total } = await User.findAndCountAll({
        where,
        attributes: ["id", "name", "email", "role", "createdAt"],
        limit: parseInt(limit),
        offset,
        order: [["name", "ASC"]],
      });

      return res.status(200).json({
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        users,
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao listar usuários: " + error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ["id", "name", "email", "role", "createdAt"],
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

      // FIX: was req.userId (undefined) — authMiddleware sets req.user.id
      const requestingUserId = req.user?.id;
      if (requestingUserId === user.id && role && role.toUpperCase() !== "ADMIN") {
        return res.status(400).json({ error: "Você não pode remover seu próprio cargo de ADMIN." });
      }

      await user.update({
        name:  name  ?? user.name,
        email: email ?? user.email,
        role:  role  ? role.toUpperCase() : user.role,
      });

      return res.status(200).json({
        message: "Usuário atualizado com sucesso.",
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar usuário: " + error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado." });

      // FIX: was req.userId (undefined)
      if (req.user?.id === user.id) {
        return res.status(400).json({ error: "Não é possível excluir sua própria conta." });
      }

      await user.destroy();
      return res.status(200).json({ message: "Usuário removido com sucesso." });
    } catch (error) {
      res.status(500).json({ error: "Erro ao remover usuário: " + error.message });
    }
  },
};

export default userController;