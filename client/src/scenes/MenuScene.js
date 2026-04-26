import Phaser from 'phaser';
import authStore from '../store/authStore.js';
import Button from '../ui/Button.js';
import Notification from '../ui/Notification.js';
import forestImage from '../assets/images/backgrounds/forest.png';
import { addBrandTitle, addMenuBackdrop, applyMenuPanelStyles } from '../utils/menuTheme.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');

        this.panel = null;
        this.notification = null;
        this.playButton = null;
        this.levelsButton = null;
        this.profileButton = null;
        this.logoutButton = null;
    }

    preload() {
        if (!this.textures.exists('menuForest')) {
            this.load.image('menuForest', forestImage);
        }
    }

    create() {
        addMenuBackdrop(this);
        this.cameras.main.fadeIn(250, 0, 0, 0);
        addBrandTitle(this);

        this.notification = new Notification();
        this.createPanel();

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this);
    }

    createPanel() {
        this.panel = document.createElement('div');
        this.panel.style.position = 'fixed';
        this.panel.style.left = '50%';
        this.panel.style.top = '56%';
        this.panel.style.transform = 'translate(-50%, -50%)';
        this.panel.style.width = '420px';
        this.panel.style.maxWidth = 'calc(100vw - 32px)';
        this.panel.style.padding = '24px';
        this.panel.style.zIndex = '1000';
        applyMenuPanelStyles(this.panel);

        const title = document.createElement('div');
        title.style.color = '#f6f1d1';
        title.style.fontSize = '18px';
        title.style.fontWeight = '700';
        title.style.marginBottom = '10px';
        title.textContent = '\u0413\u043b\u0430\u0432\u043d\u043e\u0435 \u043c\u0435\u043d\u044e';

        const subtitle = document.createElement('div');
        subtitle.style.color = 'rgba(226, 239, 217, 0.82)';
        subtitle.style.fontSize = '12px';
        subtitle.style.lineHeight = '1.6';
        subtitle.style.marginBottom = '20px';
        subtitle.textContent =
            '\u0418\u0433\u0440\u0430\u0442\u044c \u0441\u0440\u0430\u0437\u0443 \u0437\u0430\u043f\u0443\u0441\u043a\u0430\u0435\u0442 \u0443\u0440\u043e\u0432\u0435\u043d\u044c, \u0430 \u043a\u043d\u043e\u043f\u043a\u0430 "\u0412\u044b\u0431\u043e\u0440 \u043a\u0430\u0440\u0442" \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u043c\u0435\u043d\u044e \u0443\u0440\u043e\u0432\u043d\u0435\u0439.';

        this.panel.appendChild(title);
        this.panel.appendChild(subtitle);

        const buttons = document.createElement('div');
        buttons.style.display = 'grid';
        buttons.style.gridTemplateColumns = '1fr';
        buttons.style.gap = '12px';

        this.panel.appendChild(buttons);

        this.playButton = new Button({
            container: buttons,
            text: '\u0418\u0433\u0440\u0430\u0442\u044c',
            variant: 'primary',
            fontFamily: '"Press Start 2P", sans-serif',
            fontSize: '12px',
            onClick: () => this.handlePlay()
        });

        this.levelsButton = new Button({
            container: buttons,
            text: '\u0412\u044b\u0431\u043e\u0440 \u043a\u0430\u0440\u0442',
            variant: 'primary',
            fontFamily: '"Press Start 2P", sans-serif',
            fontSize: '12px',
            onClick: () => this.handleOpenLevels()
        });

        this.profileButton = new Button({
            container: buttons,
            text: '\u041f\u0440\u043e\u0444\u0438\u043b\u044c',
            variant: 'primary',
            fontFamily: '"Press Start 2P", sans-serif',
            fontSize: '12px',
            onClick: () => this.scene.start('ProfileScene')
        });

        this.logoutButton = new Button({
            container: buttons,
            text: '\u0412\u044b\u0439\u0442\u0438',
            variant: 'primary',
            fontFamily: '"Press Start 2P", sans-serif',
            fontSize: '12px',
            onClick: () => this.handleLogout()
        });

        document.body.appendChild(this.panel);
    }

    handlePlay() {
        this.scene.start('GameScene', {
            levelNumber: 1
        });
    }

    handleOpenLevels() {
        this.scene.start('LevelSelectScene');
    }

    handleLogout() {
        authStore.clear();
        this.notification.show('\u0412\u044b \u0432\u0435\u0440\u043d\u0443\u043b\u0438\u0441\u044c \u0432 \u043c\u0435\u043d\u044e \u0432\u0445\u043e\u0434\u0430.', 'info');
        this.scene.start('LoginScene');
    }

    cleanup() {
        if (this.playButton) {
            this.playButton.destroy();
            this.playButton = null;
        }

        if (this.levelsButton) {
            this.levelsButton.destroy();
            this.levelsButton = null;
        }

        if (this.profileButton) {
            this.profileButton.destroy();
            this.profileButton = null;
        }

        if (this.logoutButton) {
            this.logoutButton.destroy();
            this.logoutButton = null;
        }

        if (this.panel) {
            this.panel.remove();
            this.panel = null;
        }

        if (this.notification) {
            this.notification.destroy();
            this.notification = null;
        }
    }
}
