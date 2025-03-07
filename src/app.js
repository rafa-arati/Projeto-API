const express = require('express');
const routes = require('./routes/routes');
const cleanLockFiles = require('../cleanLockFiles');
const path = require('path');
const fs = require('fs');

// Limpar arquivos LOCK e temporários na inicialização
console.log('Iniciando limpeza de arquivos LOCK antes de iniciar o servidor...');
cleanLockFiles();

// Garantir que os diretórios do banco de dados existam
const dbDirs = ['users', 'activities', 'userActivities'];
const dbBase = path.join(__dirname, '../db_data');

if (!fs.existsSync(dbBase)) {
    fs.mkdirSync(dbBase, { recursive: true });
    console.log('Diretório base de banco de dados criado');
}

dbDirs.forEach(dir => {
    const dirPath = path.join(dbBase, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Diretório ${dir} criado`);
    }
});

const app = express();

// Middleware para processar JSON
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static('public'));

// Rotas da API
app.use('/api', routes);

// Middleware global
app.use(express.urlencoded({ extended: true }));

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
});

// Definir e exportar a inicialização do servidor
const PORT = process.env.PORT || 3000;

// Iniciar o servidor apenas se este arquivo for executado diretamente
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

module.exports = app;