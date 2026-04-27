import Phaser from 'phaser';
import { clearGameHud } from '../ui/HUD.js';

const PANEL_WIDTH = 760;
const PANEL_HEIGHT = 470;
const STATS_PANEL_WIDTH = 640;
const STATS_PANEL_HEIGHT = 186;
const BUTTON_WIDTH = 260;
const BUTTON_HEIGHT = 60;
const BUTTON_COLOR = 0x9702a7;
const BUTTON_HOVER_COLOR = 0xb103c3;

function formatTimeValue(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const minutesString = String(minutes);
    const secondsString = String(seconds);
    const formattedMinutes = minutesString.padStart(2, '0');
    const formattedSeconds = secondsString.padStart(2, '0');

    const result = `${formattedMinutes}:${formattedSeconds}`;
    return result;
}

export default class ResultScene extends Phaser.Scene {
    constructor() {
        super('ResultScene');

        this.levelNumber = 1;
        this.elapsedMs = 0;
        this.score = 0;
        this.kills = 0;
        this.damageTaken = 0;
        this.handleEscape = null;
        this.actionButtons = [];
        this.backButton = null;
    }

    init(data) {
        this.levelNumber = Number(data?.levelNumber) || 1;
        this.elapsedMs = Number(data?.time) || 0;
        this.score = Number(data?.score) || 0;
        this.kills = Number(data?.kills) || 0;
        this.damageTaken = Number(data?.damageTaken) || 0;
        this.actionButtons = [];
    }

    create() {
        clearGameHud();

        const { width, height } = this.scale;
        const centerX = width / 2;
        const panelY = height / 2 + 40;

        this.cameras.main.setBackgroundColor('#08101d');
        this.cameras.main.setZoom(1);

        this.add.rectangle(centerX, height / 2, width, height, 0x030712, 0.78);

        this.backButton = this.add
            .text(54, 42, '← Назад', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#e2e8f0',
                backgroundColor: '#0f172a',
                padding: { x: 12, y: 8 }
            })
            .setOrigin(0, 0.5)
            .setInteractive({ useHandCursor: true });

        this.backButton.on('pointerover', () => {
            this.backButton.setColor('#ffffff');
        });

        this.backButton.on('pointerout', () => {
            this.backButton.setColor('#e2e8f0');
        });

        this.backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        this.add
            .text(centerX, panelY - PANEL_HEIGHT / 2 - 34, `Уровень ${this.levelNumber}`, {
                fontFamily: 'Arial',
                fontSize: '28px',
                color: '#e2e8f0',
                fontStyle: 'bold'
            })
            .setOrigin(0.5);

        const panel = this.add.container(centerX, panelY);

        const panelBackground = this.add
            .rectangle(0, 0, PANEL_WIDTH, PANEL_HEIGHT, 0x0f172a, 0.96)
            .setStrokeStyle(2, 0x334155, 1);

        const title = this.add
            .text(0, -168, 'Итоги карты', {
                fontFamily: 'Arial',
                fontSize: '38px',
                color: '#ffffff',
                fontStyle: 'bold'
            })
            .setOrigin(0.5);

        const statsPanel = this.add
            .rectangle(0, -24, STATS_PANEL_WIDTH, STATS_PANEL_HEIGHT, 0x111827, 1)
            .setStrokeStyle(1, 0x334155, 1);

        panel.add([panelBackground, title, statsPanel]);

        const rows = [
            ['Очки', String(this.score)],
            ['Время', formatTimeValue(this.elapsedMs)],
            ['Убито врагов', String(this.kills)],
            ['Получено урона', String(this.damageTaken)]
        ];

        rows.forEach(([label, value], index) => {
            const y = -84 + index * 40;

            const labelText = this.add
                .text(-270, y, label, {
                    fontFamily: 'Arial',
                    fontSize: '26px',
                    color: '#cbd5e1',
                    fontStyle: 'bold'
                })
                .setOrigin(0, 0.5);

            const valueText = this.add
                .text(270, y, value, {
                    fontFamily: 'Arial',
                    fontSize: '28px',
                    color: '#ffffff',
                    fontStyle: 'bold'
                })
                .setOrigin(1, 0.5);

            panel.add([labelText, valueText]);
        });

        const restartButton = this.createActionButton(-150, 154, 'Начать заново', () => {
            this.scene.start('GameScene', {
                levelNumber: this.levelNumber
            });
        });

        const menuButton = this.createActionButton(150, 154, 'В меню', () => {
            this.scene.start('MenuScene');
        });

        panel.add([restartButton.container, menuButton.container]);
        this.actionButtons.push(restartButton, menuButton);

        this.handleEscape = () => {
            this.scene.start('MenuScene');
        };

        this.input.keyboard.on('keydown-ESC', this.handleEscape);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this);
    }

    createActionButton(x, y, label, onClick) {
        const background = this.add
            .rectangle(x, y, BUTTON_WIDTH, BUTTON_HEIGHT, BUTTON_COLOR, 1)
            .setStrokeStyle(2, 0xe9d5ff, 0.32)
            .setInteractive({ useHandCursor: true });

        const text = this.add
            .text(x, y, label, {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold'
            })
            .setOrigin(0.5);

        background.on('pointerover', () => {
            background.setFillStyle(BUTTON_HOVER_COLOR, 1);
        });

        background.on('pointerout', () => {
            background.setFillStyle(BUTTON_COLOR, 1);
        });

        background.on('pointerdown', () => {
            onClick();
        });

        return {
            background,
            text,
            container: this.add.container(0, 0, [background, text])
        };
    }

    cleanup() {
        clearGameHud();

        if (this.handleEscape) {
            this.input.keyboard.off('keydown-ESC', this.handleEscape);
            this.handleEscape = null;
        }

        this.actionButtons.forEach((button) => {
            button.background?.removeAllListeners();
        });

        this.actionButtons = [];

        if (this.backButton) {
            this.backButton.removeAllListeners();
            this.backButton.destroy();
            this.backButton = null;
        }
    }
}