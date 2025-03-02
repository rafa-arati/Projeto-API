const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const routes = require('./routes/routes'); // Importa as rotas

const app = express();

dotenv.config();

app.use(express.json());
app.use(cookieParser());

// Usa as rotas
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});