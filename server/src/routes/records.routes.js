const express = require('express');
const recordsController = require('../controllers/records.controller');
const {bearerToken, verifyAccessToken} = require('../utils/jwt');
const {completeRecordValidation, handleValidationErrors} = require('../validators/record.validator');

const router = express.Router();

function requireAuth(req, res, next) {
    try {
        const token = bearerToken(req.headers.authorization);
        if (!token) {
            const error = new Error('нету токена авторизации');
            error.status = 401;
            throw error;
        }

        req.auth = verifyAccessToken(token);
        next();
    } catch (error) {
        next(error);
    }
}

function optionalAuth(req, res, next) {
    try {
        const token = bearerToken(req.headers.authorization);

        if (!token) {
            req.auth = null;
            return next();
        }

        req.auth = verifyAccessToken(token);
        next();
    } catch (error) {
        req.auth = null;
        next();
    }
}

router.get('/level/:levelNumber', optionalAuth, recordsController.getLevelRecords);

router.post('/complete', requireAuth,
    completeRecordValidation,
    handleValidationErrors,
    recordsController.completeLevel
);

module.exports = router;