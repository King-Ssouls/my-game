const ENEMY_TEXTURE_KEY = 'enemy-sheet';
const ENEMY_ANIMATIONS = [
    {
        key: 'enemy-idle',
        frames: ['0'],
        frameRate: 1,
        repeat: -1
    },
    {
        key: 'enemy-walk',
        frames: ['0', '1'],
        frameRate: 5,
        repeat: -1
    },
    {
        key: 'enemy-hurt',
        frames: ['2'],
        frameRate: 1,
        repeat: 0
    },
    {
        key: 'enemy-death',
        frames: ['3'],
        frameRate: 1,
        repeat: 0
    }
];

function createFrames(textureKey, frameNames) {
    return frameNames.map((frame) => ({
        key: textureKey,
        frame
    }));
}

function createAnimationIfMissing(scene, animation) {
    if (scene.anims.exists(animation.key)) {
        return;
    }

    scene.anims.create({
        key: animation.key,
        frames: createFrames(ENEMY_TEXTURE_KEY, animation.frames),
        frameRate: animation.frameRate,
        repeat: animation.repeat
    });
}

export function createEnemyAnimations(scene) {
    ENEMY_ANIMATIONS.forEach((animation) => {
        createAnimationIfMissing(scene, animation);
    });
}
