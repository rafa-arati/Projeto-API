const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const app = express();

// Vai carregar as variáveis de ambiente do arquivo .env
dotenv.config();

// Esses são os Middlewares
app.use(express.json()); // Para parsear o corpo das requisições como JSON
app.use(cookieParser()); // Para lidar com cookies

// Rota de teste para verificar se o servidor está funcionando
app.get('/', (req, res) => {
    res.send('Servidor rodando!');
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
