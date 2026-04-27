const recordService = require('../services/record.service');

async function getLevelRecords(req, res, next) {
    try {
        const levelNumber = Number(req.params.levelNumber);

        const result = await recordService.getLevelRecords({
            levelNumber,
            userId: req.auth?.sub || null
        });

        res.status(200).json({
            ok: true,
            message: 'рекорд получен',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function completeLevel(req, res, next) {
    try {
        const result = await recordService.submitCompletion({
            userId: req.auth.sub,
            payload: req.body
        });

        res.status(200).json({
            ok: true,
            message: 'результат принят',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getLevelRecords,
    completeLevel
};