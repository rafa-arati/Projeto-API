const RocksDB = require('rocksdb');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

// Cria um mapa de instâncias para o padrão singleton
const dbInstances = {};

class Database {
    constructor(dbName) {
        this.dbName = dbName;
        this.dbPath = path.resolve(__dirname, '../../db_data', dbName);
        this.db = null;
        this.isOpen = false;
    }

    // Implementa o padrão singleton para garantir apenas uma instância por banco de dados
    static getInstance(dbName) {
        if (!dbInstances[dbName]) {
            dbInstances[dbName] = new Database(dbName);
        }
        return dbInstances[dbName];
    }

    // Abre o banco de dados
    async open() {
        try {
            // Se já estiver aberto, retorna
            if (this.isOpen && this.db) {
                return;
            }

            // Certifique-se de que o diretório existe
            if (!fs.existsSync(this.dbPath)) {
                console.log(`Criando diretório para o banco de dados: ${this.dbPath}`);
                fs.mkdirSync(this.dbPath, { recursive: true });
            }

            // Cria uma nova instância do banco de dados
            this.db = new RocksDB(this.dbPath);

            // Abre o banco de dados com promisify
            await new Promise((resolve, reject) => {
                this.db.open({
                    createIfMissing: true,
                    errorIfExists: false
                }, (err) => {
                    if (err) {
                        console.error(`Erro ao abrir o banco de dados ${this.dbName}:`, err);
                        this.db = null;
                        reject(err);
                    } else {
                        this.isOpen = true;
                        console.log(`Banco de dados ${this.dbName} aberto com sucesso`);
                        resolve();
                    }
                });
            });
        } catch (err) {
            console.error(`Erro ao abrir o banco de dados ${this.dbName}:`, err);
            this.isOpen = false;
            this.db = null;
            throw err;
        }
    }

    // Fecha o banco de dados
    async close() {
        try {
            if (!this.db || !this.isOpen) {
                this.isOpen = false;
                this.db = null;
                return;
            }

            await new Promise((resolve, reject) => {
                this.db.close((err) => {
                    if (err) {
                        console.error(`Erro ao fechar o banco de dados ${this.dbName}:`, err);
                        reject(err);
                    } else {
                        console.log(`Banco de dados ${this.dbName} fechado com sucesso`);
                        resolve();
                    }
                });
            });

            this.isOpen = false;
            this.db = null;
        } catch (err) {
            console.error(`Erro ao fechar o banco de dados ${this.dbName}:`, err);
            // Mesmo em caso de erro, marca como fechado
            this.isOpen = false;
            this.db = null;
        }
    }

    // Lista todos os itens no banco de dados
    async listAll() {
        await this.open();

        try {
            const items = [];

            await new Promise((resolve, reject) => {
                const iterator = this.db.iterator({});

                const next = () => {
                    iterator.next((err, key, value) => {
                        if (err) {
                            iterator.end(() => reject(err));
                            return;
                        }

                        if (!key && !value) {
                            iterator.end((endErr) => {
                                if (endErr) {
                                    reject(endErr);
                                } else {
                                    resolve();
                                }
                            });
                            return;
                        }

                        try {
                            const item = {
                                key: key.toString(),
                                value: JSON.parse(value.toString())
                            };
                            items.push(item);
                            next();
                        } catch (parseErr) {
                            console.error(`Erro ao parsear item:`, parseErr);
                            next(); // Continue mesmo com erro de parsing
                        }
                    });
                };

                next();
            });

            return items;
        } catch (error) {
            console.error(`Erro ao listar todos os itens de ${this.dbName}:`, error);
            throw error;
        }
    }

    // Insere um item no banco de dados
    async put(key, value) {
        await this.open();

        try {
            await new Promise((resolve, reject) => {
                this.db.put(key, value, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error) {
            console.error(`Erro ao inserir item em ${this.dbName}:`, error);
            throw error;
        }
    }

    // Obtém um item do banco de dados
    async get(key) {
        await this.open();

        try {
            return await new Promise((resolve, reject) => {
                this.db.get(key, (err, value) => {
                    if (err) {
                        if (err.notFound || err.type === 'NotFoundError' ||
                            err.message.includes('NotFound') ||
                            err.toString().includes('NotFound')) {
                            resolve(null);
                        } else {
                            reject(err);
                        }
                    } else {
                        resolve(value);
                    }
                });
            });
        } catch (error) {
            console.error(`Erro ao obter item de ${this.dbName}:`, error);
            throw error;
        }
    }

    // Remove um item do banco de dados
    async del(key) {
        await this.open();

        try {
            await new Promise((resolve, reject) => {
                this.db.del(key, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error) {
            console.error(`Erro ao remover item de ${this.dbName}:`, error);
            throw error;
        }
    }
}

module.exports = Database;