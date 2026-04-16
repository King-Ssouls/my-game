const app = require('./app');
const http = require('http');
const env = require('./config/env');
const connectDB = require('./config/db');

const server = http.createServer(app);

function shutdown(signal) {
    console.log(`сигнал ${signal}. остановка сервера`);

    server.close(() => {
        console.log('Сервер остановлен');
        process.exit(0);
    });
}

async function startServer() {
    try {
        await connectDB();

        server.listen(env.PORT, () => {
        console.log(`Сервер запущен: http://localhost:${env.PORT}`);
        });
    } catch (error) {
        console.error('Не удалось запустить сервер:', error);
        process.exit(1);
    }
}

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Порт ${env.PORT} уже занят`);
        process.exit(1);
    }

    console.error('Не удалось запустить сервер:', error);
    process.exit(1);
});

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();