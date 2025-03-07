const userService = require('../services/userService');
const { validateEmail, validatePassword } = require('../utils/validation');

class UserController {
    // Registra um novo usuário
    async register(req, res) {
        try {
            const { username, email, password, emailPassword, role } = req.body;

            // Agora emailPassword é usado como confirmação de senha
            const confirmPassword = emailPassword;

            // Log para debug
            console.log('Registrando usuário:', { username, email, role });

            // Validação básica
            if (!username || !email || !password || !confirmPassword) {
                return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
            }

            const emailValidation = validateEmail(email);
            if (!emailValidation.valid) {
                return res.status(400).json({ message: emailValidation.message });
            }

            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                return res.status(400).json({ message: passwordValidation.message });
            }

            // Verificar se as senhas coincidem
            if (password !== confirmPassword) {
                return res.status(400).json({ message: 'As senhas não coincidem' });
            }

            // VERIFICAÇÃO PARA ADMIN: Se o email for admin@example.com, define role como admin
            let userRole = role;
            if (email === 'admin@example.com') {
                userRole = 'admin';
                console.log('Criando usuário com privilégios de ADMINISTRADOR');
            } else {
                userRole = 'user';
            }

            // Chama o service para registrar o usuário com a role correta
            const user = await userService.registerUser(username, email, password, confirmPassword, userRole);

            // Remover a senha do objeto retornado
            const userResponse = { ...user };
            delete userResponse.password;
            delete userResponse.emailPassword;

            res.status(201).json({ message: 'Usuário registrado com sucesso', user: userResponse });
        } catch (error) {
            console.error('Erro no cadastro de usuário:', error);
            if (error.message.includes('já está em uso')) {
                return res.status(409).json({ message: error.message });
            }
            res.status(500).json({
                message: 'Erro ao registrar usuário',
                error: error.message
            });
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
            console.error('Erro no login:', error);
            if (error.message.includes('não encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('incorreta')) {
                return res.status(401).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }

    // Busca as atividades em que o usuário está inscrito
    async getUserActivities(req, res) {
        try {
            // Obter o ID do usuário do token JWT (adicionado pelo middleware de autenticação)
            const userId = req.userId;

            console.log(`Buscando atividades para o usuário autenticado: ${userId}`);

            if (!userId) {
                return res.status(400).json({ message: 'ID do usuário não fornecido' });
            }

            const activities = await userService.getUserActivities(userId);
            console.log(`Retornando ${activities.length} atividades para o usuário ${userId}`);

            res.status(200).json({ activities });
        } catch (error) {
            console.error('Erro ao buscar atividades do usuário:', error);
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new UserController();