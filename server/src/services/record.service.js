const Record = require('../models/Record');
const Progress = require('../models/Progress');
const levelService = require('./level.service');
const levelRunService = require('./levelRun.service');
const antiCheatService = require('./antiCheat.service');
const {getCachedLeaderboard, setCachedLeaderboard, invalidateLeaderboard } = require('../cache/leaderboard.cache');
function formatRecord(record) {
    let userId;
    let user = null;

    if (typeof record.userId === 'object' && record.userId?._id) {
        userId = record.userId._id.toString();

        user = {
            id: record.userId._id.toString(),
            nickname: record.userId.nickname || 'Игрок',
            avatarUrl: record.userId.avatarUrl || ''
        };
    } else {
        userId = record.userId.toString();
    }

    return {
        id: record._id.toString(),
        userId,
        user,
        levelId: record.levelId.toString(),
        levelNumber: record.levelNumber,
        bestTimeMs: record.bestTimeMs,
        bestScore: record.bestScore,
        kills: record.kills,
        damageTaken: record.damageTaken,
        deathsTaken: record.deathsTaken,
        lastRunAt: record.lastRunAt,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
    };
}

function isBetterResult(candidate, currentRecord) {
    if (!currentRecord) {
        return true;
    }

    if (candidate.score > currentRecord.bestScore) {
        return true;
    }

    if (candidate.score < currentRecord.bestScore) {
        return false;
    }

    if (candidate.elapsedMs < currentRecord.bestTimeMs) {
        return true;
    }

    if (candidate.elapsedMs > currentRecord.bestTimeMs) {
        return false;
    }

    return candidate.kills > currentRecord.kills;
}

function calculateLevelStars(score, maxScore) {
    const safeScore = Math.max(0, Number(score) || 0);
    const safeMaxScore = Math.max(0, Number(maxScore) || 0);

    if (safeMaxScore <= 0) {
        return 1;
    }

    const ratio = safeScore / safeMaxScore;

    if (ratio >= 0.9) {
        return 3;
    }

    if (ratio >= 0.6) {
        return 2;
    }

    return 1;
}

