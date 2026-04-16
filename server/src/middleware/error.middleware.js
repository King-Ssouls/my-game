function errorMiddleware(error, req, res, next) {
    let status = error.status || 500;
    let message = error.message || 'ошибка сервера';
    let details = undefined;

    if (error.name === 'ValidationError') {
        status = 400;
        message = 'проверка не удалась';
        details = Object.values(error.errors).map(
            (item) => item.message
        );
    };

    if (error.code === 11000) {
        status = 409;

        const duplicatedField =
            Object.keys(error.keyPattern || error.keyValue || {})[0] || 'поле';

        message = `${duplicatedField} уже существует`
    };

    if (error.name === 'JsonWebTokenError') {
        status = 401;
        message = 'недействительный токен';
    };

    if (error.name === 'TokenExpiredError') {
        status = 401;
        message = 'срок действия токена истек'
    };

    if (error.name === 'CastError') {
        status = 400;
        message = 'неверный идентификатор';
    };

    if (status >= 500) {
        console.error('[ERROR]', error);
    };

    const responseBody = {
        ok: false,
        message
    };
    if (details) {
        responseBody.details = details;
    };

    res.status(status).json(responseBody);
}

module.exports = errorMiddleware;