import Class from "../models/Class.js";
import User from "../models/User.js";

export const classController = {
  create: async (req, res) => {
    try {
      const { name, subject, teacherId } = req.body;
      const newClass = await Class.create({ name, subject, teacherId });
      res.status(201).json({ message: "Turma criada com sucesso!", data: newClass });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const classes = await Class.findAll({
        include: [{ model: User, as: 'teacher', attributes: ['email'] }]
      });
      res.status(200).json(classes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};