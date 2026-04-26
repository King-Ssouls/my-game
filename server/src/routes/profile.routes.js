const express = require('express');
const profileController = require('../controllers/profile.controller');
const {updateProfileValidation, handleValidationErrors } = require('../validators/profile.validator');
const {bearerToken, verifyAccessToken} = require('../utils/jwt');

const router = express.Router();

function requireAuth(req, res, next) {
    try {
        const token = bearerToken(req.headers.authorization);

        if (!token) {
            const error = new Error('токен авторизации отсутствует');
            error.status = 401;
            throw error;
        }

        const payload = verifyAccessToken(token);

        req.auth = payload;
        next();
    } catch (error) {
        next(error);
    }
}

router.get('/me', requireAuth, profileController.getMyProfile);


router.patch(
    '/me',
    requireAuth,
    updateProfileValidation,
    handleValidationErrors,
    profileController.updateMyProfile
);

module.exports = router;
