import Class from "../models/Class.js";
import User from "../models/User.js";

export const classController = {
  create: async (req, res) => {
    try {
      const { name, subject, teacher_id, period, room } = req.body;
      
      const teacher = await User.findByPk(teacher_id);
      if (!teacher || teacher.role !== 'TEACHER') {
        return res.status(400).json({ 
          error: "ID de professor inválido. Certifique-se de que o usuário tem o papel de TEACHER." 
        });
      }
      
      const newClass = await Class.create({ 
        name, 
        subject, 
        teacher_id,
        period,
        room
      });

      res.status(201).json({ 
        message: "Turma criada com sucesso!", 
        data: newClass 
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar turma: " + error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const classes = await Class.findAll({
        include: [{ 
          model: User, 
          as: 'teacher', 
          attributes: ['id', 'name', 'email'] 
        }],
        order: [['createdAt', 'DESC']]
      });
      res.status(200).json(classes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};