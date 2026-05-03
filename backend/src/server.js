import express from "express";
import cors from "cors";
import 'dotenv/config';
import { connect } from "./config/connection.js";
import authRoutes from "./routes/authRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import enrollRoutes from "./routes/enrollRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());


app.use('/api/auth', authRoutes);         // Login e Registro Geral
app.use('/api/students', studentRoutes); // Cadastro de perfil de aluno
app.use('/api/classes', classRoutes);     // Gestão de turmas
app.use('/api/enroll', enrollRoutes);     // Matrículas (vínculo aluno-turma)
app.use('/api/grades', gradeRoutes);     // Lançamento de notas
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => res.status(200).json({ 
  status: 'OK', 
  uptime: process.uptime(),
  timestamp: new Date().toISOString()
 }));


const startServer = async () => {
  try {

    await connect(); 

    app.listen(PORT, () => {
      console.log(`Euphonica Server rodando em: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erro fatal ao iniciar o servidor:", error);
  }
};

startServer();