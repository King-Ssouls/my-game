const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');

const app = express();

app.disable('x-powered-by');
app.use(
    cors({
        origin: env.CLIENT_URL,
        credentials: true,
    }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/', (req, res) => {
    res.json({
        ok: true,
        message: 'Сервер запущен',
    });
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'glimmer-api',
    env: env.NODE_ENV,
    time: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Маршрут не найден',
  });
});

app.use((error, req, res, _next) => {
  console.error('[SERVER ERROR]', error);

  res.status(error.status || 500).json({
    ok: false,
    message: error.message || 'Ошибка сервера',
  });
});

module.exports = app;
