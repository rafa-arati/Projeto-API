const userRepository = require('../repositories/userRepository');
const hashPassword = require('../utils/hashPassword');
const comparePassword = require('../utils/comparePassword');
const { generateToken } = require('../utils/jwtUtils');

class UserService {
    // Registra um novo usuário
    async registerUser(username, email, password, emailPassword, role = 'user') {
        // Nota: emailPassword agora é usado como confirmação de senha,
        // mas mantemos o nome do parâmetro por compatibilidade.
        // A validação de que as senhas coincidem é feita no controller.

        // Verifica se o e-mail ou nome de usuário já existe
        const existingUser = await userRepository.findUserByEmailOrUsername(email, username);
        if (existingUser) {
            throw new Error('E-mail ou nome de usuário já está em uso');
        }

        // Hash da senha
        const hashedPassword = await hashPassword(password);

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

        console.log(`Usuário logado com sucesso: ${user.email}, role: ${user.role}`);

        // Gera o token JWT com o role do usuário e o username
        const token = generateToken(user.email, user.username, user.role);
        return token;
    }

    // Busca as atividades em que o usuário está inscrito
    async getUserActivities(userId) {
        console.log(`Buscando atividades para o usuário: ${userId}`);

        // Obter as atividades
        const activities = await userRepository.getUserActivities(userId);

        console.log(`Retornando ${activities.length} atividades para o usuário ${userId}`);
        return activities;
    }
}

module.exports = new UserService();