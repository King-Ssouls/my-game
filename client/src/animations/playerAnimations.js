const PLAYER_ANIMATIONS = [
    {
        key: 'player-idle',
        textureKey: 'player-sheet',
        frames: ['0', '1', '2', '3', '4', '5', '6', '7'],
        frameRate: 7,
        repeat: -1
    },
    {
        key: 'player-run',
        textureKey: 'player-run-sheet',
        frames: ['0', '1', '2', '3', '4', '5', '6', '7'],
        frameRate: 7,
        repeat: -1
    },
    {
        key: 'player-jump',
        textureKey: 'player-jump-sheet',
        frames: ['0', '1'],
        frameRate: 8,
        repeat: -1
    },
    {
        key: 'player-fall',
        textureKey: 'player-fall-sheet',
        frames: ['0', '1'],
        frameRate: 8,
        repeat: -1
    },
    {
        key: 'player-attack',
        textureKey: 'player-attack-sheet',
        frames: ['0', '1', '2', '3', '4', '5', '6', '7'],
        frameRate: 7,
        repeat: 0
    },
    {
        key: 'player-hurt',
        textureKey: 'player-hurt-sheet',
        frames: ['0', '1', '2'],
        frameRate: 10,
        repeat: 0
    },
    {
        key: 'player-death',
        textureKey: 'player-death-sheet',
        frames: ['0', '1', '2', '3', '4', '5', '6'],
        frameRate: 6,
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

export function createPlayerAnimations(scene) {
    PLAYER_ANIMATIONS.forEach((animation) => {
        createAnimationIfMissing(scene, animation);
    });
}
