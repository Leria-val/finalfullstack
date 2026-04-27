import express from "express";
import categoryController from "../controllers/categoryController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { categorySchema } from "../validations/categoryValidation.js";
import validateMiddleware from "../middlewares/validateMiddleware.js";

const categoryRouter = express.Router();

categoryRouter.get("/", categoryController.getAll);

categoryRouter.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  validateMiddleware(categorySchema),
  categoryController.create
);

export default categoryRouter;