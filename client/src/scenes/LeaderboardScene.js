import Phaser from 'phaser';
import levelsApi from '../api/levelsApi.js';
import recordsApi from '../api/recordsApi.js';
import authStore from '../store/authStore.js';
import RecordRow from '../ui/RecordRow.js';
import { clearGameHud } from '../ui/HUD.js';

function formatTime(ms) {
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

export default class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super('LeaderboardScene');

        this.levels = [];
        this.currentLevelNumber = 1;
        this.rows = [];
        this.levelButtons = [];
        this.loadingText = null;
        this.personalBestText = null;
        this.errorText = null;
        this.backButton = null;
        this.headerTexts = [];
        this.headerDrawn = false;
    }

    init(data) {
        this.currentLevelNumber = data?.levelNumber || 1;
    }

    create() {
        const { width } = this.scale;

        clearGameHud();
        this.cameras.main.setBackgroundColor('#0b1220');

        this.add
            .text(width / 2, 55, 'Таблица рекордов', {
                fontFamily: 'Arial',
                fontSize: '42px',
                color: '#ffffff',
                fontStyle: 'bold'
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, 100, 'Топ игроков по карте и личный лучший результат', {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#94a3b8'
            })
            .setOrigin(0.5);

        this.createBackButton();

        this.loadingText = this.add
            .text(width / 2, 170, 'Загрузка', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#cbd5e1'
            })
            .setOrigin(0.5);

        this.personalBestText = this.add
            .text(80, 215, '', {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#93c5fd'
            })
            .setOrigin(0, 0.5);

        this.errorText = this.add
            .text(width / 2, 250, '', {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#fca5a5'
            })
            .setOrigin(0.5);

        this.loadInitialData();

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this);
    }

    async loadInitialData() {
        try {
            authStore.hydrate();

            const levels = await levelsApi.getLevels();
            this.levels = Array.isArray(levels) ? levels : [];

            if (!this.levels.length) {
                this.showError('Список карт пуст');
                return;
            }

            const levelExists = this.levels.some((level) => {
                return Number(level.number) === Number(this.currentLevelNumber);
            });

            if (!levelExists) {
                this.currentLevelNumber = Number(this.levels[0].number);
            }

            this.createLevelButtons();
            await this.loadLeaderboard(this.currentLevelNumber);
        } catch (error) {
            this.showError(error.message || 'Не удалось загрузить рекорды');
        }
    }

    createLevelButtons() {
        this.levelButtons.forEach((button) => {
            button.destroy();
        });

        this.levelButtons = [];

        const startX = 80;
        const startY = 140;
        const buttonWidth = 90;
        const gap = 10;

        this.levels.forEach((level, index) => {
            const x = startX + index * (buttonWidth + gap);
            const isSelected = Number(level.number) === Number(this.currentLevelNumber);

            const button = this.add
                .rectangle(x, startY, buttonWidth, 36, 0x0f172a, 1)
                .setOrigin(0, 0.5)
                .setStrokeStyle(2, isSelected ? 0x38bdf8 : 0x334155)
                .setInteractive({ useHandCursor: true });

            const label = this.add
                .text(x + buttonWidth / 2, startY, `Карта ${level.number}`, {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    color: isSelected ? '#7dd3fc' : '#ffffff'
                })
                .setOrigin(0.5);

            button.on('pointerdown', async () => {
                this.currentLevelNumber = Number(level.number);
                this.createLevelButtons();
                await this.loadLeaderboard(this.currentLevelNumber);
            });

            const container = this.add.container(0, 0, [
                button,
                label
            ]);

            this.levelButtons.push(container);
        });
    }

    async loadLeaderboard(levelNumber) {
        this.clearRows();

        this.loadingText.setText(`Загрузка рекордов карты ${levelNumber}...`);
        this.errorText.setText('');
        this.personalBestText.setText('');

        try {
            const result = await recordsApi.getLevelRecords(levelNumber);
            const leaderboard = result?.leaderboard || [];
            const personalBest = result?.personalBest || null;

            this.loadingText.setText('');

            if (personalBest) {
                this.personalBestText.setText(
                    `Личный рекорд — Очки: ${personalBest.bestScore}, Время: ${formatTime(personalBest.bestTimeMs)}`
                );
            } else {
                this.personalBestText.setText('Личный рекорд пока отсутствует');
            }

            this.drawHeader();

            if (!leaderboard.length) {
                this.errorText.setText('Для этой карты пока нет рекордов');
                return;
            }

            const currentUserId = authStore.getUser()?.id || null;
            const startY = 320;
            const rowGap = 68;

            leaderboard.forEach((record, index) => {
                const isCurrentUser =
                    currentUserId &&
                    String(record.userId) === String(currentUserId);

                const row = new RecordRow(
                    this,
                    this.scale.width / 2,
                    startY + index * rowGap,
                    record,
                    {
                        width: 860,
                        height: 56,
                        isCurrentUser
                    }
                );

                this.rows.push(row);
            });
        } catch (error) {
            this.loadingText.setText('');
            this.showError(error.message || 'Ошибка загрузки лидерборда');
        }
    }

    drawHeader() {
        if (this.headerDrawn) {
            return;
        }

        const y = 275;
        const width = this.scale.width;

        const placeText = this.add
            .text(width / 2 - 390, y, 'Место', {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#cbd5e1',
                fontStyle: 'bold'
            })
            .setOrigin(0, 0.5);

        const playerText = this.add
            .text(width / 2 - 300, y, 'Игрок', {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#cbd5e1',
                fontStyle: 'bold'
            })
            .setOrigin(0, 0.5);

        const scoreText = this.add
            .text(width / 2 + 120, y, 'Очки', {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#cbd5e1',
                fontStyle: 'bold'
            })
            .setOrigin(0.5);

        const timeText = this.add
            .text(width / 2 + 280, y, 'Время', {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#cbd5e1',
                fontStyle: 'bold'
            })
            .setOrigin(0.5);

        this.headerTexts = [
            placeText,
            playerText,
            scoreText,
            timeText
        ];

        this.headerDrawn = true;
    }

    createBackButton() {
        const { width, height } = this.scale;

        this.backButton = this.add
            .text(width / 2, height - 30, '← Назад в меню', {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#38bdf8',
                backgroundColor: '#0f172a',
                padding: { x: 12, y: 8 }
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

    showError(message) {
        this.errorText.setText(message || 'Произошла ошибка');
    }

    clearRows() {
        this.rows.forEach((row) => {
            row.destroy();
        });

        this.rows = [];
    }

    cleanup() {
        this.clearRows();

        this.levelButtons.forEach((button) => {
            button.destroy();
        });

        this.levelButtons = [];

        this.headerTexts.forEach((text) => {
            text.destroy();
        });

        this.headerTexts = [];
        this.headerDrawn = false;

        if (this.backButton) {
            this.backButton.destroy();
            this.backButton = null;
        }
    }
}
