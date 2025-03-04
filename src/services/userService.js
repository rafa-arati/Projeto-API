const userRepository = require('../repositories/userRepository');
const hashPassword = require('../utils/hashPassword');
const comparePassword = require('../utils/comparePassword');
const { generateToken } = require('../utils/jwtUtils');
const { validateEmail, validatePassword } = require('../utils/validation');
const config = require('../config');

class UserService {
    // Registra um novo usuário
    async registerUser(username, email, password, emailPassword, isAdmin = false) {
        // Validação de e-mail e senha
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            throw new Error(emailValidation.message);
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.message);
        }

        // Verificar se o e-mail ou nome de usuário já existe
        const existingUser = await userRepository.findUserByEmailOrUsername(email, username);
        if (existingUser) {
            throw new Error('E-mail ou nome de usuário já está em uso');
        }

        // Hash da senha
        const hashedPassword = await hashPassword(password);

        // Determinar o papel (role) do usuário
        let role = 'user';
        // Se for o primeiro usuário ou o e-mail corresponder ao admin configurado
        if (email === config.adminEmail || isAdmin) {
            role = 'admin';
        }

        // Cria o usuário no banco de dados
        const user = await userRepository.createUser(username, email, hashedPassword, emailPassword, role);
        return user;
    }

    // Faz o login do usuário
    async loginUser(identifier, password) {
        // Busca o usuário por e-mail ou nome de usuário
        const user = await userRepository.findUserByEmailOrUsername(identifier, identifier);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        // Verifica a senha
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Senha incorreta');
        }

        // Gera o token JWT (incluir o role no token)
        const token = generateToken(user.email, user.role || 'user');
        return { token, role: user.role || 'user' };
    }

    // Busca as atividades em que um usuário está inscrito
    async getUserActivities(userId) {
        const activities = await userRepository.getUserActivities(userId);
        return activities;
    }
}

module.exports = new UserService();