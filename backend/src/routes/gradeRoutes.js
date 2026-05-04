import { Router } from "express";
import { gradeController } from "../controllers/gradeController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = Router();

router.use(authMiddleware);

// GET  /     — all roles (student sees own, teacher sees theirs, admin sees all)
router.get("/",       gradeController.getAll);

// POST /     — TEACHER + ADMIN
router.post("/",      roleMiddleware(["TEACHER", "ADMIN"]), gradeController.create);

// GET  /:id
router.get("/:id",    gradeController.getById);

// PUT  /:id  — TEACHER + ADMIN
router.put("/:id",    roleMiddleware(["TEACHER", "ADMIN"]), gradeController.update);

// DELETE /:id — TEACHER + ADMIN
router.delete("/:id", roleMiddleware(["TEACHER", "ADMIN"]), gradeController.delete);

export default router;