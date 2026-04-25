import Phaser from 'phaser';
import authApi from '../api/authApi.js';
import authStore from '../store/authStore.js';
import Input from '../ui/Input.js';
import Button from '../ui/Button.js';
import Notification from '../ui/Notification.js';
import { addBrandTitle, addMenuBackdrop, applyMenuPanelStyles } from '../utils/menuTheme.js';

export default class LoginScene extends Phaser.Scene {
    constructor() {
        super('LoginScene');
        this.sceneTitle = null;
        this.sceneSubtitle = null;
        this.formRoot = null;
        this.formTitle = null;
        this.formSubtitle = null;
        this.modeSwitcher = null;
        this.loginModeButton = null;
        this.registerModeButton = null;
        this.emailInput = null;
        this.passwordInput = null;
        this.nicknameInput = null;
        this.submitButton = null;
        this.notification = null;
        this.isTransitioning = false;
        this.authMode = 'login';
    }

    create() {
        const { width } = this.scale;

        this.isTransitioning = false;
        this.authMode = 'login';
        addMenuBackdrop(this);
        this.cameras.main.fadeIn(250, 0, 0, 0);

        addBrandTitle(this, 96);

        this.sceneTitle = this.add
            .text(width / 2, 172, '', {
                fontFamily: '"Press Start 2P"',
                fontSize: '16px',
                color: '#f6f1d1',
                stroke: '#13251b',
                strokeThickness: 4,
                align: 'center'
            })
            .setOrigin(0.5);

        this.sceneSubtitle = this.add
            .text(width / 2, 216, '', {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#dbe7d8',
                align: 'center',
                wordWrap: { width: Math.min(width - 64, 720) }
            })
            .setOrigin(0.5);

        this.notification = new Notification();

        this.createForm();
        this.updateAuthModeUI();

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this);
    }

    createForm() {
        this.formRoot = document.createElement('div');
        this.formRoot.style.position = 'fixed';
        this.formRoot.style.left = '50%';
        this.formRoot.style.top = '58%';
        this.formRoot.style.transform = 'translate(-50%, -50%)';
        this.formRoot.style.width = '460px';
        this.formRoot.style.maxWidth = 'calc(100vw - 32px)';
        this.formRoot.style.padding = '24px';
        this.formRoot.style.zIndex = '1000';
        applyMenuPanelStyles(this.formRoot);

        this.modeSwitcher = document.createElement('div');
        this.modeSwitcher.style.display = 'grid';
        this.modeSwitcher.style.gridTemplateColumns = '1fr 1fr';
        this.modeSwitcher.style.gap = '10px';
        this.modeSwitcher.style.marginBottom = '20px';

        this.loginModeButton = this.createModeButton('Вход', 'login');
        this.registerModeButton = this.createModeButton('Регистрация', 'register');

        this.modeSwitcher.appendChild(this.loginModeButton);
        this.modeSwitcher.appendChild(this.registerModeButton);
        this.formRoot.appendChild(this.modeSwitcher);

        this.formTitle = document.createElement('div');
        this.formTitle.style.color = '#f6f1d1';
        this.formTitle.style.fontSize = '16px';
        this.formTitle.style.fontWeight = '700';
        this.formTitle.style.lineHeight = '1.5';
        this.formTitle.style.marginBottom = '10px';

        this.formSubtitle = document.createElement('div');
        this.formSubtitle.style.color = 'rgba(226, 239, 217, 0.82)';
        this.formSubtitle.style.fontSize = '14px';
        this.formSubtitle.style.lineHeight = '1.7';
        this.formSubtitle.style.marginBottom = '18px';

        this.formRoot.appendChild(this.formTitle);
        this.formRoot.appendChild(this.formSubtitle);

        this.emailInput = new Input({
            container: this.formRoot,
            label: 'Email',
            type: 'email',
            placeholder: 'test@gmail.com',
            autocomplete: 'email'
        });

        this.passwordInput = new Input({
            container: this.formRoot,
            label: 'Пароль',
            type: 'password',
            placeholder: 'Введите пароль',
            autocomplete: 'current-password'
        });

        this.nicknameInput = new Input({
            container: this.formRoot,
            label: 'Никнейм',
            type: 'text',
            placeholder: 'Никнейм',
            autocomplete: 'nickname'
        });

        this.themeInput(this.emailInput);
        this.themeInput(this.passwordInput);
        this.themeInput(this.nicknameInput);

        this.emailInput.wrapper.style.marginBottom = '11px';
        this.passwordInput.wrapper.style.marginBottom = '11px';
        this.nicknameInput.wrapper.style.marginBottom = '11px';

        const submitRow = document.createElement('div');
        submitRow.style.marginTop = '8px';
        this.formRoot.appendChild(submitRow);

        this.submitButton = new Button({
            container: submitRow,
            text: 'Войти',
            variant: 'primary',
            fontFamily: '"Press Start 2P", sans-serif',
            fontSize: '12px',
            onClick: () => this.submitCurrentMode()
        });

        this.emailInput.onEnter(() => this.submitCurrentMode());
        this.passwordInput.onEnter(() => this.submitCurrentMode());
        this.nicknameInput.onEnter(() => this.submitCurrentMode());

        document.body.appendChild(this.formRoot);
        this.emailInput.focus();
    }

    themeInput(inputComponent) {
        inputComponent.wrapper.style.fontFamily = '"Press Start 2P", sans-serif';
        inputComponent.labelEl.style.color = '#eff4dc';
        inputComponent.labelEl.style.fontSize = '11px';
        inputComponent.labelEl.style.fontWeight = '700';
        inputComponent.input.style.background = 'rgba(10, 20, 15, 0.82)';
        inputComponent.input.style.border = '1px solid rgba(203, 233, 186, 0.22)';
        inputComponent.input.style.color = '#ffffff';
        inputComponent.input.style.fontSize = '15px';
        inputComponent.errorEl.style.fontSize = '11px';
        inputComponent.errorEl.style.color = '#ffb3b3';

        if (inputComponent.passwordToggle) {
            inputComponent.passwordToggle.style.color = '#c7d6b8';
        }
    }

    createModeButton(text, mode) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = text;
        button.style.width = '100%';
        button.style.padding = '12px 16px';
        button.style.borderRadius = '14px';
        button.style.border = 'none';
        button.style.fontSize = '11px';
        button.style.fontWeight = '700';
        button.style.fontFamily = '"Press Start 2P", sans-serif';
        button.style.background = '#9702A7';
        button.style.color = '#ffffff';
        button.style.boxShadow = 'none';
        button.style.textShadow = 'none';

        button.addEventListener('click', () => this.setAuthMode(mode));

        return button;
    }

    setAuthMode(mode) {
        if (this.authMode === mode) {
            return;
        }

        this.authMode = mode;
        this.clearFieldErrors();
        this.updateAuthModeUI();
        this.focusCurrentModeField();
    }

    updateAuthModeUI() {
        const isRegisterMode = this.authMode === 'register';

        this.sceneTitle?.setText(isRegisterMode ? 'Регистрация' : 'Вход');
        this.sceneSubtitle?.setText(
            isRegisterMode
                ? 'Создай аккаунт и начни путешествие в glimmer'
                : 'Войди в аккаунт, чтобы открыть меню'
        );

        this.nicknameInput.wrapper.style.display = isRegisterMode ? 'flex' : 'none';
        this.submitButton.setText(isRegisterMode ? 'Создать' : 'Войти');

        this.paintModeButton(this.loginModeButton, !isRegisterMode);
        this.paintModeButton(this.registerModeButton, isRegisterMode);
    }

    paintModeButton(button) {
        button.style.background = '#9702A7';
        button.style.color = '#ffffff';
        button.style.boxShadow = 'none';
        button.style.textShadow = 'none';
    }

    focusCurrentModeField() {
        if (this.authMode === 'register' && this.emailInput.getValue() && this.passwordInput.getValue()) {
            this.nicknameInput.focus();
            return;
        }

        this.emailInput.focus();
    }

    setFormDisabled(isDisabled) {
        this.emailInput.setDisabled(isDisabled);
        this.passwordInput.setDisabled(isDisabled);
        this.nicknameInput.setDisabled(isDisabled);
        this.submitButton.setDisabled(isDisabled);
        this.loginModeButton.disabled = isDisabled;
        this.registerModeButton.disabled = isDisabled;

        if (isDisabled) {
            this.submitButton.setText('Подождите');
            return;
        }

        this.submitButton.setText(this.authMode === 'register' ? 'Создать' : 'Войти');
    }

    clearFieldErrors() {
        this.emailInput.clearError();
        this.passwordInput.clearError();
        this.nicknameInput.clearError();
    }

    validateBaseFields() {
        this.clearFieldErrors();

        const email = this.emailInput.getValue().trim();
        const password = this.passwordInput.getValue();

        let isValid = true;

        if (!email) {
            this.emailInput.setError('Введите email');
            isValid = false;
        }

        if (!password) {
            this.passwordInput.setError('Введите пароль');
            isValid = false;
        }

        return isValid;
    }

    submitCurrentMode() {
        if (this.authMode === 'register') {
            this.handleRegister();
            return;
        }

        this.handleLogin();
    }

    async handleLogin() {
        if (!this.validateBaseFields()) {
            return;
        }

        const email = this.emailInput.getValue().trim();
        const password = this.passwordInput.getValue();

        this.setFormDisabled(true);

        try {
            const result = await authApi.login({
                email,
                password
            });

            authStore.setSession(result);
            this.notification.show('Вход выполнен успешно', 'success');
            this.isTransitioning = true;
            this.startSceneWithFade('MenuScene');
        } catch (error) {
            this.notification.show(error.message || 'Не удалось войти', 'error');
        } finally {
            if (!this.isTransitioning) {
                this.setFormDisabled(false);
            }
        }
    }

    async handleRegister() {
        if (!this.validateBaseFields()) {
            return;
        }

        const email = this.emailInput.getValue().trim();
        const password = this.passwordInput.getValue();
        const nickname = this.nicknameInput.getValue().trim();

        if (nickname && nickname.length < 2) {
            this.nicknameInput.setError('Никнейм должен быть минимум 2 символа');
            return;
        }

        this.setFormDisabled(true);

        try {
            const result = await authApi.register({
                email,
                password,
                nickname
            });

            authStore.setSession(result);
            this.notification.show('Регистрация прошла успешно', 'success');
            this.isTransitioning = true;
            this.startSceneWithFade('MenuScene');
        } catch (error) {
            this.notification.show(error.message || 'Не удалось зарегистрироваться', 'error');
        } finally {
            if (!this.isTransitioning) {
                this.setFormDisabled(false);
            }
        }
    }

    startSceneWithFade(sceneKey) {
        this.cameras.main.fadeOut(220, 0, 0, 0);
        this.time.delayedCall(220, () => {
            this.scene.start(sceneKey);
        });
    }

    cleanup() {
        if (this.emailInput) {
            this.emailInput.destroy();
            this.emailInput = null;
        }

        if (this.passwordInput) {
            this.passwordInput.destroy();
            this.passwordInput = null;
        }

        if (this.nicknameInput) {
            this.nicknameInput.destroy();
            this.nicknameInput = null;
        }

        if (this.submitButton) {
            this.submitButton.destroy();
            this.submitButton = null;
        }

        if (this.formRoot) {
            this.formRoot.remove();
            this.formRoot = null;
        }

        if (this.notification) {
            this.notification.destroy();
            this.notification = null;
        }
    }
}
