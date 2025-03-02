const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rota para registro de usuário
router.post('/register', userController.register);

// Rota para login de usuário
router.post('/login', userController.login);

router.get('/activities', userController.getUserActivities);

module.exports = router;