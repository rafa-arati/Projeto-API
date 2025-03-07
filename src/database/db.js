const RocksDB = require('rocksdb');
const path = require('path');
const fs = require('fs');

// Cache global para instâncias do banco de dados
const dbInstances = {};

class Database {
    constructor(dbName) {
        this.dbName = dbName;
        this.dbPath = path.resolve(__dirname, '../../db_data', dbName);
        this.db = null;

        // Garantir que o diretório existe
        if (!fs.existsSync(this.dbPath)) {
            try {
                fs.mkdirSync(this.dbPath, { recursive: true });
                console.log(`Diretório criado: ${this.dbPath}`);
            } catch (err) {
                console.error(`Erro ao criar diretório ${this.dbPath}:`, err);
            }
        }
    }

    /**
     * Abre ou recupera uma conexão com o banco de dados
     */
    async open() {
        try {
            // Se já temos uma instância no cache, usamos ela
            if (dbInstances[this.dbName] && dbInstances[this.dbName].isOpen) {
                this.db = dbInstances[this.dbName].db;
                return;
            }

            // Criar nova instância
            this.db = new RocksDB(this.dbPath);

            // Abrir conexão
            await new Promise((resolve, reject) => {
                this.db.open({
                    createIfMissing: true,
                    errorIfExists: false
                }, (err) => {
                    if (err) {
                        console.error(`Erro ao abrir banco de dados ${this.dbName}:`, err);
                        reject(err);
                    } else {
                        console.log(`Banco de dados ${this.dbName} aberto com sucesso`);

                        // Armazenar no cache global
                        dbInstances[this.dbName] = {
                            db: this.db,
                            isOpen: true
                        };

                        resolve();
                    }
                });
            });
        } catch (err) {
            console.error(`Erro ao abrir banco de dados ${this.dbName}:`, err);
            throw err;
        }
    }

    /**
     * Insere um valor no banco de dados
     */
    async put(key, value) {
        try {
            await this.open();

            return new Promise((resolve, reject) => {
                this.db.put(key, value, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            console.error(`Erro ao inserir dados (${key}) no banco ${this.dbName}:`, err);
            throw err;
        }
    }

    /**
     * Recupera um valor do banco de dados
     */
    async get(key) {
        try {
            await this.open();

            return new Promise((resolve, reject) => {
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
        } catch (err) {
            console.error(`Erro ao recuperar dados (${key}) do banco ${this.dbName}:`, err);
            throw err;
        }
    }

    /**
     * Remove um valor do banco de dados
     */
    async del(key) {
        try {
            await this.open();

            return new Promise((resolve, reject) => {
                this.db.del(key, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (err) {
            console.error(`Erro ao excluir dados (${key}) do banco ${this.dbName}:`, err);
            throw err;
        }
    }

    /**
     * Lista todos os itens no banco de dados
     */
    async listAll() {
        try {
            await this.open();

            const items = [];

            try {
                // Função para obter todas as chaves
                const getKeys = () => {
                    return new Promise((resolve, reject) => {
                        const keys = [];
                        const iterator = this.db.iterator({});

                        const next = () => {
                            iterator.next((err, key, value) => {
                                if (err) {
                                    iterator.end(() => reject(err));
                                    return;
                                }

                                if (!key) {
                                    iterator.end((endErr) => {
                                        if (endErr) reject(endErr);
                                        else resolve(keys);
                                    });
                                    return;
                                }

                                keys.push(key.toString());
                                next();
                            });
                        };

                        next();
                    });
                };

                // Obter todas as chaves
                const keys = await getKeys();

                // Para cada chave, obter o valor
                for (const key of keys) {
                    try {
                        const value = await this.get(key);

                        if (value) {
                            try {
                                items.push({
                                    key: key,
                                    value: JSON.parse(value.toString())
                                });
                            } catch (parseErr) {
                                console.error(`Erro ao parsear valor para a chave ${key}:`, parseErr);
                            }
                        }
                    } catch (getErr) {
                        console.error(`Erro ao obter valor para a chave ${key}:`, getErr);
                    }
                }
            } catch (iterErr) {
                console.error(`Erro ao iterar sobre o banco ${this.dbName}:`, iterErr);
            }

            return items;
        } catch (err) {
            console.error(`Erro ao listar todos os itens do banco ${this.dbName}:`, err);
            return []; // Retorna array vazio em caso de erro
        }
    }
}

// Obtém uma instância do banco de dados
function getInstance(dbName) {
    return new Database(dbName);
}

module.exports = Database;
module.exports.getInstance = getInstance;