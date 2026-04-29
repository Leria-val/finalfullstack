import express from "express";
import { enrollController } from "../controllers/enrollController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Apenas Admin ou Professor podem matricular alunos
router.post("/", authMiddleware, roleMiddleware("professor"), enrollController.store);

export default router;