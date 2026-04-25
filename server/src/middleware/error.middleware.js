function errorMiddleware(error, req, res, next) {
    
    let status = error.status || 500;
    let message = error.message || 'Ошибка сервера';
    let details;

    if (error.name === 'ValidationError') {
        status = 400;
        message = 'Проверка данных не пройдена';
        details = Object.values(error.errors).map((item) => item.message);
    }

    if (error.code === 11000) {
        status = 409;

        const duplicatedField =
            Object.keys(error.keyPattern || error.keyValue || {})[0] || 'Поле';

        message = `${duplicatedField} уже существует`;
    }

    if (error.name === 'JsonWebTokenError') {
        status = 401;
        message = 'Недействительный токен';
    }

    if (error.name === 'TokenExpiredError') {
        status = 401;
        message = 'Срок действия токена истёк';
    }

    if (error.name === 'CastError') {
        status = 400;
        message = 'Неверный идентификатор';
    }

    if (status >= 500) {
        console.error('[ERROR]', error);
    }

    const responseBody = {
        ok: false,
        message
    };

    if (details) {
        responseBody.details = details;
    }

    res.status(status).json(responseBody);
}

module.exports = errorMiddleware;
