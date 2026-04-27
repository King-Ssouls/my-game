const { body, validationResult } = require('express-validator');

function sanitizeInteger(value) {
    if (value === undefined || value === null || value === '') {
        return value;
    }

    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
        return value;
    }

    return Math.floor(numberValue);
}

const completeRecordValidation = [
    body('levelNumber')
        .exists()
        .withMessage('номер уровня обязателен')
        .customSanitizer(sanitizeInteger)
        .isInt({ min: 1 })
        .withMessage('номер уровня должен быть положительным целым числом'),

    body('runToken')
        .exists()
        .withMessage('токен попытки обязателен')
        .isString()
        .withMessage('токен попытки должен быть строкой')
        .trim()
        .isLength({ min: 16, max: 128 })
        .withMessage('некорректная длина токена попытки'),

    body('elapsedMs')
        .exists()
        .withMessage('время прохождения обязательно')
        .customSanitizer(sanitizeInteger)
        .isInt({ min: 0 })
        .withMessage('время прохождения должно быть неотрицательным целым числом'),

    body('score')
        .exists()
        .withMessage('очки обязательны')
        .customSanitizer(sanitizeInteger)
        .isInt({ min: 0 })
        .withMessage('очки должны быть неотрицательным целым числом'),

    body('kills')
        .exists()
        .withMessage('количество убитых врагов обязательно')
        .customSanitizer(sanitizeInteger)
        .isInt({ min: 0 })
        .withMessage('количество убитых врагов должно быть неотрицательным целым числом'),

    body('damageTaken')
        .optional()
        .customSanitizer(sanitizeInteger)
        .isInt({ min: 0 })
        .withMessage('полученный урон должен быть неотрицательным целым числом'),

    body('deathsTaken')
        .optional()
        .customSanitizer(sanitizeInteger)
        .isInt({ min: 0 })
        .withMessage('количество смертей должно быть неотрицательным целым числом')
];

function handleValidationErrors(req, res, next) {
    const result = validationResult(req);

    if (result.isEmpty()) {
        return next();
    }

    return res.status(400).json({
        ok: false,
        message: 'ошибка валидации',
        details: result.array().map((item) => ({
            field: item.path,
            message: item.msg
        }))
    });
}

module.exports = {
    completeRecordValidation,
    handleValidationErrors
};
