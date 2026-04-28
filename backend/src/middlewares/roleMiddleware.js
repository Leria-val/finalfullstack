export function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        
        if (!req.user) {
            return res.status(401).json({
                error: "Usuário não identificado. Autenticação necessária.",
            });
        }

        const {role} = req.user; 

        if (role === 'ADMIN') {
            return next();
        }
        const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!rolesArray.includes(role)) {
            return res.status(403).json({
                error: `Acesso negado: sua funcao (${role}) nao tem nível de permissão insuficiente`,
            });
        }

        next();
    };
}