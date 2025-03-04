const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes/routes');

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar o Express
const app = express();

// Middleware global
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (front-end)
app.use(express.static('public'));

// Rotas
app.use('/api', routes);

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