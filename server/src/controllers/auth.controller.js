const authService = require('../services/auth.service');
const { bearerToken, verifyAccessToken } = require('../utils/jwt');

async function register(req, res, next) {
    try {
        const result = await authService.register(req.body);
        res.status(201).json({
            ok: true,
            message: 'пользователь зарегистрирован',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

async function login(req, res, next) {
    try {
        const result = await authService.login(req.body);
        res.status(200).json({
            ok: true,
            message: 'Вход успешен',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

async function me(req, res, next) {
    try {
        const token = bearerToken(req.headers.authorization);
        if (!token) {
            const error = new Error('нету токина авторизации');
            error.status = 401;
            throw error;
        }

        const payload = verifyAccessToken(token);
        const result = await authService.getCurrentUser(payload.sub);
        res.status(200).json({
            ok: true,
            message: 'пользователь получин',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    me
};
