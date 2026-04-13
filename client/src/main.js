import Phaser from 'phaser';
import gameConfig from './config/gameConfig.js';
import './styles/main.css';

function startGame() {
    if (window.__MY_GAME__) {
        return;
    }

    window.__MY_GAME__ = new Phaser.Game(gameConfig);
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', startGame, { once: true });
} else {
    startGame();
}
