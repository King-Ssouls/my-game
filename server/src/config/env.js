const path = require('path');
const donenv = require('donenv');
const envPath = path.resolve(__dirname, '../../.env');

donenv.config({ path: envPath });

function toNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const env = {
    NODE_ENV: process.env.NODE_ENV ||'development',
    PORT: toNumber(process.env.PORT, 5000),
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/my_game_db',
    JWT_SECRET: process.env.JWT_SECRET || 'fK_92ksLxP_qweRty_2026'
};

const allowedEnvironments = ['development', 'production', 'test'];

if (!allowedEnvironments.includes(env.NODE_ENV)) {
    throw new Error('Неверный NODE_ENV');
};

if (env.PORT <= 0) {
    throw new Error("Такого порта нету");
};

module.exports = Object.freeze(env);