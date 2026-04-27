import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "segredo";

const authController = {

  register: async (req, res) => {
    try {
      const { email, password, role } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Este email já está cadastrado" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log(role)

      const user = await User.create({
        email,
        password: hashedPassword,
        role: role || 'user'
      });

      res.status(201).json({ 
        message: "Usuário criado", 
        user: { 
          email: user.email, 
          role: user.role } 
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
        
      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // comparar senha
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ message: "Senha inválida" });
      }

      // gerar token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        SECRET, 
        { expiresIn: "1h" }
      );

      return res.json({ 
        success: true,
        message: "Login realizado com sucesso", 
        token,
        user: {
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
export default authController;
