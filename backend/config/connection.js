import { Sequelize } from "sequelize";
import 'dotenv/config';


const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASS, 
  {
    //host: process.env.DB_HOST || "localhost",
    host: "127.0.0.1",
    dialect: "postgres", 
    port: process.env.DB_PORT || 5432,          
    logging: false,
  }
);

async function connect() {
  try{
  await sequelize.authenticate();
  await sequelize.sync({ force: true }); //asegura que as tabelas existam mas é opcional :p

  console.log("conexão com PostgreSQL estabelecida.");
} catch (error) {
  console.error("Erro ao conectar ao banco:", error.message);
  process.exit(1); //para o server se não tem base de datos
  }
}

export { connect, sequelize }; 
export default sequelize; 