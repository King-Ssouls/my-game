const CACHE_TTL_MS = 60 * 1000;

let cachedLevels = null;
let expiresAt = 0;

function getCachedLevels() {
    if (!cachedLevels) {
        return null;
    }

    if (Date.now() > expiresAt) {
        cachedLevels = null;
        expiresAt = 0;

        return null;
    }

    return cachedLevels;
}

function setCachedLevels(levels, ttlMs = CACHE_TTL_MS) {
    cachedLevels = levels;
    expiresAt = Date.now() + ttlMs;

    return levels;
}

function invalidateLevelsCache() {
    cachedLevels = null;
    expiresAt = 0;
}

module.exports = {
    CACHE_TTL_MS,
    getCachedLevels,
    setCachedLevels,
    invalidateLevelsCache
};