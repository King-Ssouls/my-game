const User = require('../models/User');
const Progress = require('../models/Progress');

function createAppError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function sanitizeUser(userDocument) {
    return {
        id: userDocument._id.toString(),
        email: userDocument.email,
        nickname: userDocument.nickname,
        avatarUrl: userDocument.avatarUrl || '',
        role: userDocument.role,
        createdAt: userDocument.createdAt,
        updatedAt: userDocument.updatedAt
    };
}

function sanitizeProgress(progressDocument) {
    if (!progressDocument) {
        return null;
    }

    return {
        id: progressDocument._id.toString(),
        userId: progressDocument.userId.toString(),
        unlockedLevels: progressDocument.unlockedLevels || [],
        completedLevels: progressDocument.completedLevels || [],
        currentLevel: progressDocument.currentLevel || 1,
        totalScore: progressDocument.totalScore || 0,
        totalDeaths: progressDocument.totalDeaths || 0,
        totalPlayTime: progressDocument.totalPlayTime || 0,
        createdAt: progressDocument.createdAt,
        updatedAt: progressDocument.updatedAt
    };
}

function formatPlayTime(totalSeconds = 0) {
    const value = Math.max(0, Math.floor(Number(totalSeconds) || 0));
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2, '0')}`;
    }

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2,'0')}`;
}

function buildStats(progressDocument) {
    const unlockedLevels = progressDocument?.unlockedLevels || [];
    const completedLevels = progressDocument?.completedLevels || [];
 

    const totalPlayTime = Number(progressDocument?.totalPlayTime || 0);

    return {
        unlockedLevelsCount: unlockedLevels.length,
        completedLevelsCount: completedLevels.length,
        totalScore: Number(progressDocument?.totalScore || 0),
        totalDeaths: Number(progressDocument?.totalDeaths || 0),
        totalPlayTime,
        totalPlayTimeFormatted: formatPlayTime(totalPlayTime),
        currentLevel: Number(progressDocument?.currentLevel || 1)
    };
}

async function getProfileByUserId(userId) {
    const user = await User.findById(userId);

    if (!user) {
        throw createAppError(404, 'пользователь не найден');
    }

    const progress = await Progress.findOne({ userId: user._id });

    return {
        user: sanitizeUser(user),
        progress: sanitizeProgress(progress),
        stats: buildStats(progress)
    };
}

async function updateProfileByUserId(userId, payload = {}) {
    const user = await User.findById(userId);

    if (!user) {
        throw createAppError(404, 'пользователь не найден');
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'email')) {
        const nextEmail = normalizeEmail(payload.email);

        if (!nextEmail) {
        throw createAppError(400, 'почта не может быть пустой');
        }

        if (nextEmail !== user.email) {
        const existingUser = await User.findOne({ email: nextEmail });

        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
            throw createAppError(409, 'пользователь с такой почтой уже есть');
        }

        user.email = nextEmail;
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'nickname')) {
        const nextNickname = String(payload.nickname || '').trim();

        if (!nextNickname) {
        throw createAppError(400, 'никнейм не может быть пустым');
        }

        user.nickname = nextNickname;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'avatarUrl')) {
        const nextAvatarUrl = String(payload.avatarUrl || '').trim();
        user.avatarUrl = nextAvatarUrl || '';
    }

    await user.save();

    const progress = await Progress.findOne({ userId: user._id });

    return {
        user: sanitizeUser(user),
        progress: sanitizeProgress(progress),
        stats: buildStats(progress)
    };
}

module.exports = {
    getProfileByUserId,
    updateProfileByUserId
};