const levelService = require('../services/level.service');

async function listLevels(req, res, next) {
    try {
        const levels = await levelService.listPublishedLevels();

        res.status(200).json({
            ok: true,
            message: 'уровни получены',
            data: levels
        });
    } catch (error) {
        next(error);
    }
}

async function startLevel(req, res, next) {
    try {
        const levelNumber = Number(req.params.levelNumber);

        const result = await levelService.startLevelForUser({
            userId: req.auth.sub,
            levelNumber
        });

        res.status(200).json({
            ok: true,
            message: 'уровень успешо запуще',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    listLevels,
    startLevel
};  