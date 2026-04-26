const PLAYER_TEXTURE_KEY = 'player-sheet';

const PLAYER_ANIMATIONS = [
    {
        key: 'player-idle',
        frames: ['0'],
        frameRate: 1,
        repeat: -1
    },
    {
        key: 'player-run',
        frames: ['1', '2'],
        frameRate: 8,
        repeat: -1
    },
    {
        key: 'player-jump',
        frames: ['3'],
        frameRate: 1,
        repeat: -1
    },
    {
        key: 'player-attack',
        frames: ['4', '0'],
        frameRate: 10,
        repeat: 0
    },
    {
        key: 'player-hurt',
        frames: ['5'],
        frameRate: 1,
        repeat: 0
    },
    {
        key: 'player-death',
        frames: ['5'],
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
        frames: createFrames(PLAYER_TEXTURE_KEY, animation.frames),
        frameRate: animation.frameRate,
        repeat: animation.repeat
    });
}

export function createPlayerAnimations(scene) {
    PLAYER_ANIMATIONS.forEach((animation) => {
        createAnimationIfMissing(scene, animation);
    });
}
