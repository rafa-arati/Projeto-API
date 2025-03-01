const express = require('express');
const router = express.Router();

// Função temporária para listar todas as atividades
router.get('/', (req, res) => {
    res.status(200).json({
        message: 'Lista de atividades (simulado)',
        activities: [
            { id: 1, title: 'Atividade teste UM' },
            { id: 2, title: 'Atividade teste DOIS' }
        ]
    });
});

// Função temporária para criar uma nova atividade
router.post('/', (req, res) => {
    res.status(201).json({ message: 'Atividade criada com sucesso (simulado)' });
});

// Função temporária para editar uma atividade
router.put('/:id', (req, res) => {
    res.status(200).json({ message: `Atividade ${req.params.id} editada com sucesso (simulado)` });
});

// Função temporária para excluir uma atividade
router.delete('/:id', (req, res) => {
    res.status(200).json({ message: `Atividade ${req.params.id} excluída com sucesso (simulado)` });
});

// Função temporária para inscrever-se em uma atividade
router.post('/:id/register', (req, res) => {
    res.status(200).json({ message: `Inscrição na atividade ${req.params.id} realizada com sucesso (simulado)` });
});

// Função temporária para cancelar inscrição em uma atividade
router.delete('/:id/cancel', (req, res) => {
    res.status(200).json({ message: `Inscrição na atividade ${req.params.id} cancelada com sucesso (simulado)` });
});

// Função temporária para visualizar participantes de uma atividade
router.get('/:id/participants', (req, res) => {
    res.status(200).json({
        message: `Participantes da atividade ${req.params.id} (simulado)`,
        participants: [
            { id: 1, name: 'Teste UM' },
            { id: 2, name: 'Teste DOIS' }
        ]
    });
});

module.exports = router;