const { verifyToken } = require('../utils/jwtUtils');

const authMiddleware = (req, res, next) => {
    // Obter o token do cabeçalho de autorização
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }

    // Extrair o token do cabeçalho (removendo a parte 'Bearer ')
    const token = authHeader.split(' ')[1];

    console.log('Token recebido:', token.substring(0, 20) + '...');

    // Verificar o token
    const decoded = verifyToken(token);
    console.log('Token decodificado:', decoded);

    if (!decoded) {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
    }

    // Adicionar as informações do usuário ao objeto de requisição
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.userRole = decoded.role || 'user';

    console.log(`Usuário autenticado: ${req.userId}, Username: ${req.username}, Role: ${req.userRole}`);

    // Permitir que a requisição continue
    next();
};

// Middleware para verificar se o usuário é administrador
const isAdmin = (req, res, next) => {
    // Este middleware deve ser usado após o authMiddleware
    console.log(`Verificando permissão admin. Role do usuário: ${req.userRole}`);

    if (req.userRole !== 'admin') {
        console.log(`Acesso negado. Role esperado: admin, encontrado: ${req.userRole}`);
        return res.status(403).json({ message: 'Acesso negado: Permissão de administrador necessária' });
    }

    console.log('Permissão de admin confirmada.');
    next();
};

module.exports = { authMiddleware, isAdmin };