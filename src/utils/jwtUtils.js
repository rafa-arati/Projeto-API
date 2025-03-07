const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Chave secreta para assinar os tokens (armazenada no .env)
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_de_fallback';

// Função para gerar um token JWT
const generateToken = (userId, username, role = 'user') => {
    console.log(`Gerando token JWT para: userId=${userId}, username=${username}, role=${role}`);

    // Garantir que a role seja tratada corretamente
    const userRole = role === 'admin' ? 'admin' : 'user';

    const payload = { userId, username, role: userRole };
    console.log('Payload do token:', payload);

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expira em 1 hora
};

// Função para verificar um token JWT
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Token decodificado:', decoded);
        return decoded; // Retorna o payload do token (neste caso, { userId, username, role })
    } catch (err) {
        console.error('Erro ao verificar token:', err.message);
        return null; // Retorna null se o token for inválido ou expirado
    }
};

module.exports = { generateToken, verifyToken };
