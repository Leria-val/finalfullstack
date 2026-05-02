import express from "express";
import { classController } from "../controllers/classController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validateBody, classSchema } from "../validations/validation.js";


const router = express.Router();

router.get("/", 
    authMiddleware, 
    classController.getAll);


// Apenas o ADMIN pode criar novas turmas
router.post("/", 
  authMiddleware, 
  roleMiddleware("ADMIN"), // Ajustado para CAIXA ALTA
  classController.create
);

export default router;