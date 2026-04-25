import Phaser from 'phaser';
import authStore from '../store/authStore.js';
import authApi from '../api/authApi.js';
import warImage from '../assets/images/backgrounds/War.png';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');

        this.statusText = null;
        this.progressBar = null;
        this.progressBox = null;
        this.extraDelayMs = 500;
    }

    preload() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.cameras.main.setBackgroundColor('#0f1720');

        this.add
            .rectangle(width / 2, height / 2, 420, 150, 0x16202b, 1)
            .setStrokeStyle(2, 0x2b3c4d);

        this.add
            .text(width / 2, height / 2 - 45, 'Загрузка', {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                color: '#ffffff'
            })
            .setOrigin(0.5);

        this.statusText = this.add
            .text(width / 2, height / 2 - 5, '0%', {
                fontFamily: '"Press Start 2P"',
                fontSize: '16px',
                color: '#9fd3ff'
            })
            .setOrigin(0.5);

        this.progressBox = this.add
            .rectangle(width / 2, height / 2 + 38, 280, 18, 0x233142)
            .setOrigin(0.5);

        this.progressBar = this.add
            .rectangle(width / 2 - 140, height / 2 + 38, 0, 18, 0x4fc3f7)
            .setOrigin(0, 0.5);

        this.load.image('pixel', warImage);

        this.load.on('progress', (value) => {
            const percent = Math.round(value * 100);
            this.statusText.setText(`${percent}%`);
            this.progressBar.width = 280 * value;
        });

        this.load.on('complete', () => {
            this.statusText.setText('Проверка');
        });
    }

    async create() {
        if (document.fonts) {
            await Promise.all([
                document.fonts.load('24px "Press Start 2P"'),
                document.fonts.load('16px "Press Start 2P"')
            ]);
        }

        const width = this.scale.width;
        const height = this.scale.height;

        this.cameras.main.setBackgroundColor('#0f1720');
        this.cameras.main.fadeIn(250, 0, 0, 0);
        this.children.removeAll();

        this.add
            .rectangle(width / 2, height / 2, 420, 120, 0x16202b, 1)
            .setStrokeStyle(2, 0x2b3c4d);

        this.add
            .text(width / 2, height / 2 - 34, 'Загрузка', {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                color: '#ffffff'
            })
            .setOrigin(0.5);

        this.statusText = this.add
            .text(width / 2, height / 2 + 18, 'Проверка', {
                fontFamily: '"Press Start 2P"',
                fontSize: '16px',
                color: '#9fd3ff'
            })
            .setOrigin(0.5);

        await this.getNextSceneName();
    }

    async getNextSceneName() {
        let nextScene = 'LoginScene';

        try {
            authStore.hydrate();

            if (authStore.isAuthenticated()) {
                const result = await authApi.getMe();

                authStore.setSession({
                    token: authStore.getToken(),
                    user: result.user,
                    progress: result.progress
                });

                nextScene = 'MenuScene';
            }
        } catch (error) {
            authStore.clear();
        }

        await this.startSceneWithDelay(nextScene);
    }

    async startSceneWithDelay(sceneKey) {
        await this.wait(this.extraDelayMs);
        this.cameras.main.fadeOut(220, 0, 0, 0);
        await this.wait(220);
        this.scene.start(sceneKey);
    }

    wait(duration) {
        return new Promise((resolve) => {
            this.time.delayedCall(duration, resolve);
        });
    }
}
