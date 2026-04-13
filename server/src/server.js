const app = require('./app');
const http = require('http');
const env = require('./config/env');

const server = http.createServer(app);

server.listen(env.PORT, () => {
    console.log(`Сервер запущен: http://localhost:${env.PORT}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Порт ${env.PORT} уже занят`);
        process.exit(1);
    }

    console.error('Не удалось запустить сервер:', error);
    process.exit(1);
});

function shutdown(signal) {
    console.log(`Получен сигнал ${signal}. Останавливаю сервер...`);

    server.close(() => {
        console.log('Сервер остановлен');
        process.exit(0);
    });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
