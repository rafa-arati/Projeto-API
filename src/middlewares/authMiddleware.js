const { verifyToken } = require('../utils/jwtUtils');
const userRepository = require('../repositories/userRepository');

// Middleware para verificar autenticação
const authenticate = (req, res, next) => {
    try {
        // Obter o token do cabeçalho Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token de autenticação não fornecido' });
        }

        // Extrair o token da string "Bearer TOKEN"
        const token = authHeader.split(' ')[1];
        
        // Verificar o token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Token inválido ou expirado' });
        }

        // Adicionar informações do usuário à requisição
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Erro na autenticação', error: error.message });
    }
};

// Middleware para verificar se o usuário é um administrador
const isAdmin = async (req, res, next) => {
    try {
        // Verificar diretamente pelo userRole no token
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado: apenas administradores podem realizar esta ação' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao verificar permissões', error: error.message });
    }
};

module.exports = { authenticate, isAdmin };