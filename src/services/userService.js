const userRepository = require('../repositories/userRepository');
const hashPassword = require('../utils/hashPassword');
const comparePassword = require('../utils/comparePassword');
const { generateToken } = require('../utils/jwtUtils');

class UserService {
    // Registra um novo usuário
    async registerUser(username, email, password, emailPassword) {
        // Verifica se o e-mail ou nome de usuário já existe
        const existingUser = await userRepository.findUserByEmailOrUsername(email, username);
        if (existingUser) {
            throw new Error('E-mail ou nome de usuário já está em uso');
        }

        // Hash da senha
        const hashedPassword = await hashPassword(password);

        // Cria o usuário no banco de dados
        const user = await userRepository.createUser(username, email, hashedPassword, emailPassword);
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

        // Gera o token JWT
        const token = generateToken(user.email); // Usamos o e-mail como identificador único
        return token;
    }

    async getUserActivities(userId) {
        const activities = await userRepository.getUserActivities(userId);
        return activities;
    }
}

module.exports = new UserService();