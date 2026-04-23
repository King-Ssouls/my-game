import Phaser from "phaser";
import authStore from '../store/authStore.js';
import authApi from '../api/authApi.js';

import warImage from '../assets/images/backgrounds/War.png';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');

        this.statusText = null;
    }
    
    preload() {
        this.load.image('pixel', warImage);
    }

    async create() {
        if (document.fonts) {
            await Promise.all([
                document.fonts.load('28px "Press Start 2P"'),
                document.fonts.load('20px "Press Start 2P"')
            ]);
        }

        const width = this.scale.width;
        const height = this.scale.height;

        this.cameras.main.setBackgroundColor('#0f1720');

        this.add.rectangle(width / 2, height / 2, 420, 120, 0x16202b, 1)
        .setStrokeStyle(2, 0x2b3c4d);

        this.add
        .text(width / 2, height / 2 - 34, 'Загрузка', {
            fontFamily: '"Press Start 2P"',
            fontSize: '28px',
            color: '#ffffff'
        })
        .setOrigin(0.5);

        this.statusText = this.add
        .text(width / 2, height / 2 + 18, 'Проверка сессии', {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            color: '#9fd3ff'
        })
        .setOrigin(0.5);

        await this.getNextSceneName();
    }

    async getNextSceneName() {
        try {
            authStore.hydrate();

            if (authStore.isUserLoggedIn()) {

                const result = await authApi.getMe();

                authStore.setSession({
                    token: authStore.getToken(),
                    user: result.user,
                    progress: result.progress
                });

                this.scene.start('MenuScene');
                return;
            }
        } catch (error) {
            authStore.clear();
        }

        this.scene.start('LoginScene');
    }
}