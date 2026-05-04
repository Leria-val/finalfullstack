import express from "express";
import { enrollController } from "../controllers/enrollController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// GET  /                — list all  (ADMIN + TEACHER)
router.get("/",           roleMiddleware(["ADMIN", "TEACHER"]), enrollController.getAll);

// POST /                — enroll    (ADMIN only)
router.post("/",          roleMiddleware("ADMIN"),              enrollController.enroll);

// DELETE /:id           — cancel    (ADMIN only)
router.delete("/:id",     roleMiddleware("ADMIN"),              enrollController.delete);

// GET /class/:classId   — by class  (ADMIN + TEACHER)
router.get("/class/:classId", roleMiddleware(["ADMIN", "TEACHER"]), enrollController.getStudentsByClass);

export default router;