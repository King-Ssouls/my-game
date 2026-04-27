const CACHE_TTL_MS = 30 * 1000;

const leaderboardStore = new Map();

function makeLeaderboardKey(levelNumber) {
    return `level:${levelNumber}`;
}

function getCachedLeaderboard(levelNumber) {
    const key = makeLeaderboardKey(levelNumber);
    const cached = leaderboardStore.get(key);

    if (!cached) {
        return null;
    }

    const isExpired = Date.now() > cached.expiresAt;

    if (isExpired) {
        leaderboardStore.delete(key);
        return null;
    }

    return cached.value;
}

function setCachedLeaderboard(levelNumber, value, ttlMs = CACHE_TTL_MS) {
    const key = makeLeaderboardKey(levelNumber);

    leaderboardStore.set(key, {
        value,
        expiresAt: Date.now() + ttlMs
    });

    return value;
}

function invalidateLeaderboard(levelNumber) {
    const key = makeLeaderboardKey(levelNumber);
    leaderboardStore.delete(key);
}

function clearLeaderboardCache() {
    leaderboardStore.clear();
}

module.exports = {
    CACHE_TTL_MS,
    getCachedLeaderboard,
    setCachedLeaderboard,
    invalidateLeaderboard,
    clearLeaderboardCache
};