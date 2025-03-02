const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const activityRoutes = require('./activityRoutes');

// Rotas de usuários
router.use('/users', userRoutes);

// Rotas de atividades
router.use('/activities', activityRoutes);

module.exports = router;