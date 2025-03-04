const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// Rota aberta para listar todas as atividades
router.get('/', activityController.listActivities);

// Rotas protegidas - requerem autenticação
// Rotas que requerem ser admin
router.post('/', authenticate, isAdmin, activityController.createActivity);
router.put('/:activityId', authenticate, isAdmin, activityController.editActivity);
router.delete('/:activityId', authenticate, isAdmin, activityController.deleteActivity);
router.get('/:activityId/participants', authenticate, isAdmin, activityController.getActivityParticipants);

// Rotas que requerem apenas autenticação (usuário comum pode acessar)
router.post('/:activityId/register', authenticate, activityController.registerForActivity);
router.delete('/:activityId/cancel', authenticate, activityController.cancelRegistration);

module.exports = router;