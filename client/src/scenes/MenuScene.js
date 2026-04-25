import Phaser from 'phaser';
import authStore from '../store/authStore.js';
import Button from '../ui/Button.js';
import Notification from '../ui/Notification.js';
import { addBrandTitle, addMenuBackdrop, applyMenuPanelStyles } from '../utils/menuTheme.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');

        this.panel = null;
        this.notification = null;
        this.levelsButton = null;
        this.profileButton = null;
        this.logoutButton = null;
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
        title.style.lineHeight = '1.5';
        title.style.marginBottom = '10px';

        const subtitle = document.createElement('div');
        subtitle.style.color = 'rgba(226, 239, 217, 0.78)';
        subtitle.style.fontSize = '11px';
        subtitle.style.lineHeight = '1.6';
        subtitle.style.marginBottom = '22px';

        this.panel.appendChild(title);
        this.panel.appendChild(subtitle);

        const buttons = document.createElement('div');
        buttons.style.display = 'grid';
        buttons.style.gridTemplateColumns = '1fr';
        buttons.style.gap = '12px';

        this.panel.appendChild(buttons);

        this.levelsButton = new Button({
            container: buttons,
            text: 'Выбор уровней',
            variant: 'primary',
            fontFamily: '"Press Start 2P", sans-serif',
            fontSize: '12px',
            onClick: () => this.handleOpenLevels()
        });

        this.profileButton = new Button({
            container: buttons,
            text: 'Профиль',
            variant: 'primary',
            fontFamily: '"Press Start 2P", sans-serif',
            fontSize: '12px',
            onClick: () => this.handleOpenProfile()
        });

        this.logoutButton = new Button({
            container: buttons,
            text: 'Выйти',
            variant: 'primary',
            fontFamily: '"Press Start 2P", sans-serif',
            fontSize: '12px',
            onClick: () => this.handleLogout()
        });

        document.body.appendChild(this.panel);
    }

    handleOpenLevels() {
        this.notification.show('Экран  уровней  следующий этап ', 'info');
    }

    handleOpenProfile() {
        this.notification.show('Экран профиля  следующий этап', 'info');
    }

    handleLogout() {
        authStore.clear();
        this.notification.show('Вы вернулись в меню входа', 'info');
        this.scene.start('LoginScene');
    }

    cleanup() {
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
