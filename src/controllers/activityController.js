const activityService = require('../services/activityService');
const { validateActivity } = require('../utils/validation');

class ActivityController {
    // Lista todas as atividades
    async listActivities(req, res) {
        try {
            const activities = await activityService.getAllActivities();
            res.status(200).json({ activities });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Cria uma nova atividade
    async createActivity(req, res) {
        try {
            const { title, description, date, location, maxParticipants } = req.body;

            // Validação básica
            if (!title || !description || !date || !location || !maxParticipants) {
                return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
            }

            // Validação mais completa com o utilitário
            const activityData = { title, description, date, location, maxParticipants };
            const validation = validateActivity(activityData);
            if (!validation.valid) {
                return res.status(400).json({ message: validation.errors.join(', ') });
            }

            // Cria a atividade após as validações
            const activity = await activityService.createActivity(title, description, date, location, maxParticipants);

            res.status(201).json({
                message: 'Atividade criada com sucesso',
                activity: activity
            });
        } catch (error) {
            console.log('Controller - Erro:', error);
            res.status(500).json({ message: error.message });
        }
    }

    // Inscreve um usuário em uma atividade
    async registerForActivity(req, res) {
        try {
            const { activityId } = req.params;
            const userId = req.userId; // Usar o ID do usuário autenticado

            if (!activityId) {
                return res.status(400).json({ message: 'ID da atividade é obrigatório' });
            }

            const registration = await activityService.registerForActivity(activityId, userId);
            res.status(200).json({ message: 'Inscrição realizada com sucesso', registration });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Cancela a inscrição de um usuário em uma atividade
    async cancelRegistration(req, res) {
        try {
            const { activityId } = req.params;
            const userId = req.userId; // Usar o ID do usuário autenticado

            const result = await activityService.cancelRegistration(activityId, userId);
            res.status(200).json({ message: 'Inscrição cancelada com sucesso', result });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Edita uma atividade existente
    async editActivity(req, res) {
        try {
            const { activityId } = req.params;
            const { title, description, date, location, maxParticipants } = req.body;

            const updatedActivity = await activityService.editActivity(activityId, { title, description, date, location, maxParticipants });
            res.status(200).json({ message: 'Atividade atualizada com sucesso', updatedActivity });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Exclui uma atividade
    async deleteActivity(req, res) {
        try {
            const { activityId } = req.params;

            await activityService.deleteActivity(activityId);
            res.status(200).json({ message: 'Atividade excluída com sucesso' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Busca os participantes de uma atividade
    async getActivityParticipants(req, res) {
        try {
            const { activityId } = req.params;

            const participants = await activityService.getActivityParticipants(activityId);
            res.status(200).json({ participants });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new ActivityController();