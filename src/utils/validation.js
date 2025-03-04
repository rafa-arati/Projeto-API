// Validação de e-mail
const validateEmail = (email) => {
    if (!email) return { valid: false, message: 'E-mail é obrigatório' };

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
        return { valid: false, message: 'Formato de e-mail inválido' };
    }

    return { valid: true };
};

// Validação de senha
const validatePassword = (password) => {
    if (!password) return { valid: false, message: 'Senha é obrigatória' };
    if (password.length < 8) {
        return { valid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
    }

    // Verificar se a senha tem pelo menos um número e uma letra
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasLetter || !hasNumber) {
        return {
            valid: false,
            message: 'A senha deve conter pelo menos uma letra e um número'
        };
    }

    return { valid: true };
};

// Validação de dados da atividade
const validateActivity = (activity) => {
    const errors = [];

    if (!activity.title) {
        errors.push('Título é obrigatório');
    }

    if (!activity.description) {
        errors.push('Descrição é obrigatória');
    }

    if (!activity.date) {
        errors.push('Data é obrigatória');
    } else {
        // Verificar se a data é válida
        const dateObj = new Date(activity.date);
        if (isNaN(dateObj.getTime())) {
            errors.push('Data inválida');
        }
    }

    if (!activity.location) {
        errors.push('Local é obrigatório');
    }

    if (!activity.maxParticipants) {
        errors.push('Número máximo de participantes é obrigatório');
    } else if (isNaN(activity.maxParticipants) || activity.maxParticipants <= 0) {
        errors.push('Número máximo de participantes deve ser um número positivo');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateEmail,
    validatePassword,
    validateActivity
};