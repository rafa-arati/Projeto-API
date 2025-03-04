require('dotenv').config();

// Centralizar todas as configurações da aplicação
module.exports = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'TesTEdeChaveSecreTAPAraPodERfAZEroProjeto',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    dbPath: process.env.DB_PATH || './db_data',
    passwordMinLength: 8,
    adminEmail: process.env.ADMIN_EMAIL
};