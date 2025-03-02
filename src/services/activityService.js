const activityRepository = require('../repositories/activityRepository');

class ActivityService {
    // Lista todas as atividades
    async getAllActivities() {
        return await activityRepository.findAllActivities();
    }

    // Cria uma nova atividade
    async createActivity(title, description, date, location, maxParticipants) {
        const activity = { title, description, date, location, maxParticipants };
        const createdActivity = await activityRepository.createActivity(activity);
        return createdActivity;
    }

    // Inscreve um usuário em uma atividade
    async registerForActivity(activityId, userId) {
        const activity = await activityRepository.findActivityById(activityId);
        if (!activity) {
            throw new Error('Atividade não encontrada');
        }

        // Verifica se há vagas disponíveis
        if (activity.participants && activity.participants.length >= activity.maxParticipants) {
            throw new Error('Não há vagas disponíveis');
        }

        // Adiciona o usuário à lista de participantes
        const participants = activity.participants || [];
        if (!participants.includes(userId)) {
            participants.push(userId);
            activity.participants = participants;

            // Atualiza a atividade no banco de dados
            await activityRepository.updateActivity(activityId, activity);
        }

        return activity;
    }

    // Cancela a inscrição de um usuário em uma atividade
    async cancelRegistration(activityId, userId) {
        const activity = await activityRepository.findActivityById(activityId);
        if (!activity) {
            throw new Error('Atividade não encontrada');
        }

        const participants = activity.participants.filter(id => id !== userId);
        activity.participants = participants;

        await activityRepository.updateActivity(activityId, activity);
        return activity;
    }

    // Edita uma atividade existente
    async editActivity(activityId, updates) {
        const activity = await activityRepository.findActivityById(activityId);
        if (!activity) {
            throw new Error('Atividade não encontrada');
        }

        const updatedActivity = { ...activity, ...updates };
        await activityRepository.updateActivity(activityId, updatedActivity);
        return updatedActivity;
    }

    // Exclui uma atividade
    async deleteActivity(activityId) {
        const activity = await activityRepository.findActivityById(activityId);
        if (!activity) {
            throw new Error('Atividade não encontrada');
        }

        await activityRepository.deleteActivity(activityId);
    }

    // Busca os participantes de uma atividade
    async getActivityParticipants(activityId) {
        return await activityRepository.getActivityParticipants(activityId);
    }
}

module.exports = new ActivityService();