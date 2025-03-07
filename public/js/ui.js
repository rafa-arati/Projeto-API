/**
 * Módulo UI: Funções utilitárias para manipulação da interface
 */
const UI = {
    /**
     * Exibe uma notificação temporária
     * @param {String} message Mensagem a ser exibida
     * @param {String} type Tipo de notificação (success, error, info)
     * @param {Number} duration Duração em ms (padrão: 3000ms)
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        // Definir a mensagem
        notification.textContent = message;
        
        // Aplicar classe de estilo
        notification.className = ''; // Limpar classes
        notification.classList.add(type);
        
        // Exibir a notificação
        notification.classList.remove('hidden');
        
        // Configurar timer para esconder
        setTimeout(() => {
            notification.classList.add('hidden');
        }, duration);
    },
    
    /**
     * Formata uma data para exibição
     * @param {String|Date} dateString Data a ser formatada
     * @returns {String} Data formatada
     */
    formatDate(dateString) {
        if (!dateString) return 'Data não disponível';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data inválida';
        
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};