import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "segredo";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;  
  if (!authHeader) {
    return res.status(401).json({
      error: "Token não fornecido",
    });
  }

  //["Bearer","jwtshuashuashaushaa.ashuasuhashusa.ashuahsas"]
const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Token mal formatado" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "segredo");
    
    req.user = decoded; 
    next();
  } catch (error) {
    console.error("Erro na verificação do JWT:", error.message);
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}
