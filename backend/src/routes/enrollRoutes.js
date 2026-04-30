import express from "express";
import { enrollController } from "../controllers/enrollController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Apenas ADMIN pode matricular alunos em turmas
router.post("/", 
  authMiddleware, 
  roleMiddleware("ADMIN"), 
  enrollController.enroll
);

// Professor e Admin podem ver os alunos de uma turma específica
// O :classId é usado pelo enrollController.getStudentsByClass
router.get("/class/:classId", 
  authMiddleware, 
  roleMiddleware(["ADMIN", "TEACHER"]), 
  enrollController.getStudentsByClass
);

export default router;