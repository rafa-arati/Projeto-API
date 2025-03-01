const express = require('express');
const router = express.Router();

// Função temporária para registro de usuário
router.post('/register', (req, res) => {
    res.status(201).json({ message: 'Usuário registrado com sucesso (simulado)' });
});

// Função temporária para login de usuário
router.post('/login', (req, res) => {
    res.status(200).json({ message: 'Login realizado com sucesso (simulado)', token: 'token_simulado' });
});

// Função temporária para logout de usuário
router.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logout realizado com sucesso (simulado)' });
});

// Função temporária para renovação de token
router.post('/refresh-token', (req, res) => {
    res.status(200).json({ message: 'Token renovado com sucesso (simulado)', token: 'novo_token_simulado' });
});

// Função temporária para visualizar atividades do usuário
router.get('/activities', (req, res) => {
    res.status(200).json({ 
        message: 'Atividades do usuário (simulado)',
        activities: [
            { id: 1, title: 'Atividade teste numero um' },
            { id: 2, title: 'Atividade teste numero dois' }
        ]
    });
});

module.exports = router;