const express = require('express');
const levelsController = require('../controllers/levels.controller');
const {bearerToken, verifyAccessToken} = require('../utils/jwt');
const router = express.Router();

function requireAuth(req, res, next) {
    try {

        const token = bearerToken(req.headers.authorization);
        if (!token) {
            const error = new Error('токена авторизации нету');
            error.status = 401;
            throw error;
        }

        req.auth = verifyAccessToken(token);
        next();
    } catch (error) {
        next(error);
    }
}

router.get('/', levelsController.listLevels);
router.post('/:levelNumber/start', requireAuth, levelsController.startLevel);

module.exports = router;