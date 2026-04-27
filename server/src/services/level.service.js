const Level = require('../models/Level');
const levelRunService = require('./levelRun.service');
const { getCachedLevels, setCachedLevels } = require('../cache/levels.cache');

function createAppError(status, message) {
    const error = new Error(message);
    error.status = status;

    return error;
}

function getLevelTheme(number) {
    if (number <= 2) {
        return 'forest';
    }

    if (number <= 5) {
        return 'desert';
    }

    if (number <= 8) {
        return 'temple';
    }

    return 'crystal';
}

function createDefaultLevel(number) {
    return {
        number,
        title: `Карта ${number}`,
        slug: `level-${number}`,
        theme: getLevelTheme(number),
        isPublished: true,
        minCompletionTimeMs: 7000 + number * 1000,
        maxScore: 25000 + number * 2500,
        previewBackground: ''
    };
}

const DEFAULT_LEVELS = Array.from({ length: 10 }, (_, index) => {
    const number = index + 1;

    return createDefaultLevel(number);
});

async function ensureDefaultLevels() {
    const count = await Level.countDocuments();

    if (count > 0) {
        return;
    }

    await Level.insertMany(DEFAULT_LEVELS);
}

function formatLevel(level) {
    return {
        id: level._id.toString(),
        number: level.number,
        title: level.title,
        slug: level.slug,
        theme: level.theme,
        isPublished: level.isPublished,
        minCompletionTimeMs: level.minCompletionTimeMs,
        maxScore: level.maxScore,
        previewBackground: level.previewBackground || ''
    };
}

async function getLevelByNumberOrThrow(levelNumber) {
    await ensureDefaultLevels();

    const level = await Level.findOne({ number: levelNumber });

    if (!level) {
        throw createAppError(404, 'уровня нету');
    }

    return level;
}

async function listPublishedLevels() {
  await ensureDefaultLevels();

  const cached = getCachedLevels();
  if (cached) {
    return cached;
  }
  const levels = await Level.find({ isPublished: true }).sort({ number: 1 });
  const formatted = levels.map(formatLevel);

  setCachedLevels(formatted);

  return formatted;
}

async function startLevelForUser({ userId, levelNumber }) {
    const level = await getLevelByNumberOrThrow(levelNumber);

    if (!level.isPublished) {
        throw createAppError(403, 'уровень неопубликован');
    }

    const run = await levelRunService.createRun({
        userId,
        level
    });

    return {
        level: formatLevel(level),
        runToken: run.runToken,
        startedAt: run.startedAt,
        expiresAt: run.expiresAt
    };
}

module.exports = {
    ensureDefaultLevels,
    listPublishedLevels,
    getLevelByNumberOrThrow,
    startLevelForUser,
    formatLevel
}