const ENEMY_ANIMATIONS = [
    {
        key: 'enemy-idle',
        textureKey: 'enemy-sheet',
        start: 0,
        end: 0,
        frameRate: 1,
        repeat: -1
    },
    {
        key: 'enemy-walk',
        textureKey: 'enemy-sheet',
        start: 0,
        end: 9,
        frameRate: 9,
        repeat: -1
    },
    {
        key: 'enemy-attack',
        textureKey: 'enemy-attack-sheet',
        start: 0,
        end: 4,
        frameRate: 10,
        repeat: 0
    },
    {
        key: 'enemy-hurt',
        textureKey: 'enemy-hurt-sheet',
        start: 0,
        end: 1,
        frameRate: 10,
        repeat: 0
    },
    {
        key: 'enemy-death',
        textureKey: 'enemy-death-sheet',
        start: 0,
        end: 9,
        frameRate: 5,
        repeat: 0
    }
];

function createAnimationIfMissing(scene, animation) {
    if (scene.anims.exists(animation.key)) return;

    scene.anims.create({
        key: animation.key,
        frames: scene.anims.generateFrameNumbers(animation.textureKey, {
            start: animation.start,
            end: animation.end
        }),
        frameRate: animation.frameRate,
        repeat: animation.repeat
    });
}

export function createEnemyAnimations(scene) {
    ENEMY_ANIMATIONS.forEach(animation => {
        createAnimationIfMissing(scene, animation);
    });
}