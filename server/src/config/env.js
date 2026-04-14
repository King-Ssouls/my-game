const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

function toNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: toNumber(process.env.PORT, 5000),
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/glimmer_db',
    JWT_SECRET: process.env.JWT_SECRET,
};

if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
}

const allowedEnvironments = ['development', 'production', 'test'];

if (!allowedEnvironments.includes(env.NODE_ENV)) {
    throw new Error('Неверный NODE_ENV');
}

if (env.PORT <= 0) {
    throw new Error('Некорректный PORT');
}

module.exports = Object.freeze(env);
