import Phaser from 'phaser';
import gameConfig from './config/gameConfig.js';
import './styles/main.css';

function startGame() {
    if(window.__MY_GAME__) {
        return;
    }

    const game = new Phaser.Game(gameConfig);
    window.__MY_GAME__ = game;

}

window.addEventListener("DOMContentLoaded", startGame);