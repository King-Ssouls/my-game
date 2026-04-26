const { body, validationResult } = require('express-validator');

const updateProfileValidation = [
    body('nickname')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 4, max: 20 })
        .withMessage('никнейм должен бытиь от 4 до 20 символов'),

    body('email')
        .optional()
        .isString()
        .trim()
        .isEmail()
        .withMessage('неправильный формат почты')
        .normalizeEmail(),

    body('avatarUrl')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 500 })
        .withMessage('аватарка слишком длинная')
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
    updateProfileValidation,
    handleValidationErrors
};