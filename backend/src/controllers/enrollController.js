import Enrollment from "../models/Enrollment.js";

export const enrollController = {
  store: async (req, res) => {
    try {
      const { studentId, classId } = req.body;
      
      // Verifica se o aluno já está na turma
      const exists = await Enrollment.findOne({ where: { studentId, classId } });
      if (exists) return res.status(400).json({ message: "Aluno já matriculado nesta turma" });

      const enrollment = await Enrollment.create({ studentId, classId });
      res.status(201).json({ message: "Matrícula realizada!", data: enrollment });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};