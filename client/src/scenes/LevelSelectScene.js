import Phaser from 'phaser';
import levels from '../data/levels.js';
import LevelCard from '../ui/LevelCard.js';

const LEVEL_CARD_WIDTH = 320;
const LEVEL_CARD_HEIGHT = 118;
const LEVEL_COLUMNS = 5;
const LEVEL_ROWS = 2;
const LEVEL_COLUMN_GAP = 24;
const LEVEL_ROW_GAP = 28;

export default class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super('LevelSelectScene');

        this.cards = [];
        this.backButton = null;
        this.handleEscape = null;
    }

    create() {
        const { width } = this.scale;

        this.cameras.main.setBackgroundColor('#0b1220');

        this.add
            .text(width / 2, 72, '\u0412\u044b\u0431\u043e\u0440 \u043a\u0430\u0440\u0442\u044b', {
                fontFamily: 'Arial',
                fontSize: '42px',
                color: '#ffffff',
                fontStyle: 'bold'
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, 122, '\u0412\u0441\u0435 10 \u0443\u0440\u043e\u0432\u043d\u0435\u0439 \u0441\u0435\u0439\u0447\u0430\u0441 \u043e\u0442\u043a\u0440\u044b\u0442\u044b', {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#9fb3c8'
            })
            .setOrigin(0.5);

        this.createLevelGrid();
        this.createBackButton();

        this.handleEscape = () => {
            this.scene.start('MenuScene');
        };

        this.input.keyboard.on('keydown-ESC', this.handleEscape);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this);
    }

    createLevelGrid() {
        const { width, height } = this.scale;
        const totalGridWidth =
            LEVEL_COLUMNS * LEVEL_CARD_WIDTH + (LEVEL_COLUMNS - 1) * LEVEL_COLUMN_GAP;
        const totalGridHeight =
            LEVEL_ROWS * LEVEL_CARD_HEIGHT + (LEVEL_ROWS - 1) * LEVEL_ROW_GAP;
        const startX = (width - totalGridWidth) / 2 + LEVEL_CARD_WIDTH / 2;
        const startY = Math.max(220, (height - totalGridHeight) / 2 + 14);

        levels.forEach((level, index) => {
            const column = index % LEVEL_COLUMNS;
            const row = Math.floor(index / LEVEL_COLUMNS);

            const x = startX + column * (LEVEL_CARD_WIDTH + LEVEL_COLUMN_GAP);
            const y = startY + row * (LEVEL_CARD_HEIGHT + LEVEL_ROW_GAP);

            const card = new LevelCard(this, x, y, level, {
                width: LEVEL_CARD_WIDTH,
                height: LEVEL_CARD_HEIGHT,
                onSelect: (selectedLevel) => {
                    this.scene.start('GameScene', {
                        levelNumber: selectedLevel.levelNumber
                    });
                }
            });

            this.cards.push(card);
        });
    }

    createBackButton() {
        const { width, height } = this.scale;

        this.backButton = this.add
            .text(width / 2, height - 42, '\u2190 \u041d\u0430\u0437\u0430\u0434 \u0432 \u043c\u0435\u043d\u044e', {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#38bdf8',
                backgroundColor: '#0f172a',
                padding: { x: 14, y: 8 }
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        this.backButton.on('pointerover', () => {
            this.backButton.setColor('#7dd3fc');
        });

        this.backButton.on('pointerout', () => {
            this.backButton.setColor('#38bdf8');
        });

        this.backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }

    cleanup() {
        this.cards.forEach((card) => {
            if (card && card.active) {
                card.destroy();
            }
        });

        this.cards = [];

        if (this.handleEscape) {
            this.input.keyboard.off('keydown-ESC', this.handleEscape);
            this.handleEscape = null;
        }

        if (this.backButton) {
            this.backButton.destroy();
            this.backButton = null;
        }
    }
}
