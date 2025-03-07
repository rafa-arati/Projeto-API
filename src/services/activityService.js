const activityRepository = require('../repositories/activityRepository');

class ActivityService {
    // Lista todas as atividades
    async getAllActivities() {
        return await activityRepository.findAllActivities();
    }

    // Cria uma nova atividade
    async createActivity(title, description, date, location, maxParticipants) {
        // Converter para número para garantir que é um valor válido
        const maxPart = parseInt(maxParticipants, 10);

        // Normalizar o formato da data
        const normalizedDate = this._normalizeDate(date);

        // Criar objeto de atividade
        const activity = {
            title,
            description,
            date: normalizedDate,
            location,
            maxParticipants: maxPart,
            participants: [] // Inicializa com array vazio
        };

        console.log("Criando atividade:", activity);

        const createdActivity = await activityRepository.createActivity(activity);
        return createdActivity;
    }

    // Normaliza o formato da data para ISO string
    _normalizeDate(dateInput) {
        try {
            // Se for uma string vazia ou null/undefined
            if (!dateInput) {
                // Data no futuro (1 dia a partir de agora)
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return tomorrow.toISOString();
            }

            // Converter para objeto Date e depois para ISO string
            const dateObj = new Date(dateInput);

            // Verificar se é uma data válida
            if (isNaN(dateObj.getTime())) {
                console.warn(`Data inválida fornecida: "${dateInput}", usando data futura`);
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return tomorrow.toISOString();
            }

            return dateObj.toISOString();
        } catch (error) {
            console.error(`Erro ao normalizar data: ${error.message}`);
            // Em caso de erro, retorna uma data futura
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString();
        }
    }

    // Verifica se a atividade já começou - CORRIGIDO
    _hasActivityStarted(activityDate) {
        try {
            // Se a data for null, undefined ou string vazia
            if (!activityDate) {
                console.log("Data da atividade é nula ou indefinida, considerando como não iniciada");
                return false;
            }

            // Garantir que as datas estão no mesmo formato
            const activityDateObj = new Date(activityDate);
            const now = new Date();

            // Para diagnóstico
            console.log(`Comparando datas: 
              - Atividade: ${activityDate} 
              - Objeto Date da atividade: ${activityDateObj.toISOString()} 
              - Agora: ${now.toISOString()}`);

            // Verificação da validade da data
            if (isNaN(activityDateObj.getTime())) {
                console.error(`Data inválida: "${activityDate}"`);
                return false; // Se a data for inválida, assume que não começou
            }

            // Comparar apenas as datas, sem considerar horas
            const activityDateOnly = new Date(activityDateObj.getFullYear(), activityDateObj.getMonth(), activityDateObj.getDate());
            const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const hasStarted = activityDateOnly < nowDateOnly;
            console.log(`Resultado da comparação: a atividade ${hasStarted ? 'JÁ começou' : 'ainda NÃO começou'}`);

            return hasStarted;
        } catch (error) {
            console.error(`Erro ao verificar data da atividade: ${error.message}`);
            return false; // Em caso de erro, assume que não começou
        }
    }

    // Inscreve um usuário em uma atividade
    async registerForActivity(activityId, userId) {
        console.log(`Tentando registrar usuário ${userId} na atividade ${activityId}`);

        const activity = await activityRepository.findActivityById(activityId);
        if (!activity) {
            console.error(`Atividade não encontrada: ${activityId}`);
            throw new Error('Atividade não encontrada');
        }

        console.log(`Atividade encontrada:`, activity);

        // Certificar-se de que participantes é um array
        if (!activity.participants || !Array.isArray(activity.participants)) {
            activity.participants = [];
        }

        // Verificar se o usuário já está inscrito - CONVERTENDO PARA STRING!
        const userIdStr = String(userId);
        const participantStrings = activity.participants.map(p => String(p));

        if (participantStrings.includes(userIdStr)) {
            console.log(`Usuário ${userId} já está inscrito na atividade ${activityId}`);
            throw new Error(`Usuário já está inscrito nesta atividade`);
        }

        // Verificar se a atividade já começou
        if (this._hasActivityStarted(activity.date)) {
            console.log(`Atividade ${activityId} já começou. Data: ${activity.date}`);
            throw new Error('Não é possível se inscrever em uma atividade que já começou');
        }

        // Verificar se há vagas disponíveis
        if (activity.participants.length >= activity.maxParticipants) {
            console.log(`Não há vagas disponíveis na atividade ${activityId}. Participantes: ${activity.participants.length}, Máximo: ${activity.maxParticipants}`);
            throw new Error('Não há vagas disponíveis');
        }

        // Adiciona o usuário à lista de participantes
        activity.participants.push(userIdStr); // Usando string para consistência!

        console.log(`Adicionando usuário ${userId} à atividade ${activityId}. Total de participantes: ${activity.participants.length}`);
        console.log("Lista de participantes atualizada:", activity.participants);

        // Atualiza a atividade no banco de dados
        await activityRepository.updateActivity(activityId, activity);
        return activity;
    }

