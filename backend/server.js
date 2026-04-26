import express from "express";
import cors from "cors";
import { connect, sequelize } from "./config/connection.js";
import categoryRouter from "./routes/categoryRouter.js";
import productRouter from "./routes/productRouter.js";
import authRouter from "./routes/authRouter.js";
import Product from "./models/Product.js";
import Category from "./models/Category.js";


import 'dotenv/config'

const PORT = process.env.PORT || 3000;
const app = express();

app.use (cors ({
  "origin": "http://localhost:5173",
  "methods": "GET, POST, PUT, DELETE",
  "credentials": true
}));
app.use(express.json());
app.use('/api/categories', categoryRouter)
app.use('/api/products', productRouter)
app.use('/api/auth', authRouter)

const startServer = async () => {
  try {
    // conectamos y Sincronizamos 
    await connect(); 

    const count = await Category.count();
    if (count === 0) {
      await Category.bulkCreate([
        { id: 1, name: 'Eletrônicos', description: 'Tecnologia' },
        { id: 2, name: 'Móveis', description: 'Casa e escritório' },
        { id: 3, name: 'Geral', description: 'Outros' }
      ]);
      console.log("🌱 Categorias iniciais criadas automaticamente!");
    }
    
    // encendemos el server
    app.listen(PORT, () => {
      console.log(`Servidor rodando em: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erro fatal ao iniciar o servidor:", error);
  }
};

startServer();