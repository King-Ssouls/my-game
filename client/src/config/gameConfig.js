import Phaser from 'phaser';
import BootScene from '../scenes/BootScene.js';
import PreloadScene from '../scenes/PreloadScene.js';
import LoginScene from '../scenes/LoginScene.js';
import MenuScene from '../scenes/MenuScene.js';
import GameScene from '../scenes/GameScene.js';

const sceneRegistry = {
    BootScene,
    PreloadScene,
    LoginScene,
    MenuScene,
    GameScene
};

const defaultSceneOrder = [
    'BootScene',
    'PreloadScene',
    'LoginScene',
    'MenuScene',
    'GameScene'
];

const devSceneOrder = [
    'MenuScene',
    'GameScene',
    'BootScene',
    'PreloadScene',
    'LoginScene'
];

const sceneOrder = import.meta.env.DEV ? devSceneOrder : defaultSceneOrder;

const gameConfig = {
    type: Phaser.AUTO,
    parent: 'app',
    width: 1980,
    height: 1080,
    backgroundColor: '#10131a',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },
    autoFocus: true,
    disableContextMenu: true,
    input: {
        keyboard: {
            target: window,
            capture: [
                Phaser.Input.Keyboard.KeyCodes.UP,
                Phaser.Input.Keyboard.KeyCodes.LEFT,
                Phaser.Input.Keyboard.KeyCodes.RIGHT,
                Phaser.Input.Keyboard.KeyCodes.SPACE,
                Phaser.Input.Keyboard.KeyCodes.W,
                Phaser.Input.Keyboard.KeyCodes.A,
                Phaser.Input.Keyboard.KeyCodes.D,
                Phaser.Input.Keyboard.KeyCodes.F
            ]
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: sceneOrder.map((sceneKey) => sceneRegistry[sceneKey])
};

export default gameConfig;