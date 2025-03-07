/**
 * Módulo Activities: Gerencia a exibição e manipulação de atividades
 */
const Activities = {
    // Estado das atividades
    allActivities: [],
    userActivities: [],

    // Flags de debounce
    _debouncedLoadAll: null,
    _debouncedLoadUser: null,

    /**
     * Inicializa o módulo de atividades
     */
    init() {
        console.log("Inicializando módulo de atividades");
        this.setupEventListeners();
        this.setupDeleteConfirmationModal();
    },

    /**
     * Configura listeners de eventos relacionados a atividades
     */
    setupEventListeners() {
        // Botão para visualizar atividades
        const viewActivitiesBtn = document.getElementById('view-activities-btn');
        if (viewActivitiesBtn) {
            viewActivitiesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showActivitiesSection();
            });
            console.log("Listener adicionado para botão 'Ver Atividades'");
        }

        // Botão para visualizar minhas atividades
        const viewMyActivitiesBtn = document.getElementById('view-my-activities-btn');
        if (viewMyActivitiesBtn) {
            viewMyActivitiesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMyActivitiesSection();
            });
            console.log("Listener adicionado para botão 'Minhas Atividades'");
        }

        // Botão para criar atividade
        const createActivityBtn = document.getElementById('create-activity-btn');
        if (createActivityBtn) {
            createActivityBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCreateActivitySection();
            });
            console.log("Listener adicionado para botão 'Criar Nova Atividade'");
        }

        // Formulário de criação de atividade
        const createActivityForm = document.getElementById('create-activity-form');
        if (createActivityForm) {
            createActivityForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateActivity();
            });
            console.log("Listener adicionado para formulário de criação");
        }

        // Formulário de edição de atividade
        const editActivityForm = document.getElementById('edit-activity-form');
        if (editActivityForm) {
            editActivityForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditActivity();
            });
        }

        // Botões para fechar modais
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.add('hidden');
                });
            });
        });
    },

    /**
     * Configura o modal de confirmação de exclusão
     */
    setupDeleteConfirmationModal() {
        // Criar o modal se não existir
        if (!document.getElementById('delete-confirmation-modal')) {
            const modal = document.createElement('div');
            modal.id = 'delete-confirmation-modal';
            modal.className = 'modal hidden';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Confirmar Exclusão</h2>
                    <p>Tem certeza que deseja excluir esta atividade?</p>
                    <div class="modal-actions">
                        <button id="confirm-delete-btn" class="delete-btn">Excluir</button>
                        <button id="cancel-delete-btn">Cancelar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Configurar eventos
            const closeBtn = modal.querySelector('.close-modal');
            const cancelBtn = modal.querySelector('#cancel-delete-btn');

            closeBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });

            cancelBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }
    },

    /**
     * Abre o modal de confirmação de exclusão
     * @param {String} activityId ID da atividade a ser excluída
     */
    openDeleteConfirmationModal(activityId) {
        const modal = document.getElementById('delete-confirmation-modal');
        const confirmBtn = document.getElementById('confirm-delete-btn');

        // Remover listener antigo se existir para evitar múltiplas execuções
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        // Adicionar novo listener com o ID da atividade atual
        newConfirmBtn.addEventListener('click', () => {
            this.handleDeleteActivity(activityId);
            modal.classList.add('hidden');
        });

        // Exibir o modal
        modal.classList.remove('hidden');
    },

    /**
     * Carrega todas as atividades disponíveis
     */
    async loadAllActivities() {
        // Evitar múltiplas requisições simultâneas
        if (window.activitiesLoadingInProgress) {
            console.log('Carregamento de atividades já em andamento, ignorando requisição...');
            return;
        }

        window.activitiesLoadingInProgress = true;

        try {
            const response = await API.getAllActivities();
            this.allActivities = response.activities || [];
            this.renderActivitiesList();

            // Exibir a seção de atividades
            document.getElementById('activities-section').classList.remove('hidden');
        } catch (error) {
            console.error('Erro ao carregar atividades:', error);
            UI.showNotification(error.message || 'Erro ao carregar atividades', 'error');
        } finally {
            // Sempre resetar o estado ao concluir
            window.activitiesLoadingInProgress = false;
        }
    },

    /**
     * Carrega as atividades em que o usuário está inscrito
     */
    async loadUserActivities() {
        // Evitar múltiplas requisições simultâneas
        if (window.activitiesLoadingInProgress) {
            console.log('Carregamento de atividades já em andamento, ignorando requisição...');
            return;
        }

        window.activitiesLoadingInProgress = true;

        try {
            const response = await API.getUserActivities();
            this.userActivities = response.activities || [];
            this.renderUserActivitiesList();

            // Exibir a seção de minhas atividades
            document.getElementById('my-activities-section').classList.remove('hidden');
        } catch (error) {
            console.error('Erro ao carregar atividades do usuário:', error);
            UI.showNotification(error.message || 'Erro ao carregar suas atividades', 'error');
        } finally {
            window.activitiesLoadingInProgress = false;
        }
    },

    /**
     * Renderiza a lista de todas as atividades disponíveis
     */
    renderActivitiesList() {
        const activitiesList = document.getElementById('activities-list');
        if (!activitiesList) return;

        // Limpar conteúdo atual
        activitiesList.innerHTML = '';

        if (this.allActivities.length === 0) {
            activitiesList.innerHTML = '<p>Nenhuma atividade disponível no momento.</p>';
            return;
        }

        // Renderizar cada atividade
        this.allActivities.forEach(activity => {
            const card = this.createActivityCard(activity, false);
            activitiesList.appendChild(card);
        });
    },

    /**
     * Renderiza a lista de atividades do usuário
     */
    renderUserActivitiesList() {
        const myActivitiesList = document.getElementById('my-activities-list');
        if (!myActivitiesList) return;

        // Limpar conteúdo atual
        myActivitiesList.innerHTML = '';

        if (this.userActivities.length === 0) {
            myActivitiesList.innerHTML = '<p>Você não está inscrito em nenhuma atividade.</p>';
            return;
        }

        // Renderizar cada atividade
        this.userActivities.forEach(activity => {
            const card = this.createActivityCard(activity, true);
            myActivitiesList.appendChild(card);
        });
    },

    /**
     * Cria um elemento de card para uma atividade
     * @param {Object} activity Dados da atividade
     * @param {Boolean} isUserActivity Indica se é uma atividade do usuário
     * @returns {HTMLElement} Elemento div do card
     */
    createActivityCard(activity, isUserActivity) {
        // Criar elemento do card
        const card = document.createElement('div');
        card.className = 'activity-card';
        card.dataset.id = activity.id;

        // Formatar data
        const activityDate = new Date(activity.date);
        const formattedDate = activityDate.toLocaleString('pt-BR');

        // Verificar se a atividade já começou
        const now = new Date();
        const hasStarted = activityDate < now;

        // Verificar se o usuário já está inscrito
        const isRegistered = isUserActivity ||
            (activity.participants && activity.participants.includes(localStorage.getItem('username')));

        // Verificar se há vagas disponíveis
        const maxParticipants = parseInt(activity.maxParticipants, 10) || 0;
        const participantsCount = (activity.participants && activity.participants.length) || 0;
        const hasAvailableSpots = participantsCount < maxParticipants;

        // Conteúdo do card
        card.innerHTML = `
            <h3>${activity.title}</h3>
            <p>${activity.description}</p>
            <p><strong>Data:</strong> ${formattedDate}</p>
            <p><strong>Local:</strong> ${activity.location}</p>
            <p><strong>Vagas:</strong> ${participantsCount}/${maxParticipants}</p>
            ${hasStarted ? '<p class="status-badge started">Iniciada</p>' : ''}
            ${isRegistered ? '<p class="status-badge registered">Inscrito</p>' : ''}
            <div class="activity-actions"></div>
        `;

        // Adicionar botões de ação
        const actionsDiv = card.querySelector('.activity-actions');

        // Se o usuário é administrador
        if (Auth.isAdmin()) {
            // Botão de editar (apenas para admin)
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.addEventListener('click', () => this.openEditModal(activity));
            actionsDiv.appendChild(editBtn);

            // Botão de excluir (apenas para admin)
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => this.openDeleteConfirmationModal(activity.id));
            actionsDiv.appendChild(deleteBtn);

            // Botão para ver participantes (apenas para admin)
            const participantsBtn = document.createElement('button');
            participantsBtn.textContent = 'Participantes';
            participantsBtn.addEventListener('click', () => this.showParticipants(activity.id));
            actionsDiv.appendChild(participantsBtn);
        }

        // Botão de inscrição/cancelamento (para todos os usuários)
        if (!isUserActivity) {
            // Se não estiver inscrito e a atividade não tiver começado
            if (!isRegistered && !hasStarted && hasAvailableSpots) {
                const registerBtn = document.createElement('button');
                registerBtn.textContent = 'Inscrever-se';
                registerBtn.addEventListener('click', () => this.handleRegisterForActivity(activity.id));
                actionsDiv.appendChild(registerBtn);
            }
        } else {
            // Se estiver inscrito e a atividade não tiver começado
            if (!hasStarted) {
                const cancelBtn = document.createElement('button');
                cancelBtn.textContent = 'Cancelar Inscrição';
                cancelBtn.classList.add('cancel-btn');
                cancelBtn.addEventListener('click', () => this.handleCancelRegistration(activity.id));
                actionsDiv.appendChild(cancelBtn);
            }
        }

        return card;
    },

    /**
     * Abre o modal de edição de atividade
     * @param {Object} activity Atividade a ser editada
     */
    openEditModal(activity) {
        try {
            console.log('Abrindo modal de edição para atividade:', activity);

            // Garantir que a atividade existe e tem os dados necessários
            if (!activity || !activity.id) {
                console.error('Atividade inválida para edição', activity);
                UI.showNotification('Erro ao abrir formulário de edição', 'error');
                return;
            }

            // Obter as referências aos elementos do formulário
            const idField = document.getElementById('edit-activity-id');
            const titleField = document.getElementById('edit-activity-title');
            const descriptionField = document.getElementById('edit-activity-description');
            const dateField = document.getElementById('edit-activity-date');
            const locationField = document.getElementById('edit-activity-location');
            const maxParticipantsField = document.getElementById('edit-activity-max-participants');

            // Verificar se os elementos existem
            if (!idField || !titleField || !descriptionField || !dateField || !locationField || !maxParticipantsField) {
                console.error('Elementos do formulário de edição não encontrados');
                UI.showNotification('Erro ao abrir formulário de edição: elementos não encontrados', 'error');
                return;
            }

            // Preencher os campos do formulário com os dados da atividade
            idField.value = activity.id;
            titleField.value = activity.title || '';
            descriptionField.value = activity.description || '';
            locationField.value = activity.location || '';
            maxParticipantsField.value = activity.maxParticipants || '';

            // Formatar a data para o input datetime-local
            try {
                const activityDate = new Date(activity.date);
                if (!isNaN(activityDate.getTime())) {
                    // Formato para datetime-local: YYYY-MM-DDThh:mm
                    const year = activityDate.getFullYear();
                    const month = String(activityDate.getMonth() + 1).padStart(2, '0');
                    const day = String(activityDate.getDate()).padStart(2, '0');
                    const hours = String(activityDate.getHours()).padStart(2, '0');
                    const minutes = String(activityDate.getMinutes()).padStart(2, '0');

                    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
                    dateField.value = formattedDate;
                } else {
                    dateField.value = '';
                    console.warn('Data inválida para a atividade:', activity.date);
                }
            } catch (dateError) {
                console.error('Erro ao processar data da atividade:', dateError);
                dateField.value = '';
            }

            // Exibir o modal
            document.getElementById('edit-activity-modal').classList.remove('hidden');
        } catch (error) {
            console.error('Erro ao abrir modal de edição:', error);
            UI.showNotification('Erro ao abrir formulário de edição', 'error');
        }
    },

    /**
     * Exibe o modal com a lista de participantes de uma atividade
     * @param {String} activityId ID da atividade
     */
    async showParticipants(activityId) {
        try {
            const response = await API.getActivityParticipants(activityId);
            const participants = response.participants || [];

            const participantsList = document.getElementById('participants-list');
            participantsList.innerHTML = '';

            if (participants.length === 0) {
                participantsList.innerHTML = '<p>Nenhum participante inscrito.</p>';
            } else {
                const ul = document.createElement('ul');
                participants.forEach(participant => {
                    const li = document.createElement('li');
                    li.textContent = participant;
                    ul.appendChild(li);
                });
                participantsList.appendChild(ul);
            }

            // Exibir o modal
            document.getElementById('participants-modal').classList.remove('hidden');
        } catch (error) {
            UI.showNotification(error.message || 'Erro ao carregar participantes', 'error');
        }
    },

    /**
     * Processa o formulário de criação de atividade
     */
    async handleCreateActivity() {
        const title = document.getElementById('activity-title').value;
        const description = document.getElementById('activity-description').value;
        const date = document.getElementById('activity-date').value;
        const location = document.getElementById('activity-location').value;
        const maxParticipants = document.getElementById('activity-max-participants').value;

        // Validação básica
        if (!title || !description || !date || !location || !maxParticipants) {
            UI.showNotification('Por favor, preencha todos os campos', 'error');
            return;
        }

        try {
            // Chamar API para criar atividade
            await API.createActivity({
                title,
                description,
                date,
                location,
                maxParticipants: parseInt(maxParticipants, 10)
            });

            // Limpar formulário
            document.getElementById('create-activity-form').reset();

            // Mostrar mensagem de sucesso
            UI.showNotification('Atividade criada com sucesso!', 'success');

            // Recarregar lista de atividades
            this.loadAllActivities();

        } catch (error) {
            UI.showNotification(error.message || 'Erro ao criar atividade', 'error');
        }
    },

    /**
     * Processa o formulário de edição de atividade
     */
    async handleEditActivity() {
        const activityId = document.getElementById('edit-activity-id').value;
        const title = document.getElementById('edit-activity-title').value;
        const description = document.getElementById('edit-activity-description').value;
        const date = document.getElementById('edit-activity-date').value;
        const location = document.getElementById('edit-activity-location').value;
        const maxParticipants = document.getElementById('edit-activity-max-participants').value;

        // Validação básica
        if (!title || !description || !date || !location || !maxParticipants) {
            UI.showNotification('Por favor, preencha todos os campos', 'error');
            return;
        }

        try {
            // Chamar API para atualizar atividade
            await API.updateActivity(activityId, {
                title,
                description,
                date,
                location,
                maxParticipants: parseInt(maxParticipants, 10)
            });

            // Fechar o modal
            document.getElementById('edit-activity-modal').classList.add('hidden');

            // Mostrar mensagem de sucesso
            UI.showNotification('Atividade atualizada com sucesso!', 'success');

            // Recarregar lista de atividades
            this.loadAllActivities();

        } catch (error) {
            UI.showNotification(error.message || 'Erro ao atualizar atividade', 'error');
        }
    },

    /**
     * Processa a exclusão de uma atividade
     * @param {String} activityId ID da atividade a ser excluída
     */
    async handleDeleteActivity(activityId) {
        try {
            // Chamar API para excluir atividade
            await API.deleteActivity(activityId);

            // Mostrar mensagem de sucesso
            UI.showNotification('Atividade excluída com sucesso!', 'success');

            // Recarregar lista de atividades
            this.loadAllActivities();

        } catch (error) {
            UI.showNotification(error.message || 'Erro ao excluir atividade', 'error');
        }
    },

    /**
     * Processa a inscrição em uma atividade
     * @param {String} activityId ID da atividade
     */
    async handleRegisterForActivity(activityId) {
        try {
            // Chamar API para inscrever usuário
            await API.registerForActivity(activityId);

            // Mostrar mensagem de sucesso
            UI.showNotification('Inscrição realizada com sucesso!', 'success');

            // Recarregar listas de atividades
            this.loadAllActivities();
            this.loadUserActivities();

        } catch (error) {
            UI.showNotification(error.message || 'Erro ao se inscrever na atividade', 'error');
        }
    },

    /**
     * Processa o cancelamento de inscrição em uma atividade
     * @param {String} activityId ID da atividade
     */
    async handleCancelRegistration(activityId) {
        try {
            // Chamar API para cancelar inscrição
            await API.cancelRegistration(activityId);

            // Mostrar mensagem de sucesso
            UI.showNotification('Inscrição cancelada com sucesso!', 'success');

            // Recarregar listas de atividades
            this.loadUserActivities();
            this.loadAllActivities();

        } catch (error) {
            UI.showNotification(error.message || 'Erro ao cancelar inscrição', 'error');
        }
    },

    /**
     * Exibe a seção de atividades disponíveis
     */
    showActivitiesSection() {
        console.log("Exibindo seção de atividades disponíveis");

        // Esconder outras seções
        document.getElementById('my-activities-section').classList.add('hidden');
        document.getElementById('create-activity-section').classList.add('hidden');

        // Mostrar seção de atividades
        document.getElementById('activities-section').classList.remove('hidden');

        // Use debounce para evitar requisições excessivas
        if (!this._debouncedLoadAll) {
            this._debouncedLoadAll = debounce(() => this.loadAllActivities(), 300);
        }
        this._debouncedLoadAll();
    },

    /**
     * Exibe a seção de minhas atividades
     */
    showMyActivitiesSection() {
        console.log("Exibindo seção de minhas atividades");

        // Esconder outras seções
        document.getElementById('activities-section').classList.add('hidden');
        document.getElementById('create-activity-section').classList.add('hidden');

        // Mostrar seção de minhas atividades
        document.getElementById('my-activities-section').classList.remove('hidden');

        // Use debounce para evitar requisições excessivas
        if (!this._debouncedLoadUser) {
            this._debouncedLoadUser = debounce(() => this.loadUserActivities(), 300);
        }
        this._debouncedLoadUser();
    },

    /**
     * Exibe a seção de criação de atividade
     */
    showCreateActivitySection() {
        console.log("Tentando exibir seção de criação de atividade");

        // Verificar se o usuário é administrador
        if (!Auth.isAdmin()) {
            UI.showNotification('Apenas administradores podem criar atividades', 'error');
            return;
        }

        // EXPLICITAMENTE esconder todas as outras seções primeiro
        document.getElementById('activities-section').classList.add('hidden');
        document.getElementById('my-activities-section').classList.add('hidden');

        // Obter referência à seção de criação
        const createSection = document.getElementById('create-activity-section');
        if (!createSection) {
            console.error("Seção de criação não encontrada no DOM");
            return;
        }

        // Garantir que a seção esteja visível
        createSection.classList.remove('hidden');
        createSection.style.display = 'block';
        console.log("Seção de criação exibida");

        // Garantir que o formulário esteja visível
        const form = document.getElementById('create-activity-form');
        if (form) {
            form.classList.remove('hidden');
            form.style.display = 'block';
            console.log("Formulário de criação exibido");
        } else {
            console.error("Formulário de criação não encontrado no DOM");
        }

        // Verificar se o formulário foi renderizado corretamente
        setTimeout(() => {
            const formAfterRender = document.getElementById('create-activity-form');
            if (formAfterRender) {
                console.log("Formulário ainda existe após renderização:", formAfterRender);
                console.log("Estilo do formulário:", formAfterRender.style.display);
                console.log("Classes do formulário:", formAfterRender.className);
            } else {
                console.error("Formulário desapareceu após renderização");
            }
        }, 100);
    }
};