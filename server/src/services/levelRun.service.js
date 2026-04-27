const { randomBytes } = require('node:crypto');
const LevelRun = require('../models/LevelRun');

function createAppError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function generateRunToken() {
    return randomBytes(24).toString('hex');
}

async function createRun({ userId, level, ttlMinutes = 10 }) {
    
    await LevelRun.updateMany(
        {
            userId,
            levelId: level._id,
            status: 'started'
        },
        {
            $set: {
                status: 'cancelled'
            }
        }
    );

    const now = Date.now();
    const expiresAt = new Date(now + ttlMinutes * 60 * 1000);

    const run = await LevelRun.create({
        userId,
        levelId: level._id,
        levelNumber: level.number,
        runToken: generateRunToken(),
        status: 'started',
        startedAt: new Date(now),
        expiresAt
    });

    return run;
}

async function getActiveRunByToken({ userId, levelNumber, runToken }) {

    const run = await LevelRun.findOne({
        userId,
        levelNumber,
        runToken
    });

    if (!run) {
        throw createAppError(404, 'не запустить');
    }

    return run;
}

async function markRunCompleted(runId, submittedResult) {

    return LevelRun.findByIdAndUpdate(
        runId,
        { $set: {
                status: 'completed',
                completedAt: new Date(),
                submittedResult
            }
        },
        { new: true }
    );
}

async function markRunExpired(runId) {

    return LevelRun.findByIdAndUpdate(
        runId,
        {
            $set: { status: 'expired' }
        },
        { new: true }
    );
}

module.exports = {
    createRun,
    getActiveRunByToken,
    markRunCompleted,
    markRunExpired
};