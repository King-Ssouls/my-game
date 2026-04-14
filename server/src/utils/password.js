const bcrypt = require('bcryptjs');
const saltRounds  = 10;

async function hashPassword(password) {
    if (!password || typeof password !== 'string') {
        throw new Error('пароль должен быть непустой строкой');
    }

    return bcrypt.hash(password, saltRounds);
};

async function comparePassword(password, passwordHash) {
    if(!password || !passwordHash) {
        return false;
    }

    return bcrypt.compare(password, passwordHash);
};

module.exports = {
    saltRounds,
    hashPassword,
    comparePassword,
};