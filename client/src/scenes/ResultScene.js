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
    const safeMs = Math.max(0, Number(ms) || 0);
    const totalSeconds = Math.floor(safeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

        this.add
            .text(centerX, panelY - PANEL_HEIGHT / 2 - 34, `\u0423\u0440\u043e\u0432\u0435\u043d\u044c ${this.levelNumber}`, {
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
            .text(0, -168, '\u0418\u0442\u043e\u0433\u0438 \u043a\u0430\u0440\u0442\u044b', {
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
            ['\u041e\u0447\u043a\u0438', String(this.score)],
            ['\u0412\u0440\u0435\u043c\u044f', formatTimeValue(this.elapsedMs)],
            ['\u0423\u0431\u0438\u0442\u043e \u0432\u0440\u0430\u0433\u043e\u0432', String(this.kills)],
            ['\u041f\u043e\u043b\u0443\u0447\u0435\u043d\u043e \u0443\u0440\u043e\u043d\u0430', String(this.damageTaken)]
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

        const restartButton = this.createActionButton(-150, 154, '\u041d\u0430\u0447\u0430\u0442\u044c \u0437\u0430\u043d\u043e\u0432\u043e', () => {
            this.scene.start('GameScene', {
                levelNumber: this.levelNumber
            });
        });

        const menuButton = this.createActionButton(150, 154, '\u0412 \u043c\u0435\u043d\u044e', () => {
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
    }
}
