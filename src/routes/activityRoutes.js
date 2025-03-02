const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// Rota para listar todas as atividades
router.get('/', activityController.listActivities);

// Rota para criar uma nova atividade
router.post('/', activityController.createActivity);

// Rota para inscrever-se em uma atividade
router.post('/:activityId/register', activityController.registerForActivity);

router.delete('/:activityId/cancel', activityController.cancelRegistration);

router.put('/:activityId', activityController.editActivity);

router.delete('/:activityId', activityController.deleteActivity);

router.get('/:activityId/participants', activityController.getActivityParticipants);

module.exports = router;