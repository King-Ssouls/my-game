const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const errorMiddleware = require('./middleware/error.middleware');
const profileRoutes = require('./routes/profile.routes');

const app = express();

app.disable('x-powered-by');

app.use(
    cors({
        origin: env.CLIENT_URL,
        credentials: true,
    }),
);

app.use(express.json(
    { limit: '1mb' }
));
app.use(express.urlencoded(
    { extended: true }
));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

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

app.use(errorMiddleware);

module.exports = app;