const app = require('./app');
const http = require('http');
const env = require('./config/env');
const server = http.createServer(app);

server.listen(env.PORT, () => {
    console.log(`Сервер запущен http://localhost:${env.PORT}`);
})

server.on('error', (error) =>{

    if (error.code === "EADDRINUSE") {
      console.error(`Порт ${env.PORT} уже занят`);
      process.exit(1);
    }

    console.error('Не запустить сервер:', error);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('Сервер приостаовлен');
    server.close(() => {
        console.log('Сервер приостоновлен');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('Сервер приостоновлен');
    server.close(() => {
      console.log('Сервер приостоновлен');
      process.exit(0);
    });
});