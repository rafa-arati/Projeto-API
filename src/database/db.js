const RocksDB = require('rocksdb');
const path = require('path');
const fs = require('fs');

class Database {
    constructor(dbName) {
        this.dbPath = path.resolve(__dirname, '../../db_data', dbName);
        this.db = new RocksDB(this.dbPath); // Instância do RocksDB
        this.isOpening = false;
        this.isOpen = false;
    }

    open(callback) {
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

    iterator(options) {
        if (!this.db || !this.isOpen) {
            throw new Error('O banco de dados não está aberto');
        }
        return this.db.iterator(options);
    }
}

module.exports = Database;