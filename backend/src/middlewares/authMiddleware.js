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
    const decoded = jwt.verify(token, process.env.JWT_SECRET );

    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.user = decoded; 

    return next();
  } catch (error) {

    const message = error.name === 'TokenExpiredError'
    ? "Sua sessao expirou. Faca login novamente."
    : "Token inválido.";

    return res.status(401).json({ error: message });
  }
}
