export default class HUD {
    constructor(scene) {
        this.scene = scene;

        this.healthText = scene.add
        .text(16, 16, 'HP: 0/0', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#0f172a',
            padding: { x: 10, y: 6 }
        })
        .setScrollFactor(0)
        .setDepth(100);

        this.scoreText = scene.add
        .text(16, 58, 'Очки: 0', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#ffffff',
            backgroundColor: '#0f172a',
            padding: { x: 10, y: 6 }
        })
        .setScrollFactor(0)
        .setDepth(100);

        this.timeText = scene.add
        .text(16, 98, 'Время: 00:00', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#ffffff',
            backgroundColor: '#0f172a',
            padding: { x: 10, y: 6 }
        })
        .setScrollFactor(0)
        .setDepth(100);

        this.statusText = scene.add
        .text(scene.scale.width / 2, 26, '', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#ffffff',
            backgroundColor: '#1e293b',
            padding: { x: 12, y: 6 }
        })
        .setScrollFactor(0)
        .setDepth(100)
        .setOrigin(0.5, 0);
    }

    setHealth(current, max) {
        this.healthText.setText(`HP: ${current}/${max}`);
    }

    setScore(score) {
        this.scoreText.setText(`Очки: ${score}`);
    }

    setTime(text) {
        this.timeText.setText(`Время: ${text}`);
    }

    setStatus(text) {
        this.statusText.setText(text || '');
    }

    destroy() {
        this.healthText.destroy();
        this.scoreText.destroy();
        this.timeText.destroy();
        this.statusText.destroy();
    }
}