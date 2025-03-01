const RocksDB = require('rocksdb');
const path = require('path');
const fs = require('fs');

class Database {
    constructor(dbName) {
        this.dbPath = path.resolve(__dirname, '../../db_data', dbName);
        this.db = null;
        this.isOpening = false;
        this.isOpen = false;
    }

    open(callback) {
        // Evita múltiplas tentativas de abertura simultâneas
        if (this.isOpening) {
            return callback(new Error('Banco de dados já está em processo de abertura'));
        }

        if (this.isOpen) {
            return callback(null); // Já está aberto
        }

        this.isOpening = true;

        // Verifica se existe arquivo LOCK e tenta removê-lo
        const lockFile = path.join(this.dbPath, 'LOCK');
        try {
            if (fs.existsSync(lockFile)) {
                fs.unlinkSync(lockFile);
                console.log('Arquivo LOCK removido com sucesso');
            }
        } catch (err) {
            console.warn('Não foi possível remover o arquivo LOCK:', err.message);
            // Continua mesmo se não conseguir remover
        }

        // Garante que o diretório exista
        try {
            fs.mkdirSync(this.dbPath, { recursive: true });
        } catch (err) {
            if (err.code !== 'EEXIST') {
                this.isOpening = false;
                return callback(err);
            }
        }

        this.db = new RocksDB(this.dbPath);

        const options = {
            createIfMissing: true,
            errorIfExists: false
        };

        this.db.open(options, (err) => {
            this.isOpening = false;

            if (err) {
                console.error('Erro ao abrir o banco de dados:', err);
                this.db = null;
                callback(err);
            } else {
                this.isOpen = true;
                console.log('Banco de dados aberto com sucesso!');
                callback(null);
            }
        });
    }

    close(callback) {
        if (!this.db || !this.isOpen) {
            return callback(new Error('O banco de dados não está aberto'));
        }

        this.db.close((err) => {
            if (err) {
                console.error('Erro ao fechar o banco de dados:', err);
            } else {
                console.log('Banco de dados fechado com sucesso!');
                this.isOpen = false;
            }
            callback(err);
        });
    }

    readAllData(callback) {
        if (!this.db || !this.isOpen) {
            return callback(new Error('O banco de dados não está aberto'));
        }

        const data = [];
        const iterator = this.db.iterator({});

        const loop = () => {
            iterator.next((err, key, value) => {
                if (err) {
                    iterator.end(() => {
                        callback(err);
                    });
                    return;
                }

                if (!key && !value) {
                    iterator.end(() => {
                        callback(null, data);
                    });
                    return;
                }

                data.push({ key: key.toString(), value: value.toString() });
                loop();
            });
        };

        loop();
    }

    put(key, value, callback) {
        if (!this.db || !this.isOpen) {
            return callback(new Error('O banco de dados não está aberto'));
        }
        this.db.put(key, value, callback);
    }

    get(key, callback) {
        if (!this.db || !this.isOpen) {
            return callback(new Error('O banco de dados não está aberto'));
        }
        this.db.get(key, callback);
    }

    del(key, callback) {
        if (!this.db || !this.isOpen) {
            return callback(new Error('O banco de dados não está aberto'));
        }
        this.db.del(key, callback);
    }
}

module.exports = Database;