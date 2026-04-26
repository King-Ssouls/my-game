const ENEMY_ANIMATIONS = [
    {
        key: 'enemy-idle',
        textureKey: 'enemy-sheet',
        frames: ['0'],
        frameRate: 1,
        repeat: -1
    },
    {
        key: 'enemy-walk',
        textureKey: 'enemy-sheet',
        frames: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        frameRate: 9,
        repeat: -1
    },
    {
        key: 'enemy-hurt',
        textureKey: 'enemy-hurt-sheet',
        frames: ['0', '1'],
        frameRate: 10,
        repeat: 0
    },
    {
        key: 'enemy-death',
        textureKey: 'enemy-death-sheet',
        frames: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        frameRate: 9,
        repeat: 0
    }
];

function createFrames(textureKey, frameIndexes) {
    return frameIndexes.map((frame) => ({
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
        frames: createFrames(animation.textureKey, animation.frames),
        frameRate: animation.frameRate,
        repeat: animation.repeat
    });
}

export function createEnemyAnimations(scene) {
    ENEMY_ANIMATIONS.forEach((animation) => {
        createAnimationIfMissing(scene, animation);
    });
}
