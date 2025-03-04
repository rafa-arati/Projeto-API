const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');

// Rotas abertas
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rotas protegidas - mais RESTful
router.get('/me/activities', authenticate, userController.getUserActivities);

module.exports = router;