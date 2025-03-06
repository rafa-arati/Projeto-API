const activityService = require('../services/activityService');

class ActivityController {
    // Lista todas as atividades
    async listActivities(req, res) {
        try {
            const activities = await activityService.getAllActivities();
            res.status(200).json({ activities });
        } catch (error) {
            console.error("Erro ao listar atividades:", error);
            res.status(500).json({ message: error.message });
        }
    }

    // Cria uma nova atividade
    async createActivity(req, res) {
        try {
            const { title, description, date, location, maxParticipants } = req.body;

            // Validação básica
            if (!title || !description || !location || !maxParticipants) {
                return res.status(400).json({ message: 'Os campos título, descrição, local e número máximo de participantes são obrigatórios' });
            }

            // A data é opcional - se não for fornecida, o serviço usará uma data futura
            const activity = await activityService.createActivity(title, description, date, location, maxParticipants);

            res.status(201).json({
                message: 'Atividade criada com sucesso',
                activity: activity
            });
        } catch (error) {
            console.error('Controller - Erro ao criar atividade:', error);
            res.status(500).json({ message: error.message });
        }
    }

    // Inscreve um usuário em uma atividade
    async registerForActivity(req, res) {
        try {
            const { activityId } = req.params;
            const { userId } = req.body;

            if (!activityId || !userId) {
                return res.status(400).json({ message: 'ID da atividade e ID do usuário são obrigatórios' });
            }

            console.log(`Tentando registrar usuário ${userId} na atividade ${activityId}`);

            const registration = await activityService.registerForActivity(activityId, userId);
            res.status(200).json({ message: 'Inscrição realizada com sucesso', registration });
        } catch (error) {
            console.error("Erro ao registrar para atividade:", error);

            // Erros específicos com códigos HTTP adequados
            if (error.message.includes('Atividade não encontrada')) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('já está inscrito')) {
                return res.status(400).json({ message: error.message });
            }
            if (error.message.includes('já começou')) {
                return res.status(400).json({ message: error.message });
            }
            if (error.message.includes('vagas disponíveis')) {
                return res.status(400).json({ message: error.message });
            }

            res.status(500).json({ message: error.message });
        }
    }

    // Cancela a inscrição de um usuário em uma atividade
    async cancelRegistration(req, res) {
        try {
            const { activityId } = req.params;
            const { userId } = req.body;

            if (!activityId || !userId) {
                return res.status(400).json({ message: 'ID da atividade e ID do usuário são obrigatórios' });
            }

            console.log(`Tentando cancelar registro do usuário ${userId} na atividade ${activityId}`);

            const result = await activityService.cancelRegistration(activityId, userId);
            res.status(200).json({ message: 'Inscrição cancelada com sucesso', result });
        } catch (error) {
            console.error("Erro ao cancelar inscrição:", error);

            if (error.message.includes('Atividade não encontrada')) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('não está inscrito')) {
                return res.status(400).json({ message: error.message });
            }
            if (error.message.includes('já começou')) {
                return res.status(400).json({ message: error.message });
            }

            res.status(500).json({ message: error.message });
        }
    }

    // Edita uma atividade existente
    async editActivity(req, res) {
        try {
            const { activityId } = req.params;

            if (!activityId) {
                return res.status(400).json({ message: 'ID da atividade é obrigatório' });
            }

            const updates = req.body;
            console.log(`Tentando editar atividade ${activityId}`, updates);

            const updatedActivity = await activityService.editActivity(activityId, updates);
            res.status(200).json({ message: 'Atividade atualizada com sucesso', updatedActivity });
        } catch (error) {
            console.error("Erro ao editar atividade:", error);

            if (error.message.includes('Atividade não encontrada')) {
                return res.status(404).json({ message: error.message });
            }

            res.status(500).json({ message: error.message });
        }
    }

    // Exclui uma atividade
    async deleteActivity(req, res) {
        try {
            const { activityId } = req.params;

            if (!activityId) {
                return res.status(400).json({ message: 'ID da atividade é obrigatório' });
            }

            console.log(`Tentando excluir atividade ${activityId}`);

            await activityService.deleteActivity(activityId);
            res.status(200).json({ message: 'Atividade excluída com sucesso' });
        } catch (error) {
            console.error("Erro ao excluir atividade:", error);

            if (error.message.includes('Atividade não encontrada')) {
                return res.status(404).json({ message: error.message });
            }

            res.status(500).json({ message: error.message });
        }
    }

    // Busca os participantes de uma atividade
    async getActivityParticipants(req, res) {
        try {
            const { activityId } = req.params;

            if (!activityId) {
                return res.status(400).json({ message: 'ID da atividade é obrigatório' });
            }

            console.log(`Buscando participantes da atividade ${activityId}`);

            const participants = await activityService.getActivityParticipants(activityId);
            res.status(200).json({ participants });
        } catch (error) {
            console.error("Erro ao buscar participantes:", error);

            if (error.message.includes('Atividade não encontrada')) {
                return res.status(404).json({ message: error.message });
            }

            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new ActivityController();