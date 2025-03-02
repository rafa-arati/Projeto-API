const Database = require('../database/db');
const db = new Database('activities'); // Cria uma instância do banco de dados para atividades

// Função utilitária para abrir o banco de dados e executar uma operação
async function withDB(callback) {
    await new Promise((resolve, reject) => {
        db.open((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    return await callback();
}

class ActivityRepository {
    // Lista todas as atividades
    async findAllActivities() {
        try {
            await new Promise((resolve, reject) => {
                db.open((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            const activities = [];

            return new Promise((resolve, reject) => {
                const iterator = db.iterator({});

                const loop = () => {
                    iterator.next((err, key, value) => {
                        if (err) {
                            iterator.end(() => reject(err));
                            return;
                        }

                        if (!key && !value) {
                            iterator.end(() => {
                                resolve(activities);
                            });
                            return;
                        }

                        if (key.toString().startsWith('activity:')) {
                            try {
                                const activity = JSON.parse(value.toString());
                                // Garanta que o ID esteja no objeto
                                if (!activity.id) {
                                    activity.id = key.toString();
                                }
                                activities.push(activity);
                            } catch (e) {
                                console.error("Erro ao parsear atividade:", e);
                            }
                        }

                        loop();
                    });
                };

                loop();
            });
        } catch (error) {
            console.error("Erro ao listar atividades:", error);
            throw error;
        }
    }

    // Cria uma nova atividade
    async createActivity(activity) {
        try {
            const timestamp = Date.now();
            const activityId = `activity:${timestamp}`;

            // Adicione o ID ao objeto da atividade
            const activityWithId = {
                ...activity,
                id: activityId
            };

            // Abra o banco de dados
            await new Promise((resolve, reject) => {
                db.open((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Salve a atividade
            await new Promise((resolve, reject) => {
                db.put(activityId, JSON.stringify(activityWithId), (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            return activityWithId;
        } catch (error) {
            console.error("Erro ao criar atividade:", error);
            throw error;
        }
    }

    // Inscreve um usuário em uma atividade
    async registerForActivity(activityId, userId) {
        return await withDB(async () => {
            const activity = await this.findActivityById(activityId);
            if (!activity) {
                throw new Error('Atividade não encontrada');
            }

            // Verifica se há vagas disponíveis
            if (activity.participants && activity.participants.length >= activity.maxParticipants) {
                throw new Error('Não há vagas disponíveis');
            }

            // Adiciona o usuário à lista de participantes
            const participants = activity.participants || [];
            participants.push(userId);
            activity.participants = participants;

            // Atualiza a atividade no banco de dados
            await this.updateActivity(activityId, activity);
            return activity;
        });
    }

    // Busca uma atividade pelo ID
    async findActivityById(activityId) {
        try {
            // Garanta que o ID tenha o formato correto
            const fullActivityId = activityId.startsWith('activity:') 
                ? activityId 
                : `activity:${activityId}`;
            
            await new Promise((resolve, reject) => {
                db.open((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            return new Promise((resolve, reject) => {
                db.get(fullActivityId, (err, value) => {
                    if (err) {
                        if (err.notFound) {
                            resolve(null);
                        } else {
                            console.error("Erro ao buscar atividade:", err);
                            reject(err);
                        }
                    } else {
                        try {
                            const activity = JSON.parse(value.toString());
                            // Garanta que o ID esteja no objeto
                            if (!activity.id) {
                                activity.id = fullActivityId;
                            }
                            resolve(activity);
                        } catch (e) {
                            console.error("Erro ao parsear atividade:", e);
                            reject(e);
                        }
                    }
                });
            });
        } catch (error) {
            console.error("Erro ao buscar atividade por ID:", error);
            throw error;
        }
    }

    // Atualiza uma atividade
    async updateActivity(activityId, activity) {
        return await withDB(async () => {
            const fullActivityId = activityId.startsWith('activity:')
                ? activityId
                : `activity:${activityId}`;

            await new Promise((resolve, reject) => {
                db.put(fullActivityId, JSON.stringify(activity), (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    // Exclui uma atividade
    async deleteActivity(activityId) {
        return await withDB(async () => {
            const fullActivityId = activityId.startsWith('activity:')
                ? activityId
                : `activity:${activityId}`;

            await new Promise((resolve, reject) => {
                db.del(fullActivityId, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }

    // Busca os participantes de uma atividade
    async getActivityParticipants(activityId) {
        return await withDB(async () => {
            const activity = await this.findActivityById(activityId);
            if (!activity) {
                throw new Error('Atividade não encontrada');
            }

            return activity.participants || [];
        });
    }
}

module.exports = new ActivityRepository();