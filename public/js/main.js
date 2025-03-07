/**
 * Script principal: Inicializa todos os módulos e configura comportamentos globais
 */

// Flag para controlar carregamento de atividades
let activitiesLoadingInProgress = false;

document.addEventListener('DOMContentLoaded', () => {
    console.log("Página carregada, inicializando aplicação...");

    // Inicializar os módulos
    Auth.init();
    Activities.init();

    // Verificar e exibir status de administrador para debug
    const userRole = localStorage.getItem('userRole');
    console.log('Role do usuário no localStorage:', userRole);
    console.log('Usuário é admin?', userRole === 'admin');

    // Verificar visibilidade dos elementos admin-only
    const adminElements = document.querySelectorAll('.admin-only');
    console.log(`Encontrados ${adminElements.length} elementos admin-only`);
    adminElements.forEach((el, index) => {
        console.log(`Elemento admin-only ${index + 1}:`, el, 'Visível:', !el.classList.contains('hidden'));
    });

    // Verificar especificamente o botão de criar atividade
    const createActivityBtn = document.getElementById('create-activity-btn');
    if (createActivityBtn) {
        console.log('Botão de criar atividade encontrado, visibilidade:',
            !createActivityBtn.parentElement.classList.contains('hidden'));
    } else {
        console.error('Botão de criar atividade não encontrado no DOM');
    }

    // Se o usuário estiver autenticado, carregar atividades automaticamente
    if (Auth.isAuthenticated) {
        // Verificar novamente o status de admin
        console.log('Autenticado como admin?', Auth.isAdmin());

        // Crie um pequeno atraso para evitar excesso de requisições
        setTimeout(() => {
            Activities.loadAllActivities();
        }, 500);
    }

    // Verificar token JWT expirado
    checkTokenExpiration();

    // Configura comportamento responsivo
    setupResponsiveUI();

    // Adicionar um evento para atualizar a UI quando o storage mudar
    // (isso ajuda quando você loga em outra aba)
    window.addEventListener('storage', (event) => {
        if (event.key === 'token' || event.key === 'userRole') {
            console.log('Storage alterado, atualizando UI');
            Auth.init();
        }
    });
});

/**
 * Verifica se o token JWT está expirado
 */
function checkTokenExpiration() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        // Decodificar o token
        const payload = API.parseJwt(token);
        if (!payload) {
            handleExpiredToken();
            return;
        }

        // Verificar expiração
        const now = Date.now() / 1000;
        if (payload.exp && payload.exp < now) {
            handleExpiredToken();
        }
    } catch (e) {
        console.error('Erro ao verificar token:', e);
    }
}

/**
 * Manipula token expirado
 */
function handleExpiredToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');

    // Disparar evento de sessão expirada
    document.dispatchEvent(new CustomEvent('auth:sessionExpired'));
}

/**
 * Configura comportamentos responsivos
 */
function setupResponsiveUI() {
    // Exemplo: Adicionar classe para identificar dispositivos móveis
    if (window.innerWidth < 768) {
        document.body.classList.add('mobile');
    }

    // Adicionar outros comportamentos responsivos conforme necessário
}

/**
 * Função de debounce para limitar a frequência de chamadas de função
 * @param {Function} func Função a ser executada
 * @param {Number} wait Tempo de espera em ms
 * @returns {Function} Função com debounce
 */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}