    // Cancela a inscrição de um usuário em uma atividade
    async cancelRegistration(activityId, userId) {
        console.log(`Tentando cancelar registro do usuário ${userId} na atividade ${activityId}`);

        const activity = await activityRepository.findActivityById(activityId);
        if (!activity) {
            console.error(`Atividade não encontrada: ${activityId}`);
            throw new Error('Atividade não encontrada');
        }

        // Verificar se o usuário está inscrito - COM CONVERSÃO PARA STRING
        const userIdStr = String(userId);

        // Garantir que participants seja um array
        if (!activity.participants || !Array.isArray(activity.participants)) {
            activity.participants = [];
            throw new Error(`Usuário não está inscrito nesta atividade`);
        }

        // Converter todos os IDs para string para comparação
        const participantStrings = activity.participants.map(p => String(p));

        if (!participantStrings.includes(userIdStr)) {
            console.log(`Usuário ${userId} não está inscrito na atividade ${activityId}`);
            console.log(`Participantes atuais:`, activity.participants);
            throw new Error(`Usuário não está inscrito nesta atividade`);
        }

        // Verificar se a atividade já começou
        if (this._hasActivityStarted(activity.date)) {
            console.log(`Atividade ${activityId} já começou. Data: ${activity.date}`);
            throw new Error('Não é possível cancelar inscrição em uma atividade que já começou');
        }

        // Remover o usuário da lista de participantes
        activity.participants = activity.participants.filter(id => String(id) !== userIdStr);

        console.log(`Removendo usuário ${userId} da atividade ${activityId}`);
        console.log("Lista de participantes atualizada:", activity.participants);

        // Atualiza a atividade no banco de dados
        await activityRepository.updateActivity(activityId, activity);
        return activity;
    }

    // Edita uma atividade existente
    async editActivity(activityId, updates) {
        console.log(`Tentando editar atividade ${activityId}`, updates);

        const activity = await activityRepository.findActivityById(activityId);
        if (!activity) {
            console.error(`Atividade não encontrada: ${activityId}`);
            throw new Error('Atividade não encontrada');
        }

        console.log(`Atividade encontrada para edição:`, activity);

        // Normalizar a data se for fornecida
        if (updates.date) {
            updates.date = this._normalizeDate(updates.date);
        }

        // Se houver um campo maxParticipants, garanta que seja um número
        if (updates.maxParticipants) {
            updates.maxParticipants = parseInt(updates.maxParticipants, 10);
        }

        // Preservar o ID e a lista de participantes
        const updatedActivity = {
            ...activity,
            ...updates,
            id: activity.id,
            participants: activity.participants || []
        };

        console.log(`Atualizando atividade ${activityId} para:`, updatedActivity);

        await activityRepository.updateActivity(activityId, updatedActivity);
        return updatedActivity;
    }

    // Exclui uma atividade
    async deleteActivity(activityId) {
        console.log(`Tentando excluir atividade ${activityId}`);

        const activity = await activityRepository.findActivityById(activityId);
        if (!activity) {
            console.error(`Atividade não encontrada: ${activityId}`);
            throw new Error('Atividade não encontrada');
        }

        await activityRepository.deleteActivity(activityId);
        console.log(`Atividade ${activityId} excluída com sucesso`);
    }

    // Busca os participantes de uma atividade
    async getActivityParticipants(activityId) {
        console.log(`Buscando participantes da atividade ${activityId}`);

        const activity = await activityRepository.findActivityById(activityId);
        if (!activity) {
            console.error(`Atividade não encontrada: ${activityId}`);
            throw new Error('Atividade não encontrada');
        }

        console.log(`Participantes da atividade ${activityId}:`, activity.participants || []);
        return activity.participants || [];
    }
}

module.exports = new ActivityService();