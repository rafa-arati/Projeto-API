const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Chave secreta para assinar os tokens (armazenada no .env)
const JWT_SECRET = process.env.JWT_SECRET;

// Função para gerar um token JWT
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' }); // Token expira em 1 hora
};

// Função para verificar um token JWT
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded; // Retorna o payload do token (neste caso, { userId })
    } catch (err) {
        return null; // Retorna null se o token for inválido ou expirado
    }
};

module.exports = { generateToken, verifyToken };