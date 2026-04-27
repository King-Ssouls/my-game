const levelRunService = require('./levelRun.service');

function createAppError(status, message) {
    const error = new Error(message);
    error.status = status;

    return error;
}

function toNonNegativeInteger(value, fieldName) {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue) || numberValue < 0) {
        throw createAppError(400, `${fieldName} должен быть не отрицательынм`);
    }

    return Math.floor(numberValue);
}

async function validateCompletion({
    userId,
    level,
    run,
    payload
}) {
    if (run.userId.toString() !== String(userId)) {
        throw createAppError(403, 'эта попытка не принадлежит этому пользователю');
    }

    if (run.levelId.toString() !== level._id.toString()) {
        throw createAppError(400, 'эта попытка не соответствует этому уровню');
    }

    if (run.levelNumber !== level.number) {
        throw createAppError(400, 'не тот номер уровня для этой попытки');
    }

    if (run.status !== 'started') {
        throw createAppError(409, 'попытка уже завершена');
    }

    if (run.expiresAt.getTime() < Date.now()) {
        await levelRunService.markRunExpired(run._id);
        throw createAppError(410, 'время попытки истекло');
    }

    const elapsedMs = toNonNegativeInteger(payload.elapsedMs, 'elapsedMs');
    const score = toNonNegativeInteger(payload.score, 'score');
    const kills = toNonNegativeInteger(payload.kills, 'kills');
    const damageTaken = toNonNegativeInteger(payload.damageTaken || 0, 'damageTaken');
    const deathsTaken = toNonNegativeInteger(payload.deathsTaken || 0, 'deathsTaken');

    if (elapsedMs < level.minCompletionTimeMs) {
        throw createAppError(400, 'время прохождения меньше допустимого для уровня');
    }

    const serverElapsedMs = Math.max(0, Date.now() - run.startedAt.getTime());

    if (elapsedMs + 3000 < serverElapsedMs) {
        throw createAppError(400, 'время прохождения не совпадает с временем начала попытки');
    }

    if (elapsedMs > serverElapsedMs + 30000) {
        throw createAppError(400, 'время прохождения слишком сильно отличается от серверного времени');
    }

    if (score > level.maxScore) {
        throw createAppError(400, 'очки превышают максимальное значение для уровня');
    }

    if (kills > 9999 || damageTaken > 9999 || deathsTaken > 9999) {
        throw createAppError(400, 'отправленная статистика выглядит неправильно');
    }

    return {
        elapsedMs,
        score,
        kills,
        damageTaken,
        deathsTaken
    };
}

module.exports = {
    validateCompletion
};