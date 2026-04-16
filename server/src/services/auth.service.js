const User = require('../models/User');
const Progress = require('../models/Progress');
const { hashPassword, comparePassword } = require('../utils/password');
const { signAccessToken } = require('../utils/jwt');

function createAppError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
};

function makeNicknamefromEmail(email) {
    const nickname = email
        .split('@')[0]
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .slice(0, 16);

    return nickname.length >= 4 ? nickname : 'player';
};

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
};

function isValidEmail(email) {
    return /^\S+@\S+\.\S+$/.test(email);
};

function sanitizeUser(userDocument) {
    return {
        id: userDocument._id.toString(),
        email: userDocument.email,
        nickname: userDocument.nickname,
        avatarUrl: userDocument.avatarUrl,
        role: userDocument.role,
        createdAt: userDocument.createdAt,
        updatedAt: userDocument.updatedAt
    };
};

function sanitizeProgress(progressDocument) {
  return {
    id: progressDocument._id.toString(),
    userId: progressDocument.userId.toString(),
    unlockedLevels: progressDocument.unlockedLevels,
    completedLevels: progressDocument.completedLevels,
    levelStars: progressDocument.levelStars,
    currentLevel: progressDocument.currentLevel,
    totalScore: progressDocument.totalScore,
    totalDeaths: progressDocument.totalDeaths,
    totalPlayTime: progressDocument.totalPlayTime,
    createdAt: progressDocument.createdAt,
    updatedAt: progressDocument.updatedAt
  };
};

async function findOrCreateProgress(userId) {
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
    return progress;
};

async function register(payload) {
    const email = normalizeEmail(payload.email);
    const password = String(payload.password || '');
    const nickname = String(payload.nickname || payload.nicname || '').trim();

    if (!email) {
        throw createAppError(400, "Требуется электронная почта");
    }
    if (!isValidEmail(email)) {
        throw createAppError(400, "Неверная фформа электронной почты");
    }
    if (!password)  {
        throw createAppError(400, "Пароль обязателен");
    }
    if (password.length < 6) {
        throw createAppError(400, "Пароль должен быть 6 символов");
    }
    if (password.length > 20) {
        throw createAppError(400, "Пароль не может быть больше 20 символов");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw createAppError(409, "Почта уже занята");
    }

    const passwordHash = await hashPassword(password);
    const finalNickname = nickname || makeNicknamefromEmail(email);
    
    const user = await User.create({
        email,
        passwordHash,
        nickname: finalNickname
    });

    const progress = await Progress.create({
        userId: user._id
    });

    const token = signAccessToken({
        sub: user._id.toString(),
        email: user.email,
        role: user.role
    });

    return {
        token,
        user: sanitizeUser(user),
        progress: sanitizeProgress(progress)
    };
};

async function login(payload) {
    const email = normalizeEmail(payload.email);
    const password = String(payload.password || '');

    if (!email || !password) {
        throw createAppError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
        throw createAppError(401, 'Invalid email or password');
    }

    const passwordMatches = await comparePassword(password, user.passwordHash);
    if (!passwordMatches) {
        throw createAppError(401, 'Invalid email or password');
    }

    const progress = await findOrCreateProgress(user._id);
    const token = signAccessToken({
        sub: user._id.toString(),
        email: user.email,
        role: user.role
    });

    return {
        token,
        user: sanitizeUser(user),
        progress: sanitizeProgress(progress)
    };
};

async function getCurrentUser(userId) {
    if (!userId) {
        throw createAppError(401, "прервать выполнение")
    }
    const user = await User.findById(userId);

    if(!user) {
        throw createAppError(404, "Данный пользователь не найден");
    }
    const progress = await findOrCreateProgress(user._id);

    return {
        user: sanitizeUser(user),
        progress: sanitizeProgress(progress)
    };
};

module.exports ={
    register,
    login,
    getCurrentUser
};