async function updateProgressAfterCompletion({ userId, level, normalizedResult }) {
    const progress = await Progress.findOneAndUpdate(
        { userId },
        {
            $setOnInsert: {
                userId
            }
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    );

    const unlockedLevels = new Set(progress.unlockedLevels || [1]);
    const completedLevels = new Set(progress.completedLevels || []);

    unlockedLevels.add(level.number);
    completedLevels.add(level.number);

    let nextLevelNumber = null;

    try {
        const nextLevel = await levelService.getLevelByNumberOrThrow(level.number + 1);

        if (nextLevel?.isPublished !== false) {
            nextLevelNumber = Number(nextLevel.number);
            unlockedLevels.add(nextLevelNumber);
        }
    } catch (error) {
        nextLevelNumber = null;
    }

    const nextStars = calculateLevelStars(normalizedResult.score, level.maxScore);
    const levelStars = Array.isArray(progress.levelStars)
        ? progress.levelStars.map((item) => ({
            levelNumber: Number(item?.levelNumber) || 0,
            stars: Number(item?.stars) || 0
        }))
        : [];

    const starEntryIndex = levelStars.findIndex((item) => {
        return Number(item.levelNumber) === Number(level.number);
    });

    if (starEntryIndex >= 0) {
        levelStars[starEntryIndex].stars = Math.max(levelStars[starEntryIndex].stars, nextStars);
    } else {
        levelStars.push({
            levelNumber: level.number,
            stars: nextStars
        });
    }

    const totalScoreAggregate = await Record.aggregate([
        {
            $match: {
                userId: progress.userId
            }
        },
        {
            $group: {
                _id: null,
                totalScore: {
                    $sum: '$bestScore'
                }
            }
        }
    ]);

    progress.unlockedLevels = [...unlockedLevels].sort((a, b) => a - b);
    progress.completedLevels = [...completedLevels].sort((a, b) => a - b);
    progress.levelStars = levelStars.sort((a, b) => a.levelNumber - b.levelNumber);
    progress.currentLevel = nextLevelNumber
        ? Math.max(Number(progress.currentLevel) || 1, nextLevelNumber)
        : Math.max(Number(progress.currentLevel) || 1, level.number);
    progress.totalScore = Number(totalScoreAggregate[0]?.totalScore || 0);
    progress.totalPlayTime = Number(progress.totalPlayTime || 0) + Math.max(0, Math.floor(normalizedResult.elapsedMs / 1000));
    progress.totalDeaths = Number(progress.totalDeaths || 0) + Math.max(0, Number(normalizedResult.deathsTaken) || 0);

    await progress.save();

    return progress;
}

async function getLeaderboardForLevel(level) {
  const cached = getCachedLeaderboard(level.number);

  if (cached) {
    return cached;
  }

  const records = await Record.find({ levelId: level._id })
    .sort({
      bestScore: -1,
      bestTimeMs: 1,
      updatedAt: 1
    })
    .limit(10)
    .populate('userId', 'nickname avatarUrl');

  const formatted = records.map((record, index) => ({
    position: index + 1,
    ...formatRecord(record)
  }));

  setCachedLeaderboard(level.number, formatted);

  return formatted;
}

async function getPersonalBestForLevel({ userId, levelId }) {
    if (!userId) {
        return null;
    }

    const record = await Record.findOne({
        userId,
        levelId
    });

    return record ? formatRecord(record) : null;
}

async function submitCompletion({ userId, payload }) {
    const level = await levelService.getLevelByNumberOrThrow(payload.levelNumber);

    const run = await levelRunService.getActiveRunByToken({
        userId,
        levelNumber: payload.levelNumber,
        runToken: payload.runToken
    });

    const normalizedResult = await antiCheatService.validateCompletion({
        userId,
        level,
        run,
        payload
    });

    let record = await Record.findOne({
        userId,
        levelId: level._id
    });

    const personalBestBefore = record;

    const better = isBetterResult(normalizedResult, record);

    if (!record) {
        record = await Record.create({
            userId,
            levelId: level._id,
            levelNumber: level.number,
            bestTimeMs: normalizedResult.elapsedMs,
            bestScore: normalizedResult.score,
            kills: normalizedResult.kills,
            damageTaken: normalizedResult.damageTaken,
            deathsTaken: normalizedResult.deathsTaken,
            lastRunAt: new Date()
        });
    } else if (better) {
        record.bestTimeMs = normalizedResult.elapsedMs;
        record.bestScore = normalizedResult.score;
        record.kills = normalizedResult.kills;
        record.damageTaken = normalizedResult.damageTaken;
        record.deathsTaken = normalizedResult.deathsTaken;
        record.lastRunAt = new Date();

        await record.save();
    }

    await levelRunService.markRunCompleted(run._id, normalizedResult);
    invalidateLeaderboard(level.number);
    const progress = await updateProgressAfterCompletion({
        userId,
        level,
        normalizedResult
    });

    const leaderboard = await getLeaderboardForLevel(level);

    const personalBest = await getPersonalBestForLevel({
        userId,
        levelId: level._id
    });

    return {
        accepted: true,
        isPersonalBest: !personalBestBefore || better,
        level: levelService.formatLevel(level),
        submitted: normalizedResult,
        progress,
        personalBest,
        leaderboard
    };
}

async function getLevelRecords({ levelNumber, userId = null }) {
    const level = await levelService.getLevelByNumberOrThrow(levelNumber);

    const leaderboard = await getLeaderboardForLevel(level);

    const personalBest = await getPersonalBestForLevel({
        userId,
        levelId: level._id
    });

    return {
        level: levelService.formatLevel(level),
        leaderboard,
        personalBest
    };
}

module.exports = {
    submitCompletion,
    getLevelRecords
};
