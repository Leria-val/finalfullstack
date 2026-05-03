import { Router } from "express";
import { userController } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";

const router = Router();

// Todas las rutas requieren estar logueado
router.use(authMiddleware);

// Solo el ADMIN puede gestionar el Staff (crear, listar, editar, borrar)
router.post("/", roleMiddleware(["ADMIN"]), userController.create);
router.get("/", roleMiddleware(["ADMIN"]), userController.getAll);
router.get("/:id", roleMiddleware(["ADMIN"]), userController.getById);
router.put("/:id", roleMiddleware(["ADMIN"]), userController.update);
router.delete("/:id", roleMiddleware(["ADMIN"]), userController.delete);

export default router;