const Database = require('../database/db');
const db = new Database('users'); // Cria uma instância do banco de dados para usuários

class UserRepository {
    // Cria um novo usuário
    async createUser(username, email, password, emailPassword) {
        try {
            // Abre o banco de dados
            await new Promise((resolve, reject) => {
                db.open((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            // Salva o usuário no banco de dados
            const user = { username, email, password, emailPassword };
            await new Promise((resolve, reject) => {
                db.put(`user:${email}`, JSON.stringify(user), (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            return user;
        } catch (error) {
            throw error;
        }
    }

    // Busca um usuário por e-mail ou nome de usuário
    async findUserByEmailOrUsername(email, username) {
        try {
            // Abre o banco de dados
            await new Promise((resolve, reject) => {
                db.open((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            // Tenta buscar o usuário por e-mail
            try {
                const userByEmail = await new Promise((resolve, reject) => {
                    db.get(`user:${email}`, (err, value) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(value);
                        }
                    });
                });

                if (userByEmail) {
                    return JSON.parse(userByEmail);
                }
            } catch (err) {
                // Ignora se o usuário não for encontrado por e-mail
            }

            // Tenta buscar o usuário por nome de usuário
            try {
                const userByUsername = await new Promise((resolve, reject) => {
                    db.get(`user:${username}`, (err, value) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(value);
                        }
                    });
                });

                if (userByUsername) {
                    return JSON.parse(userByUsername);
                }
            } catch (err) {
                // Ignora se o usuário não for encontrado por nome de usuário
            }

            return null; // Retorna null se o usuário não for encontrado
        } catch (error) {
            throw error;
        }
    }

    // Busca as atividades em que um usuário está inscrito
    async getUserActivities(userId) {
        try {
            // Abre o banco de dados
            await new Promise((resolve, reject) => {
                db.open((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            try {
                // Primeiro, verificamos se o usuário tem uma lista de atividades
                const userActivitiesKey = `userActivities:${userId}`;

                const activities = await new Promise((resolve, reject) => {
                    db.get(userActivitiesKey, (err, value) => {
                        if (err) {
                            if (err.notFound || err.type === 'NotFoundError') {
                                // Se não existir, retornamos um array vazio
                                resolve([]);
                            } else {
                                reject(err);
                            }
                        } else {
                            try {
                                // Tenta fazer o parse do valor JSON
                                const parsedValue = JSON.parse(value);
                                resolve(parsedValue);
                            } catch (parseErr) {
                                // Se houver erro ao fazer o parse, retorna um array vazio
                                console.error('Erro ao fazer parse do JSON:', parseErr);
                                resolve([]);
                            }
                        }
                    });
                });

                // Se encontramos atividades, retornamos elas
                if (activities && activities.length > 0) {
                    return activities;
                }

                // Caso alternativo: buscar atividades diretamente pelo iterator
                // Como não temos createReadStream, vamos usar o método iterator
                const activityIds = [];

                // Abrir um iterator para buscar todas as chaves que começam com o formato 'userActivity:userId:'
                const iterator = db.iterator({
                    gte: `userActivity:${userId}:`,
                    lte: `userActivity:${userId}:\xFF`
                });

                // Função para iterar de forma assíncrona
                const iterateNext = () => {
                    return new Promise((resolve, reject) => {
                        iterator.next((err, key, value) => {
                            if (err) return reject(err);
                            if (!key) return resolve(null); // Fim da iteração

                            // Se encontrou uma chave, extrair o ID da atividade
                            const keyStr = key.toString();
                            const parts = keyStr.split(':');
                            if (parts.length >= 3) {
                                const activityId = parts[2];
                                activityIds.push(activityId);
                            }

                            resolve(true); // Continuar iteração
                        });
                    });
                };

                // Iterar sobre todas as chaves
                let hasNext = true;
                while (hasNext) {
                    const result = await iterateNext();
                    if (result === null) {
                        hasNext = false;
                    }
                }

                // Fechar o iterator após o uso
                await new Promise((resolve, reject) => {
                    iterator.end((err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                // Agora que temos os IDs das atividades, vamos buscar cada uma delas
                const activityDb = new Database('activities');
                await new Promise((resolve, reject) => {
                    activityDb.open((err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                const activityDetails = [];
                for (const activityId of activityIds) {
                    try {
                        const activityData = await new Promise((resolve, reject) => {
                            activityDb.get(activityId, (err, value) => {
                                if (err) {
                                    if (err.notFound || err.type === 'NotFoundError') {
                                        resolve(null);
                                    } else {
                                        reject(err);
                                    }
                                } else {
                                    try {
                                        const parsed = JSON.parse(value);
                                        resolve({
                                            id: activityId,
                                            ...parsed
                                        });
                                    } catch (parseErr) {
                                        console.error('Erro ao fazer parse da atividade:', parseErr);
                                        resolve(null);
                                    }
                                }
                            });
                        });

                        if (activityData) {
                            activityDetails.push(activityData);
                        }
                    } catch (err) {
                        console.error(`Erro ao buscar atividade ${activityId}:`, err);
                    }
                }

                // Fechar o banco de dados de atividades
                await new Promise((resolve) => {
                    activityDb.close((err) => {
                        if (err) console.error('Erro ao fechar o banco de dados de atividades:', err);
                        resolve();
                    });
                });

                return activityDetails;
            } catch (error) {
                return []; // Retorna array vazio em caso de erro
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UserRepository();