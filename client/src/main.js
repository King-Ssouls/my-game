import Phaser from 'phaser';
import gameConfig from './config/gameConfig.js';
import './styles/main.css';

function destroyGame() {
    if (!window.__MY_GAME__) {
        return;
    }

    window.__MY_GAME__.destroy(true);
    window.__MY_GAME__ = null;
}

function startGame() {
    destroyGame();
    window.__MY_GAME__ = new Phaser.Game(gameConfig);
}

if (import.meta.hot) {
    import.meta.hot.accept(() => {
        startGame();
    });

    import.meta.hot.dispose(() => {
        destroyGame();
    });
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', startGame, { once: true });
} else {
    startGame();
}