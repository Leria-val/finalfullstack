import express from 'express';
import authController from '../controllers/authController.js'

const router = express.Router();

//criar usuarios (admin só)
router.post('/register', authController.register);

//rota de acesso
authRouter.post('/login', authController.login);

export default router