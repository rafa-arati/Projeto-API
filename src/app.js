const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const app = express();

dotenv.config();

app.use(express.json());
app.use(cookieParser());

// Caminho corrigido para importar as rotas
const routes = require('./routes/routes');
app.use('/api', routes); // Carrega as rotas com o prefixo /api

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});