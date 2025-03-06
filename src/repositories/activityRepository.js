const Database = require('../database/db');

class ActivityRepository {
    // Lista todas as atividades
    async findAllActivities() {
        const db = Database.getInstance('activities');
        try {
            console.log('Buscando todas as atividades');
            const activities = [];

            const allItems = await db.listAll();

            for (const item of allItems) {
                if (item.key.toString().startsWith('activity:')) {
                    try {
                        const activity = item.value;
                        // Garanta que o ID esteja no objeto
                        if (!activity.id) {
                            activity.id = item.key;
                        }
                        activities.push(activity);
                    } catch (e) {
                        console.error("Erro ao processar atividade:", e);
                    }
                }
            }

            console.log(`Encontradas ${activities.length} atividades`);
            return activities;
        } catch (error) {
            console.error("Erro ao listar atividades:", error);
            throw error;
        } finally {
            await db.close();
        }
    }

    // Cria uma nova atividade
    async createActivity(activity) {
        const db = Database.getInstance('activities');
        try {
            const timestamp = Date.now();
            const activityId = `activity:${timestamp}`;

            // Adicione o ID ao objeto da atividade
            const activityWithId = {
                ...activity,
                id: activityId
            };

            console.log(`Criando atividade com ID: ${activityId}`, activityWithId);

            // Salve a atividade
            await db.put(activityId, JSON.stringify(activityWithId));

            return activityWithId;
        } catch (error) {
            console.error("Erro ao criar atividade:", error);
            throw error;
        } finally {
            await db.close();
        }
    }

    // Busca uma atividade pelo ID
    async findActivityById(activityId) {
        const db = Database.getInstance('activities');
        try {
            // Garantir que estamos tratando strings
            activityId = String(activityId);

            // Garanta que o ID tenha o formato correto
            const fullActivityId = activityId.startsWith('activity:')
                ? activityId
                : `activity:${activityId}`;

            console.log(`Buscando atividade com ID: ${fullActivityId}`);

            const value = await db.get(fullActivityId);

            if (!value) {
                console.log(`Atividade não encontrada: ${fullActivityId}`);
                return null;
            }

            try {
                const activity = JSON.parse(value.toString());
                console.log(`Atividade encontrada:`, activity);

                // Garanta que o ID esteja no objeto
                if (!activity.id) {
                    activity.id = fullActivityId;
                }
                return activity;
            } catch (e) {
                console.error(`Erro ao parsear atividade ${fullActivityId}:`, e);
                throw e;
            }
        } catch (error) {
            console.error(`Erro ao buscar atividade por ID ${activityId}:`, error);
            throw error;
        } finally {
            await db.close();
        }
    }

    // Atualiza uma atividade
    async updateActivity(activityId, activity) {
        const db = Database.getInstance('activities');
        try {
            // Garantir que estamos tratando strings
            activityId = String(activityId);

            const fullActivityId = activityId.startsWith('activity:')
                ? activityId
                : `activity:${activityId}`;

            console.log(`Atualizando atividade com ID: ${fullActivityId}`, activity);

            // Assegure-se de que o ID está no objeto antes de salvar
            const activityToSave = {
                ...activity,
                id: fullActivityId
            };

            await db.put(fullActivityId, JSON.stringify(activityToSave));
            return activityToSave;
        } catch (error) {
            console.error(`Erro ao atualizar atividade ${activityId}:`, error);
            throw error;
        } finally {
            await db.close();
        }
    }

    // Exclui uma atividade
    async deleteActivity(activityId) {
        const db = Database.getInstance('activities');
        try {
            // Garantir que estamos tratando strings
            activityId = String(activityId);

            const fullActivityId = activityId.startsWith('activity:')
                ? activityId
                : `activity:${activityId}`;

            console.log(`Excluindo atividade com ID: ${fullActivityId}`);

            await db.del(fullActivityId);
            console.log(`Atividade excluída: ${fullActivityId}`);
        } catch (error) {
            console.error(`Erro ao excluir atividade ${activityId}:`, error);
            throw error;
        } finally {
            await db.close();
        }
    }

    // Busca os participantes de uma atividade
    async getActivityParticipants(activityId) {
        try {
            const activity = await this.findActivityById(activityId);
            if (!activity) {
                throw new Error('Atividade não encontrada');
            }

            return activity.participants || [];
        } catch (error) {
            console.error(`Erro ao buscar participantes da atividade ${activityId}:`, error);
            throw error;
        }
    }

    // Inscreve um usuário em uma atividade
    async registerForActivity(activityId, userId) {
        const db = Database.getInstance('activities');
        try {
            const activity = await this.findActivityById(activityId);
            if (!activity) {
                throw new Error('Atividade não encontrada');
            }

            // Verifica se há vagas disponíveis
            const participants = activity.participants || [];
            if (participants.length >= activity.maxParticipants) {
                throw new Error('Não há vagas disponíveis');
            }

            // Adiciona o usuário à lista de participantes
            participants.push(userId);
            activity.participants = participants;

            // Atualiza a atividade no banco de dados
            await db.put(activity.id, JSON.stringify(activity));

            console.log(`Usuário ${userId} inscrito na atividade ${activityId}`);

            return activity;
        } catch (error) {
            console.error(`Erro ao registrar usuário ${userId} para atividade ${activityId}:`, error);
            throw error;
        } finally {
            await db.close();
        }
    }

    // Cancela a inscrição de um usuário em uma atividade
    async cancelRegistration(activityId, userId) {
        const db = Database.getInstance('activities');
        try {
            const activity = await this.findActivityById(activityId);
            if (!activity) {
                throw new Error('Atividade não encontrada');
            }

            // Remove o usuário da lista de participantes
            const participants = activity.participants || [];
            activity.participants = participants.filter(id => id !== userId);

            // Atualiza a atividade no banco de dados
            await db.put(activity.id, JSON.stringify(activity));

            console.log(`Inscrição do usuário ${userId} cancelada para atividade ${activityId}`);

            return activity;
        } catch (error) {
            console.error(`Erro ao cancelar inscrição do usuário ${userId} na atividade ${activityId}:`, error);
            throw error;
        } finally {
            await db.close();
        }
    }
}

module.exports = new ActivityRepository();