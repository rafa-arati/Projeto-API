const Database = require('../database/db');

class UserRepository {
    // Cria um novo usuário
    async createUser(username, email, password, emailPassword, role = 'user') {
        const db = Database.getInstance('users');
        try {
            console.log(`Criando usuário: ${username}, email: ${email}, role: ${role}`);

            // Salva o usuário pelo e-mail
            const user = { username, email, password, emailPassword, role };
            await db.put(`user:${email}`, JSON.stringify(user));

            // Salva o usuário também pelo username para facilitar a busca
            await db.put(`user:${username}`, JSON.stringify(user));

            console.log(`Usuário criado com sucesso: ${username}`);
            return user;
        } catch (error) {
            console.error(`Erro ao criar usuário ${username}:`, error);
            throw error;
        }
    }

    // Busca um usuário por e-mail ou nome de usuário
    async findUserByEmailOrUsername(email, username) {
        const db = Database.getInstance('users');
        try {
            // Tenta buscar o usuário por e-mail
            if (email) {
                const value = await db.get(`user:${email}`);
                if (value) {
                    return JSON.parse(value.toString());
                }
            }

            // Tenta buscar o usuário por nome de usuário
            if (username) {
                const value = await db.get(`user:${username}`);
                if (value) {
                    return JSON.parse(value.toString());
                }
            }

            return null; // Retorna null se o usuário não for encontrado
        } catch (error) {
            console.error(`Erro ao buscar usuário (email: ${email}, username: ${username}):`, error);
            throw error;
        }
    }

    // Busca as atividades em que um usuário está inscrito
    async getUserActivities(userId) {
        const activityDb = Database.getInstance('activities');
        try {
            console.log(`Buscando atividades para o usuário: ${userId}`);

            // Buscar todas as atividades
            const allItems = await activityDb.listAll();
            console.log(`Total de atividades no banco: ${allItems.length}`);

            // Debug: listar todas as atividades e seus participantes
            for (const item of allItems) {
                if (item.key.startsWith('activity:') && item.value && item.value.participants) {
                    console.log(`Atividade: ${item.key}, Participantes:`, item.value.participants);
                }
            }

            // Filtrar apenas atividades em que o usuário está inscrito
            const userActivities = allItems
                .filter(item => {
                    // Verifique se a chave começa com 'activity:'
                    if (!item.key.startsWith('activity:')) {
                        return false;
                    }

                    // Verifique se tem participantes e se o usuário está neles
                    const activity = item.value;

                    if (!activity || !activity.participants || !Array.isArray(activity.participants)) {
                        return false;
                    }

                    // Verificação SUPER flexível para encontrar o usuário na lista de participantes
                    for (const participantId of activity.participants) {
                        // Verificação exata
                        if (participantId === userId) {
                            console.log(`Encontrada correspondência exata para ${userId} na atividade ${item.key}`);
                            return true;
                        }

                        // Conversão para string e verificação
                        const participantStr = String(participantId);
                        const userIdStr = String(userId);

                        if (participantStr === userIdStr) {
                            console.log(`Encontrada correspondência de string para ${userId} na atividade ${item.key}`);
                            return true;
                        }

                        // Verificação parcial
                        if (participantStr.includes(userIdStr) || userIdStr.includes(participantStr)) {
                            console.log(`Encontrada correspondência parcial para ${userId} na atividade ${item.key}`);
                            console.log(`Participante: "${participantStr}", UserId: "${userIdStr}"`);
                            return true;
                        }
                    }

                    return false;
                })
                .map(item => {
                    // Certifique-se de que o ID está incluído
                    const activity = item.value;
                    if (!activity.id) {
                        activity.id = item.key;
                    }
                    return activity;
                });

            console.log(`Encontradas ${userActivities.length} atividades para o usuário ${userId}`);
            console.log("Atividades encontradas:", userActivities.map(a => a.title || a.id));

            return userActivities;
        } catch (error) {
            console.error(`Erro ao buscar atividades para o usuário ${userId}:`, error);
            return []; // Retorna array vazio em caso de erro
        }
    }
}

module.exports = new UserRepository();