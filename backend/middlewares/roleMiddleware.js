export function roleMiddleware(requiredRole) {
    return (req, res, next) => {
        
        if (!req.user) {
            return res.status(401).json({
                error: "Usuário não autenticado",
            });
        }

        const userRole = req.user.role; 

        if (userRole === 'admin') {
            return next();
        }
        if (userRole !== requiredRole) {
            return res.status(403).json({
                error: "Acesso negado: Nível de permissão insuficiente",
            });
        }

        next();
    };
}