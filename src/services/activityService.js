const activityRepository = require('../repositories/activityRepository');
const userRepository = require('../repositories/userRepository');
const Database = require('../database/db');

class ActivityService {
    // Lista todas as atividades
    async getAllActivities() {
        return await activityRepository.findAllActivities();
    }

    // Cria uma nova atividade
    async createActivity(title, description, date, location, maxParticipants) {
        const activity = { title, description, date, location, maxParticipants, participants: [] };
        const createdActivity = await activityRepository.createActivity(activity);
        return createdActivity;
    }

    // Inscreve um usuário em uma atividade
    async registerForActivity(activityId, userId) {
        const activity = await activityRepository.findActivityById(activityId);
        if (!activity) {
            throw new Error('Atividade não encontrada');
        }

        // Verificar se a atividade já começou
        const activityDate = new Date(activity.date);
        const now = new Date();
        if (activityDate < now) {
            throw new Error('Não é possível se inscrever em uma atividade que já começou');
        }

        // Verifica se há vagas disponíveis
        if (activity.participants && activity.participants.length >= activity.maxParticipants) {
            throw new Error('Não há vagas disponíveis');
        }

        // Verifica se o usuário já está inscrito
        const participants = activity.participants || [];
        if (participants.includes(userId)) {
            throw new Error('Usuário já está inscrito nesta atividade');
        }

        // Adiciona o usuário à lista de participantes da atividade
        participants.push(userId);
        activity.participants = participants;

        // Atualiza a atividade no banco de dados
        await activityRepository.updateActivity(activityId, activity);

        // Atualiza a lista de atividades do usuário
        await this.addActivityToUser(userId, activityId);

        return activity;
    }

    // Adiciona uma atividade à lista de atividades do usuário
    async addActivityToUser(userId, activityId) {
        try {
            const userDb = new Database('userActivities');

            await new Promise((resolve, reject) => {
                userDb.open((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Chave para armazenar a relação entre usuário e atividade
            const userActivityKey = `userActivity:${userId}:${activityId}`;

            // Salvamos a inscrição no banco de dados
            await new Promise((resolve, reject) => {
                userDb.put(userActivityKey, JSON.stringify({ userId, activityId, registeredAt: new Date().toISOString() }), (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Fechamos o banco de dados
            await new Promise((resolve) => {
                userDb.close((err) => {
                    if (err) console.error('Erro ao fechar o banco de dados de atividades do usuário:', err);
                    resolve();
                });
            });

        } catch (error) {
            console.error('Erro ao adicionar atividade ao usuário:', error);
            throw error;
        }
    }

    // Remove uma atividade da lista de atividades do usuário
    async removeActivityFromUser(userId, activityId) {
        try {
            const userDb = new Database('userActivities');

            await new Promise((resolve, reject) => {
                userDb.open((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Chave para armazenar a relação entre usuário e atividade
            const userActivityKey = `userActivity:${userId}:${activityId}`;

            // Removemos a inscrição do banco de dados
            await new Promise((resolve, reject) => {
                userDb.del(userActivityKey, (err) => {
                    if (err) {
                        if (err.notFound || err.type === 'NotFoundError') {
                            // Se não encontrar, não é um erro crítico
                            resolve();
                        } else {
                            reject(err);
                        }
                    } else {
                        resolve();
                    }
                });
            });

            // Fechamos o banco de dados
            await new Promise((resolve) => {
                userDb.close((err) => {
                    if (err) console.error('Erro ao fechar o banco de dados de atividades do usuário:', err);
                    resolve();
                });
            });

        } catch (error) {
            console.error('Erro ao remover atividade do usuário:', error);
            throw error;
        }
    }

    // Cancela a inscrição de um usuário em uma atividade
    async cancelRegistration(activityId, userId) {
        // Busca a atividade
        const activity = await activityRepository.findActivityById(activityId);
        if (!activity) {
            throw new Error('Atividade não encontrada');
        }

        // Verificar se a atividade já começou
        const activityDate = new Date(activity.date);
        const now = new Date();
        if (activityDate < now) {
            throw new Error('Não é possível cancelar inscrição em uma atividade que já começou');
        }

        // Verifica se o usuário está inscrito
        const participants = activity.participants || [];
        if (!participants.includes(userId)) {
            throw new Error('Usuário não está inscrito nesta atividade');
        }

        // Remove o usuário da lista de participantes
        activity.participants = participants.filter(id => id !== userId);

        // Atualiza a atividade no banco de dados
        await activityRepository.updateActivity(activityId, activity);

        // Remove a atividade da lista de atividades do usuário
        await this.removeActivityFromUser(userId, activityId);

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

        // Remove a inscrição de todos os participantes
        if (activity.participants && activity.participants.length > 0) {
            for (const userId of activity.participants) {
                await this.removeActivityFromUser(userId, activityId);
            }
        }

        await activityRepository.deleteActivity(activityId);
    }

    // Busca os participantes de uma atividade
    async getActivityParticipants(activityId) {
        return await activityRepository.getActivityParticipants(activityId);
    }
}

module.exports = new ActivityService();