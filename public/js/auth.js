/**
 * Módulo Auth: Gerencia autenticação e controle de acesso
 */
const Auth = {
    // Estado da autenticação
    isAuthenticated: false,
    userRole: null,
    username: null,

    /**
     * Inicializa o módulo de autenticação
     */
    init() {
        // Verificar se há token e informações no localStorage
        const token = localStorage.getItem('token');
        this.userRole = localStorage.getItem('userRole');
        this.username = localStorage.getItem('username');

        // Determinar se o usuário está autenticado
        this.isAuthenticated = !!token;

        // Configurar eventos
        this.setupEventListeners();

        // Atualizar a UI com base no estado de autenticação
        this.updateUI();
    },

    /**
     * Configura listeners de eventos relacionados à autenticação
     */
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Tab buttons
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Escutar eventos de autenticação
        document.addEventListener('auth:sessionExpired', () => {
            UI.showNotification('Sua sessão expirou. Por favor, faça login novamente.', 'error');
            this.handleSessionExpired();
        });

        document.addEventListener('auth:logout', () => {
            this.updateUI();
        });
    },

    /**
     * Atualiza a visibilidade dos elementos específicos de administrador
     */
    updateAdminElements() {
        // Obter a role do usuário diretamente do localStorage
        const userRole = localStorage.getItem('userRole');
        const isAdmin = userRole === 'admin';

        console.log("Atualizando elementos de admin. Usuário é admin?", isAdmin);

        // Item de menu para criar atividade
        const createActivityNavItem = document.querySelector('li.admin-only');
        if (createActivityNavItem) {
            if (isAdmin) {
                createActivityNavItem.classList.remove('hidden');
                console.log("Item de menu 'Criar Nova Atividade' exibido");
            } else {
                createActivityNavItem.classList.add('hidden');
                console.log("Item de menu 'Criar Nova Atividade' ocultado");
            }
        } else {
            console.warn("Item de menu 'Criar Nova Atividade' não encontrado");
        }

        // Outros elementos admin-only
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach((element, index) => {
            if (isAdmin) {
                element.classList.remove('hidden');
                console.log(`Elemento admin-only ${index} exibido`);
            } else {
                element.classList.add('hidden');
                console.log(`Elemento admin-only ${index} ocultado`);
            }
        });
    },

    /**
     * Processa o formulário de login
     */
    async handleLogin() {
        const identifier = document.getElementById('login-identifier').value;
        const password = document.getElementById('login-password').value;

        // Validação básica
        if (!identifier || !password) {
            UI.showNotification('Por favor, preencha todos os campos', 'error');
            return;
        }

        try {
            // Chamar API para fazer login
            const response = await API.login({
                identifier,
                password
            });

            // Login bem-sucedido
            this.isAuthenticated = true;
            this.userRole = localStorage.getItem('userRole');
            this.username = localStorage.getItem('username');

            console.log("Login bem-sucedido para:", identifier);
            console.log("Role do usuário:", this.userRole);

            // Esconder a seção de autenticação
            document.getElementById('auth-section').classList.add('hidden');

            // Mostrar a barra de navegação
            document.getElementById('main-nav').classList.remove('hidden');

            // Mostrar informações do usuário
            const userInfo = document.getElementById('user-info');
            if (userInfo) {
                userInfo.classList.remove('hidden');
                const usernameDisplay = document.getElementById('username-display');
                if (usernameDisplay) {
                    usernameDisplay.textContent = this.username || 'Usuário';
                }
            }

            // EXPLICITAMENTE esconder todas as seções primeiro
            document.getElementById('create-activity-section').classList.add('hidden');
            document.getElementById('my-activities-section').classList.add('hidden');

            // EXPLICITAMENTE mostrar apenas a seção de atividades disponíveis
            document.getElementById('activities-section').classList.remove('hidden');

            // Mostrar ou esconder elementos admin-only
            this.updateAdminElements();

            // Mostrar mensagem de sucesso
            UI.showNotification('Login realizado com sucesso!', 'success');

            // Carregar lista de atividades disponíveis
            Activities.loadAllActivities();

        } catch (error) {
            UI.showNotification(error.message || 'Erro ao fazer login', 'error');
        }
    },

    /**
     * Processa o formulário de registro
     */
    async handleRegister() {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-email-password').value;

        // Validação básica
        if (!username || !email || !password || !confirmPassword) {
            UI.showNotification('Por favor, preencha todos os campos', 'error');
            return;
        }

        // Validação de formato de e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            UI.showNotification('Por favor, forneça um e-mail válido', 'error');
            return;
        }

        // Validação de senha
        if (password.length < 8) {
            UI.showNotification('A senha deve ter pelo menos 8 caracteres', 'error');
            return;
        }

        // Verificar se as senhas coincidem
        if (password !== confirmPassword) {
            UI.showNotification('As senhas não coincidem', 'error');
            return;
        }

        try {
            // Chamar API para registrar
            await API.register({
                username,
                email,
                password,
                emailPassword: confirmPassword
            });

            // Registro bem-sucedido
            UI.showNotification('Registro realizado com sucesso! Faça login para continuar.', 'success');

            // Limpar o formulário
            document.getElementById('register-form').reset();

            // Mudar para a aba de login
            this.switchTab('login-form');

        } catch (error) {
            UI.showNotification(error.message || 'Erro ao registrar usuário', 'error');
        }
    },

    /**
     * Realiza o logout do usuário
     */
    handleLogout() {
        API.logout();
        this.isAuthenticated = false;
        this.userRole = null;
        this.username = null;
        this.updateUI();
        UI.showNotification('Logout realizado com sucesso!', 'info');
    },

    /**
     * Manipula expiração de sessão
     */
    handleSessionExpired() {
        this.isAuthenticated = false;
        this.userRole = null;
        this.username = null;
        this.updateUI();
    },

    /**
     * Alterna entre as abas de login e registro
     * @param {String} tabId ID do formulário a ser exibido
     */
    switchTab(tabId) {
        // Esconder todos os formulários
        document.querySelectorAll('.form').forEach(form => {
            form.classList.add('hidden');
        });

        // Desativar todos os botões de aba
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Mostrar o formulário selecionado
        document.getElementById(tabId).classList.remove('hidden');

        // Ativar o botão de aba correspondente
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    },

    /**
     * Esconde todas as seções de conteúdo
     */
    hideAllSections() {
        document.getElementById('activities-section').classList.add('hidden');
        document.getElementById('my-activities-section').classList.add('hidden');
        document.getElementById('create-activity-section').classList.add('hidden');
    },

    /**
     * Atualiza a interface com base no estado de autenticação
     */
    updateUI() {
        // Referências a elementos DOM
        const authSection = document.getElementById('auth-section');
        const mainNav = document.getElementById('main-nav');
        const userInfo = document.getElementById('user-info');
        const usernameDisplay = document.getElementById('username-display');

        // Elementos específicos de admin
        const adminElements = document.querySelectorAll('.admin-only');
        const createActivityNavItem = document.querySelector('li.admin-only');

        if (this.isAuthenticated) {
            // Usuário autenticado
            authSection.classList.add('hidden');
            mainNav.classList.remove('hidden');
            userInfo.classList.remove('hidden');

            // Exibir nome do usuário
            if (usernameDisplay) {
                usernameDisplay.textContent = this.username || 'Usuário';
            }

            // Verificar se o usuário é administrador
            const isAdmin = this.userRole === 'admin';
            console.log("Usuário é admin:", isAdmin);

            // Mostrar ou esconder elementos admin-only
            adminElements.forEach(el => {
                if (isAdmin) {
                    el.classList.remove('hidden');
                } else {
                    el.classList.add('hidden');
                }
            });

            // Tratar especificamente o item de menu de criação de atividade
            if (createActivityNavItem) {
                if (isAdmin) {
                    createActivityNavItem.style.display = 'block';
                } else {
                    createActivityNavItem.style.display = 'none';
                }
            }

            // Esconder todas as seções e mostrar apenas a de atividades
            this.hideAllSections();
            document.getElementById('activities-section').classList.remove('hidden');

        } else {
            // Usuário não autenticado
            authSection.classList.remove('hidden');
            mainNav.classList.add('hidden');
            userInfo.classList.add('hidden');

            // Esconder todas as seções de conteúdo
            this.hideAllSections();

            // Esconder todos os elementos admin-only
            adminElements.forEach(element => {
                element.classList.add('hidden');
            });
        }
    },

    /**
     * Verifica se o usuário tem permissão de administrador
     * @returns {Boolean} true se o usuário é admin, false caso contrário
     */
    isAdmin() {
        return this.userRole === 'admin';
    }
};