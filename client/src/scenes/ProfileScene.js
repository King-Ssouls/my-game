import Phaser from 'phaser';
import profileApi from '../api/profileApi.js';
import authStore from '../store/authStore.js';
import Input from '../ui/Input.js';
import Button from '../ui/Button.js';
import Notification from '../ui/Notification.js';
import { clearGameHud } from '../ui/HUD.js';


export default class ProfileScene extends Phaser.Scene {
    constructor() {

        super('ProfileScene');

        this.root = null;
        this.emailInput = null;
        this.nicknameInput = null;
        this.saveButton = null;
        this.backButton = null;
        this.notification = null;
        this.statsBlock = null;

        this.loadedProfile = null;
    }

    create() {
        clearGameHud();
        this.cameras.main.setBackgroundColor('#0f172a');

        this.notification = new Notification();
        this.createLayout();

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this);

        this.loadProfile();
    }

    createLayout() {
        this.root = document.createElement('div');
        this.root.style.position = 'fixed';
        this.root.style.left = '50%';
        this.root.style.top = '56%';
        this.root.style.transform = 'translate(-50%, -50%)';
        this.root.style.width = '460px';
        this.root.style.maxWidth = 'calc(100vw - 32px)';
        this.root.style.padding = '24px';
        this.root.style.borderRadius = '16px';
        this.root.style.background = 'rgba(15, 23, 42, 0.96)';
        this.root.style.border = '1px solid rgba(255,255,255,0.08)';
        this.root.style.zIndex = '1000';
        this.root.style.boxSizing = 'border-box';

        const title = document.createElement('div');
        title.textContent = 'Редактирование профиля';
        title.style.color = '#ffffff';
        title.style.fontSize = '24px';
        title.style.fontWeight = '700';
        title.style.marginBottom = '10px';

        this.root.appendChild(title);

        this.nicknameInput = new Input({
            container: this.root,
            label: 'Имя',
            type: 'text',
            placeholder: 'PlayerOne',
            autocomplete: 'nickname'
        });

        this.emailInput = new Input({
            container: this.root,
            label: 'Email',
            type: 'email',
            placeholder: 'test@example.com',
            autocomplete: 'email'
        });

        const statsTitle = document.createElement('div');
        statsTitle.textContent = 'Статистика';
        statsTitle.style.color = '#ffffff';
        statsTitle.style.fontFamily = 'Arial, sans-serif';
        statsTitle.style.fontSize = '18px';
        statsTitle.style.fontWeight = '700';
        statsTitle.style.marginTop = '8px';
        statsTitle.style.marginBottom = '8px';

        this.statsBlock = document.createElement('div');
        this.statsBlock.style.background = '#111827';
        this.statsBlock.style.border = '1px solid #334155';
        this.statsBlock.style.borderRadius = '14px';
        this.statsBlock.style.padding = '14px';
        this.statsBlock.style.color = '#d8e6f3';
        this.statsBlock.style.fontFamily = 'Arial, sans-serif';
        this.statsBlock.style.fontSize = '14px';
        this.statsBlock.style.marginBottom = '16px';

        this.root.appendChild(statsTitle);
        this.root.appendChild(this.statsBlock);

        const buttonsRow = document.createElement('div');
        buttonsRow.style.display = 'grid';
        buttonsRow.style.gridTemplateColumns = '1fr 1fr';
        buttonsRow.style.gap = '12px';

        this.root.appendChild(buttonsRow);

        this.saveButton = new Button({
            container: buttonsRow,
            text: 'Сохранить',
            variant: 'primary',
            onClick: () => this.handleSave()
        });

        this.backButton = new Button({
            container: buttonsRow,
            text: 'Назад в меню',
            variant: 'secondary',
            onClick: () => this.handleBack()
        });

        document.body.appendChild(this.root);
    }

    setFormDisabled(isDisabled) {
        this.nicknameInput.setDisabled(isDisabled);
        this.emailInput.setDisabled(isDisabled);
        this.saveButton.setDisabled(isDisabled);
        this.backButton.setDisabled(isDisabled);

        this.saveButton.setText(isDisabled ? 'Сохранение' : 'Сохранить');
    }

    clearErrors() {
        this.nicknameInput.clearError();
        this.emailInput.clearError();
    }

    async loadProfile() {
        this.setFormDisabled(true);

        try {
            authStore.hydrate();

            if (!authStore.isAuthenticated()) {
                this.notification.show('Сначала войди в аккаунт', 'error');
                this.scene.start('LoginScene');
                return;
            }

            const result = await profileApi.getMe();
            this.loadedProfile = result;

            this.nicknameInput.setValue(result.user?.nickname || '');
            this.emailInput.setValue(result.user?.email || '');

            this.renderStats(result.stats);

            authStore.setSession({
                token: authStore.getToken(),
                user: result.user,
                progress: result.progress || authStore.getProgress()
            });
        } catch (error) {
            this.notification.show(
                error.message || 'Не удалось загрузить профиль',
                'error'
            );

            if (this.statsBlock && !this.loadedProfile) {
                this.statsBlock.textContent = 'Не удалось загрузить профиль.';
            }

            if (error.status === 401) {
                authStore.clear();
                this.scene.start('LoginScene');
            }
        } finally {
            this.setFormDisabled(false);
        }
    }

    renderStats(stats = {}) {
        this.statsBlock.innerHTML = `
            <div><strong>Открытых уровней:</strong> ${stats.unlockedLevelsCount ?? 0}</div>
            <div><strong>Пройденных уровней:</strong> ${stats.completedLevelsCount ?? 0}</div>
            <div><strong>Всего звёзд:</strong> ${stats.totalStars ?? 0}</div>
            <div><strong>Текущий уровень:</strong> ${stats.currentLevel ?? 1}</div>
            <div><strong>Общий счёт:</strong> ${stats.totalScore ?? 0}</div>
            <div><strong>Смертей:</strong> ${stats.totalDeaths ?? 0}</div>
            <div><strong>Время игры:</strong> ${stats.totalPlayTimeFormatted ?? '00:00'}</div>
        `;
    }

    validate() {
        this.clearErrors();

        const nickname = this.nicknameInput.getValue().trim();
        const email = this.emailInput.getValue().trim();

        let valid = true;

        if (!nickname || nickname.length < 2) {
            this.nicknameInput.setError('Имя должно быть минимум 2 символа');
            valid = false;
        }

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            this.emailInput.setError('Введите корректный email');
            valid = false;
        }

        return valid;
    }

    async handleSave() {
        if (!this.validate()) {
            return;
        }

        const payload = {
            nickname: this.nicknameInput.getValue().trim(),
            email: this.emailInput.getValue().trim()
        };

        this.setFormDisabled(true);

        try {
            const result = await profileApi.updateMe(payload);
            this.loadedProfile = result;

            this.renderStats(result.stats);

            authStore.setSession({
                token: authStore.getToken(),
                user: result.user,
                progress: result.progress || authStore.getProgress()
            });

            this.notification.show('Профиль успешно обновлён', 'success');
        } catch (error) {
            this.notification.show(
                error.message || 'Не удалось сохранить профиль',
                'error'
            );
        } finally {
            this.setFormDisabled(false);
        }
    }

    handleBack() {
        this.scene.start('MenuScene');
    }

    cleanup() {
        if (this.nicknameInput) {
            this.nicknameInput.destroy();
            this.nicknameInput = null;
        }

        if (this.emailInput) {
            this.emailInput.destroy();
            this.emailInput = null;
        }

        if (this.saveButton) {
            this.saveButton.destroy();
            this.saveButton = null;
        }

        if (this.backButton) {
            this.backButton.destroy();
            this.backButton = null;
        }

        if (this.root) {
            this.root.remove();
            this.root = null;
        }

        if (this.notification) {
            this.notification.destroy();
            this.notification = null;
        }
    }
}
