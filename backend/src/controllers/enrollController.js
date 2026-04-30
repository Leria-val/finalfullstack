import Enrollment from "../models/Enrollment.js";
import Student from "../models/Student.js";
import Class from "../models/Class.js";

export const enrollController = {
  enroll: async (req, res) => {
    try {
      const { student_id, class_id } = req.body;

      // verifica se a matrícula já existe (Evita duplicidade no banco)
      const existingEnroll = await Enrollment.findOne({
        where: { student_id, class_id }
      });

      if (existingEnroll) {
        return res.status(400).json({ error: "Este aluno já está matriculado nesta turma." });
      }

      // cria a matrícula
      const enrollment = await Enrollment.create({ student_id, class_id });

      res.status(201).json({ 
        message: "Matrícula realizada com sucesso!", 
        data: enrollment 
      });
    } catch (error) {
      res.status(500).json({ error: "Erro ao matricular: " + error.message });
    }
  },

  // lista todos os alunos de uma turma específica (UX do Professor)
  getStudentsByClass: async (req, res) => {
    const { class_id } = req.params;
    try {
      const classWithStudents = await Class.findByPk(class_id, {
        include: [{
          model: Student,
          as: 'students',
          include: ['authInfo'] // Traz o nome/email do User associado ao Student
        }]
      });

      if (!classWithStudents) {
        return res.status(404).json({ error: "Turma não encontrada." });
      }

      res.json(classWithStudents.students);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};