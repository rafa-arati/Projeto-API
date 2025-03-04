const jwt = require('jsonwebtoken');
const config = require('../config');

// Chave secreta para assinar os tokens (do arquivo de configuração)
const JWT_SECRET = config.jwtSecret;

// Função para gerar um token JWT
const generateToken = (userId, role = 'user') => {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: config.jwtExpiresIn });
};

// Função para verificar um token JWT
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded; // Retorna o payload do token (userId e role)
    } catch (err) {
        return null; // Retorna null se o token for inválido ou expirado
    }
};

module.exports = { generateToken, verifyToken };