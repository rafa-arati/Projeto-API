const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Rota para registro de usuário
router.post('/register', userController.register);

// Rota para login de usuário
router.post('/login', userController.login);

// Rota para buscar atividades do usuário (requer autenticação)
router.get('/activities', authMiddleware, userController.getUserActivities);

module.exports = router;