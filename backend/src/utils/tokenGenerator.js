import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

if (!JWT_SECRET) {
  
  console.error("❌ ERRO: JWT_SECRET não foi encontrado no arquivo .env");
  process.exit(1); 
}

// Gerar Token de Acesso (Login)
export const generateToken = (payload) => {
  // payload geralmente contém { id, role }
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN 
  });
};

// Verificar validade do Token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Gerar Token aleatório (para recuperação de senha, etc)
export const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};