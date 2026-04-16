const jwt = require('jsonwebtoken');
const env = require('../config/env');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3d';

function signAccessToken(payload) {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

function verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_SECRET);
};

function bearerToken(authorizationHeader = '') {
    if (!authorizationHeader.startsWith('Bearer ')) {
        return null;
    }

    return authorizationHeader.slice(7).trim();
};

module.exports = {
    JWT_EXPIRES_IN,
    signAccessToken,
    verifyAccessToken,
    bearerToken,
};