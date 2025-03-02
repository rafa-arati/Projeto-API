const userService = require('../services/userService');

class UserController {
    // Registra um novo usuário
    async register(req, res) {
        try {
            const { username, email, password, emailPassword } = req.body;

            // Validação básica
            if (!username || !email || !password || !emailPassword) {
                return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
            }

            // Chama o service para registrar o usuário
            const user = await userService.registerUser(username, email, password, emailPassword);

            res.status(201).json({ message: 'Usuário registrado com sucesso', user });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Faz o login do usuário
    async login(req, res) {
        try {
            const { identifier, password } = req.body;

            // Validação básica
            if (!identifier || !password) {
                return res.status(400).json({ message: 'E-mail/nome de usuário e senha são obrigatórios' });
            }

            // Chama o service para fazer login
            const token = await userService.loginUser(identifier, password);

            res.status(200).json({ message: 'Login realizado com sucesso', token });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getUserActivities(req, res) {
        try {
            const { userId } = req.body;

            const activities = await userService.getUserActivities(userId);
            res.status(200).json({ activities });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new UserController();