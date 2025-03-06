const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

// Rota para listar todas as atividades
router.get('/', authMiddleware, activityController.listActivities);

// Rota para criar uma nova atividade (apenas admin)
router.post('/', authMiddleware, isAdmin, activityController.createActivity);

// Rota para inscrever-se em uma atividade
router.post('/:activityId/register', authMiddleware, activityController.registerForActivity);

// Rota para cancelar inscrição em uma atividade
router.delete('/:activityId/cancel', authMiddleware, activityController.cancelRegistration);

// Rota para editar uma atividade (apenas admin)
router.put('/:activityId', authMiddleware, isAdmin, activityController.editActivity);

// Rota para excluir uma atividade (apenas admin)
router.delete('/:activityId', authMiddleware, isAdmin, activityController.deleteActivity);

// Rota para listar participantes de uma atividade (apenas admin)
router.get('/:activityId/participants', authMiddleware, isAdmin, activityController.getActivityParticipants);

module.exports = router;