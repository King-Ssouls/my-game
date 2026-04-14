const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
    const mongoUri = env.MONGO_URI

    if (!mongoUri) {
        throw new Error('MongoDB не может подключиться к env');
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    try {
        await mongoose.connect(mongoUri);

        console.log(
        `MongoDB подключение: ${mongoose.connection.host}/${mongoose.connection.name}`
        );

        return mongoose.connection;
    } catch (error) {
        console.error('оишбка подключения MongoDB:', error.message);
        throw error;
    }
}

module.exports = connectDB;
