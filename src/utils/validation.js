const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const validatePassword = (password) => {
    return password.length >= 8; // Senha deve ter pelo menos 8 caracteres
};

module.exports = { validateEmail, validatePassword };