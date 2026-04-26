const userService = require('../services/user.service');

async function getMyProfile(req, res, next) {
    try {
        const result = await userService.getProfileByUserId(req.auth.sub);

        res.status(200).json({
            ok: true,
            message: 'Профиль загружен',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function updateMyProfile(req, res, next) {
    try {
        const result = await userService.updateProfileByUserId(
            req.auth.sub,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Профиль успешно обновлен',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getMyProfile,
    updateMyProfile
};