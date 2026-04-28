import express from "express";
import cors from "cors";
import 'dotenv/config';
import { connectDB } from "./config/connection.js";
import authRoutes from "./routes/authRoutes.js";
// import userRoutes from "./routes/userRoutes.js"; // Comentar até criar os arquivos

const app = express();
const PORT = process.env.PORT || 3000;
--
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());


app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);

app.get('/health', (req, res) => res.status(200).json({ status: 'OK', uptime: process.uptime() }));


const startServer = async () => {
  try {

    await connectDB(); 

    app.listen(PORT, () => {
      console.log(`🚀 Euphonica Server rodando em: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erro fatal ao iniciar o servidor:", error);
  }
};

startServer();