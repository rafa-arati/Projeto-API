/**
 * Módulo API: Responsável por todas as chamadas à API do backend
 */
const API = {
    // URL base da API (ajuste conforme necessário)
    baseURL: 'http://localhost:3000/api',

    // Token JWT armazenado
    token: null,

    // Cache de resultados de requisições
    cache: {
        activities: null,
        userActivities: null,
        // Limpa o cache quando expira
        expireTimeout: null,
        // Limpa o cache após 30 segundos
        clearAfter: function (ms = 30000) {
            clearTimeout(this.expireTimeout);
            this.expireTimeout = setTimeout(() => {
                this.activities = null;
                this.userActivities = null;
                console.log('Cache limpo');
            }, ms);
        }
    },

    /**
     * Inicializa a API verificando se há um token no localStorage
     */
    init() {
        // Recuperar token do localStorage se existir
        this.token = localStorage.getItem('token');
    },

    /**
     * Configura os headers padrão para requisições
     * @returns {Object} Headers da requisição
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    },

    /**
     * Trata erros de requisição de forma padronizada
     * @param {Response} response Resposta da requisição fetch
     * @returns {Promise} Promise com os dados ou erro tratado
     */
    async handleResponse(response) {
        const data = await response.json();

        if (response.ok) {
            return data;
        }

        // Tratamento específico para erro de autenticação
        if (response.status === 401) {
            // Limpar token e informações de usuário
            this.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');

            // Disparar um evento que outros módulos podem ouvir
            document.dispatchEvent(new CustomEvent('auth:sessionExpired'));
        }

        // Propagar erro com mensagem do servidor
        throw new Error(data.message || 'Ocorreu um erro na requisição');
    },

    /**
     * Limpa o cache de dados
     */
    clearCache() {
        this.cache.activities = null;
        this.cache.userActivities = null;
        console.log('Cache limpo manualmente');
    },

    //--------------------------------
    // Operações de Autenticação
    //--------------------------------

    /**
     * Registra um novo usuário
     * @param {Object} userData Dados do usuário para registro
     * @returns {Promise} Promise com resposta do registro
     */
    async register(userData) {
        const response = await fetch(`${this.baseURL}/users/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(userData)
        });

        return this.handleResponse(response);
    },

    /**
     * Realiza login de usuário
     * @param {Object} credentials Credenciais de login (identifier, password)
     * @returns {Promise} Promise com resposta do login
     */
    async login(credentials) {
        const response = await fetch(`${this.baseURL}/users/login`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(credentials)
        });

        const data = await this.handleResponse(response);

        // Armazenar o token recebido
        if (data.token) {
            this.token = data.token;
            localStorage.setItem('token', data.token);

            // Extrair e armazenar informações do token
            const payload = this.parseJwt(data.token);
            if (payload) {
                localStorage.setItem('userRole', payload.role || 'user');
                localStorage.setItem('username', payload.userId);
            }

            // Limpar cache ao fazer login
            this.clearCache();
        }

        return data;
    },

    /**
     * Faz logout do usuário atual
     */
    logout() {
        // Limpar token e informações do usuário
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');

        // Limpar cache ao fazer logout
        this.clearCache();

        // Disparar evento de logout
        document.dispatchEvent(new CustomEvent('auth:logout'));
    },

    //--------------------------------
    // Operações de Atividades
    //--------------------------------

    /**
     * Lista todas as atividades disponíveis
     * @returns {Promise} Promise com a lista de atividades
     */
    async getAllActivities() {
        // Usar cache se disponível
        if (this.cache.activities) {
            console.log('Usando atividades em cache');
            return this.cache.activities;
        }

        const response = await fetch(`${this.baseURL}/activities`, {
            method: 'GET',
            headers: this.getHeaders()
        });

        const data = await this.handleResponse(response);

        // Armazenar no cache
        this.cache.activities = data;
        this.cache.clearAfter();

        return data;
    },

    /**
     * Busca atividades em que o usuário atual está inscrito
     * @returns {Promise} Promise com a lista de atividades do usuário
     */
    async getUserActivities() {
        // Usar cache se disponível
        if (this.cache.userActivities) {
            console.log('Usando atividades do usuário em cache');
            return this.cache.userActivities;
        }

        const response = await fetch(`${this.baseURL}/users/activities`, {
            method: 'GET',
            headers: this.getHeaders()
        });

        const data = await this.handleResponse(response);

        // Armazenar no cache
        this.cache.userActivities = data;
        this.cache.clearAfter();

        return data;
    },

    /**
     * Cria uma nova atividade (somente admin)
     * @param {Object} activityData Dados da atividade a ser criada
     * @returns {Promise} Promise com a resposta da criação
     */
    async createActivity(activityData) {
        const response = await fetch(`${this.baseURL}/activities`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(activityData)
        });

        const data = await this.handleResponse(response);

        // Limpar cache após modificação
        this.clearCache();

        return data;
    },

    /**
     * Edita uma atividade existente (somente admin)
     * @param {String} activityId ID da atividade a ser editada
     * @param {Object} activityData Novos dados da atividade
     * @returns {Promise} Promise com a resposta da edição
     */
    async updateActivity(activityId, activityData) {
        const response = await fetch(`${this.baseURL}/activities/${activityId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(activityData)
        });

        const data = await this.handleResponse(response);

        // Limpar cache após modificação
        this.clearCache();

        return data;
    },

    /**
     * Exclui uma atividade (somente admin)
     * @param {String} activityId ID da atividade a ser excluída
     * @returns {Promise} Promise com a resposta da exclusão
     */
    async deleteActivity(activityId) {
        const response = await fetch(`${this.baseURL}/activities/${activityId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });

        const data = await this.handleResponse(response);

        // Limpar cache após modificação
        this.clearCache();

        return data;
    },

    /**
     * Inscreve o usuário atual em uma atividade
     * @param {String} activityId ID da atividade
     * @returns {Promise} Promise com a resposta da inscrição
     */
    async registerForActivity(activityId) {
        const userId = localStorage.getItem('username');
        const response = await fetch(`${this.baseURL}/activities/${activityId}/register`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ userId })
        });

        const data = await this.handleResponse(response);

        // Limpar cache após modificação
        this.clearCache();

        return data;
    },

    /**
     * Cancela a inscrição do usuário em uma atividade
     * @param {String} activityId ID da atividade
     * @returns {Promise} Promise com a resposta do cancelamento
     */
    async cancelRegistration(activityId) {
        const userId = localStorage.getItem('username');
        const response = await fetch(`${this.baseURL}/activities/${activityId}/cancel`, {
            method: 'DELETE',
            headers: this.getHeaders(),
            body: JSON.stringify({ userId })
        });

        const data = await this.handleResponse(response);

        // Limpar cache após modificação
        this.clearCache();

        return data;
    },

    /**
     * Obtém a lista de participantes de uma atividade (somente admin)
     * @param {String} activityId ID da atividade
     * @returns {Promise} Promise com a lista de participantes
     */
    async getActivityParticipants(activityId) {
        const response = await fetch(`${this.baseURL}/activities/${activityId}/participants`, {
            method: 'GET',
            headers: this.getHeaders()
        });

        return this.handleResponse(response);
    },

    /**
     * Utilitário para decodificar token JWT e extrair payload
     * @param {String} token Token JWT
     * @returns {Object|null} Payload decodificado ou null se inválido
     */
    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            console.log('Token JWT decodificado:', payload);
            return payload;
        } catch (e) {
            console.error('Erro ao decodificar token JWT:', e);
            return null;
        }
    }
};

// Inicializar quando o script carregar
API.init();