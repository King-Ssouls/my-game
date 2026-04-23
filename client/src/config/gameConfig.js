import Phaser from 'phaser';
import BootScene from '../scenes/BootScene.js';
import PreloadScene from '../scenes/PreloadScene.js';

//дописать!!
import LoginScene from '../scenes/LoginScene.js';
import MenuScene from '../scenes/MenuScene.js';

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
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, PreloadScene, LoginScene, MenuScene]
};

export default gameConfig;