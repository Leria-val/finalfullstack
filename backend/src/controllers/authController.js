import User from "../models/User.js";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "segredo";

const authController = {

  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Este email já está cadastrado" });
      }

      const user = await User.create({
        name, 
        email,
        password,
        role: role?.toUpperCase() || 'STUDENT'
      });

      res.status(201).json({ 
        message: "Usuário criado", 
        user: { 
          id: user.id,
          name: user.name,
          email: user.email, 
          role: user.role 
        } 
      });

    } catch (error) {
      res.status(500).json({ error: "Erro ao registrar usuário:" + error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
        
      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      //buscar usuario usando scope 'withPassword'

      const user = await User.scope('withPassword').findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // comparar senha
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      // gerar token
      const token = jwt.sign(
        { id: user.id, name: user.name, role: user.role }, 
        SECRET, 
        { expiresIn: "8h" }
      );

      return res.json({ 
        success: true,
        message: "Login realizado com sucesso", 
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ error:"Erro no servidor." + error.message });
    }
  },
};
export default authController;
