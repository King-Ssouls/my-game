import Phaser from 'phaser';

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

export default class RecordRow extends Phaser.GameObjects.Container {
    constructor(scene, x, y, record, options = {}) {
        super(scene, x, y);

        this.scene = scene;
        this.record = record;
        this.widthValue = options.width || 860;
        this.heightValue = options.height || 58;
        this.isCurrentUser = Boolean(options.isCurrentUser);

        const backgroundColor = this.isCurrentUser ? 0x1d4ed8 : 0x0f172a;
        const borderColor = this.isCurrentUser ? 0x93c5fd : 0x334155;

        this.background = scene.add
            .rectangle(0, 0, this.widthValue, this.heightValue, backgroundColor, 0.96)
            .setOrigin(0.5)
            .setStrokeStyle(2, borderColor);

        const positionText = scene.add
            .text(-this.widthValue / 2 + 24, 0, `#${record.position}`, {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#ffffff',
                fontStyle: 'bold'
            })
            .setOrigin(0, 0.5);

        const nickname = record.user?.nickname || 'Игрок';

        const nicknameText = scene.add
            .text(-this.widthValue / 2 + 110, 0, nickname, {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff'
            })
            .setOrigin(0, 0.5);

        const scoreText = scene.add
            .text(120, 0, String(record.bestScore ?? 0), {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#facc15',
                fontStyle: 'bold'
            })
            .setOrigin(0.5);

        const timeText = scene.add
            .text(280, 0, formatTime(record.bestTimeMs), {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#e2e8f0'
            })
            .setOrigin(0.5);

        this.add([
            this.background,
            positionText,
            nicknameText,
            scoreText,
            timeText
        ]);

        scene.add.existing(this);
    }
}