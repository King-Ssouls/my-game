export default class Input {
    constructor({
        container,
        label = '',
        type = 'text',
        placeholder = '',
        value = '',
        autocomplete = 'off'
    })
    {
        this.wrapper = document.createElement('div');
        this.wrapper.style.display = 'flex';
        this.wrapper.style.flexDirection = 'column';
        this.wrapper.style.gap = '8px';
        this.wrapper.style.marginBottom = '12px';
        this.wrapper.style.fontFamily = 'Arial, sans-serif';


        this.labelEl = document.createElement('label');
        this.labelEl.textContent = label;
        this.labelEl.style.color = '#dbeafe';
        this.labelEl.style.fontSize = '18px';
        this.labelEl.style.fontWeight = '600';

        this.inputRow = document.createElement('div');
        this.inputRow.style.position = 'relative';
        this.inputRow.style.display = 'flex';
        this.inputRow.style.alignItems = 'center';

        this.input = document.createElement('input');
        this.input.type = type;
        this.input.placeholder = placeholder;
        this.input.value = value;
        this.input.autocomplete = autocomplete;


        this.input.style.width = '100%';
        this.input.style.padding = '12px 14px';
        this.input.style.borderRadius = '14px';
        this.input.style.border = '1px solid #334155';
        this.input.style.background = '#0f172a';
        this.input.style.color = '#ffffff';
        this.input.style.fontSize = '15px';
        this.input.style.fontFamily = 'Arial, sans-serif';
        this.input.style.boxSizing = 'border-box';

        this.inputRow.appendChild(this.input);

        this.passwordToggle = null;

        if (type === 'password') {
            this.passwordToggle = document.createElement('button');
            this.passwordToggle.type = 'button';
            this.passwordToggle.setAttribute('aria-label', 'Показать пароль');
            this.passwordToggle.style.position = 'absolute';
            this.passwordToggle.style.right = '12px';
            this.passwordToggle.style.top = '50%';
            this.passwordToggle.style.transform = 'translateY(-50%)';
            this.passwordToggle.style.display = 'flex';
            this.passwordToggle.style.alignItems = 'center';
            this.passwordToggle.style.justifyContent = 'center';
            this.passwordToggle.style.width = '28px';
            this.passwordToggle.style.height = '28px';
            this.passwordToggle.style.padding = '0';
            this.passwordToggle.style.border = 'none';
            this.passwordToggle.style.background = 'transparent';
            this.passwordToggle.style.color = '#94a3b8';

            this.input.style.paddingRight = '46px';

           this.handlePasswordToggle = () => {
                const isPasswordHidden = this.input.type === 'password';

                if (isPasswordHidden) {
                    this.input.type = 'text';
                    this.passwordToggle.setAttribute('aria-label', 'Скрыть пароль');
                    this.passwordToggle.innerHTML = this.getEyeOffIcon();
                } else {
                    this.input.type = 'password';
                    this.passwordToggle.setAttribute('aria-label', 'Показать пароль');
                    this.passwordToggle.innerHTML = this.getEyeIcon();
                }
            };

            this.passwordToggle.innerHTML = this.getEyeIcon();
            this.passwordToggle.addEventListener('click', this.handlePasswordToggle);
            this.inputRow.appendChild(this.passwordToggle);
        }


        this.errorEl = document.createElement('div');
        this.errorEl.style.minHeight = '18px';
        this.errorEl.style.color = '#fca5a5';
        this.errorEl.style.fontSize = '12px';
        this.errorEl.style.fontFamily = 'Arial, sans-serif';


        this.wrapper.appendChild(this.labelEl);
        this.wrapper.appendChild(this.inputRow);
        this.wrapper.appendChild(this.errorEl);
        container.appendChild(this.wrapper);
    }

    getEyeSvg(withSlash = false) {
        const slashPath = withSlash
            ? '<path d="M4 20L20 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
            : '';

        return `
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M2 12C4.6 7.8 8 5.7 12 5.7C16 5.7 19.4 7.8 22 12C19.4 16.2 16 18.3 12 18.3C8 18.3 4.6 16.2 2 12Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"
                />
                <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    stroke-width="1.8"
                />
                ${slashPath}
            </svg>
        `;
    }

    getEyeIcon() {
        return this.getEyeSvg(false);
    }

    getEyeOffIcon() {
        return this.getEyeSvg(true);
    }

    getValue() {
        return this.input.value;
    }

    setValue(value) {
        this.input.value = value;
    }

    setDisabled(isDisabled) {
        this.input.disabled = isDisabled;

        if (this.passwordToggle) {
            this.passwordToggle.disabled = isDisabled;
        }
    }

    setError(message) {
        this.errorEl.textContent = message || '';
        this.input.style.borderColor = message ? '#ef4444' : '#334155';
    }

    clearError() {
        this.setError('');
    }

    focus() {
        this.input.focus();
    }

    onEnter(handler) {
        this.handleKeyDown = (event) => {
        if (event.key === 'Enter' && typeof handler === 'function') {
            handler(event);
        }
        };
        this.input.addEventListener('keydown', this.handleKeyDown);
    }

    destroy() {
        if (this.handleKeyDown) {
            this.input.removeEventListener('keydown', this.handleKeyDown);
        }

        if (this.passwordToggle && this.handlePasswordToggle) {
            this.passwordToggle.removeEventListener('click', this.handlePasswordToggle);
        }

        this.wrapper.remove();
    }
}
