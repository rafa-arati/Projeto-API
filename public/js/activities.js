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
     * Método para garantir que os listeners do modal estejam ativos
     * Deve ser chamado sempre que a lista de atividades for carregada
     */
    ensureModalListeners() {
        console.log('Verificando listeners do modal...');

        // Verificar se o modal existe
        const modal = document.getElementById('edit-activity-modal');
        if (!modal) {
            console.warn('Modal de edição não encontrado no DOM');
            return;
        }

        // Remover e readicionar o event listener do botão de fechar
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            // Clonar e substituir para remover listeners antigos
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

            // Adicionar novo listener
            newCloseBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            });
            console.log('Listener do botão de fechar do modal recriado');
        }

        // Remover e readicionar o event listener do formulário
        const form = document.getElementById('edit-activity-form');
        if (form) {
            // Clonar e substituir para remover listeners antigos
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);

            // Adicionar novo listener
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditActivity();
            });
            console.log('Listener do formulário de edição recriado');
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
 * Abre o modal de edição de atividade criando-o dinamicamente
 * @param {Object} activity Atividade a ser editada
 */
    openEditModal(activity) {
        try {
            console.log('Criando modal dinâmico para editar atividade:', activity);

            // Remover qualquer modal existente no DOM para evitar duplicação
            const existingModal = document.getElementById('edit-activity-modal');
            if (existingModal) {
                existingModal.remove();
            }

            // Criar o modal dinamicamente
            const modalHTML = `
            <div id="edit-activity-modal" class="modal" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); z-index: 1000; align-items: center; justify-content: center;">
                <div class="modal-content" style="background-color: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);">
                    <span class="close-modal" style="position: absolute; top: 10px; right: 15px; font-size: 28px; cursor: pointer; color: #555;">&times;</span>
                    <h2>Editar Atividade</h2>
                    <form id="edit-activity-form" class="form" style="width: 100%; margin-top: 20px;">
                        <input type="hidden" id="edit-activity-id" value="${activity.id}">
                        <div class="form-group">
                            <label for="edit-activity-title">Título:</label>
                            <input type="text" id="edit-activity-title" value="${activity.title || ''}" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;">
                        </div>
                        <div class="form-group">
                            <label for="edit-activity-description">Descrição:</label>
                            <textarea id="edit-activity-description" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; min-height: 100px; margin-bottom: 15px;">${activity.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="edit-activity-date">Data:</label>
                            <input type="datetime-local" id="edit-activity-date" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;">
                        </div>
                        <div class="form-group">
                            <label for="edit-activity-location">Local:</label>
                            <input type="text" id="edit-activity-location" value="${activity.location || ''}" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;">
                        </div>
                        <div class="form-group">
                            <label for="edit-activity-max-participants">Número Máximo de Participantes:</label>
                            <input type="number" id="edit-activity-max-participants" value="${activity.maxParticipants || ''}" min="1" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;">
                        </div>
                        <button type="submit" style="padding: 10px 20px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin-top: 10px;">Salvar Alterações</button>
                    </form>
                </div>
            </div>
        `;

            // Adicionar o modal ao body
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Configurar a data no formato correto para o input datetime-local
            const dateField = document.getElementById('edit-activity-date');
            if (dateField && activity.date) {
                try {
                    const activityDate = new Date(activity.date);
                    if (!isNaN(activityDate.getTime())) {
                        const year = activityDate.getFullYear();
                        const month = String(activityDate.getMonth() + 1).padStart(2, '0');
                        const day = String(activityDate.getDate()).padStart(2, '0');
                        const hours = String(activityDate.getHours()).padStart(2, '0');
                        const minutes = String(activityDate.getMinutes()).padStart(2, '0');

                        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
                        dateField.value = formattedDate;
                    }
                } catch (error) {
                    console.error('Erro ao processar data:', error);
                }
            }

            // Adicionar event listener para o botão de fechar
            const closeBtn = document.querySelector('#edit-activity-modal .close-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    const modal = document.getElementById('edit-activity-modal');
                    if (modal) {
                        modal.remove();
                    }
                });
            }

            // Adicionar event listener para o formulário
            const form = document.getElementById('edit-activity-form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();

                    // Coletar dados do formulário
                    const activityId = document.getElementById('edit-activity-id').value;
                    const title = document.getElementById('edit-activity-title').value;
                    const description = document.getElementById('edit-activity-description').value;
                    const date = document.getElementById('edit-activity-date').value;
                    const location = document.getElementById('edit-activity-location').value;
                    const maxParticipants = document.getElementById('edit-activity-max-participants').value;

                    // Validar dados
                    if (!title || !description || !date || !location || !maxParticipants) {
                        UI.showNotification('Por favor, preencha todos os campos', 'error');
                        return;
                    }

                    // Chamar API para atualizar
                    API.updateActivity(activityId, {
                        title,
                        description,
                        date,
                        location,
                        maxParticipants: parseInt(maxParticipants, 10)
                    }).then(() => {
                        // Remover o modal
                        const modal = document.getElementById('edit-activity-modal');
                        if (modal) {
                            modal.remove();
                        }

                        // Mostrar mensagem de sucesso
                        UI.showNotification('Atividade atualizada com sucesso!', 'success');

                        // Recarregar lista de atividades
                        this.loadAllActivities();
                    }).catch(error => {
                        UI.showNotification(error.message || 'Erro ao atualizar atividade', 'error');
                    });
                });
            }

            console.log('Modal dinâmico criado e configurado');
        } catch (error) {
            console.error('Erro ao criar modal dinâmico:', error);
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
    },

    /**
     * Fecha o modal de edição
     */
    closeEditModal() {
        const modal = document.getElementById('edit-activity-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            console.log('Modal de edição fechado');
        }
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
            console.log("Listener adicionado para formulário de edição");
        }

        // Botão para fechar o modal de edição
        const closeModalBtn = document.querySelector('#edit-activity-modal .close-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.closeEditModal();
            });
            console.log("Listener adicionado para botão de fechar modal de edição");
        }

        // Botões para fechar modais (geral)
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.add('hidden');
                    modal.style.display = 'none';
                });
            });
            console.log("Listener adicionado para fechar modais");
        });
    }
};