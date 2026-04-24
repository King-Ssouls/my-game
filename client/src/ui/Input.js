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


        this.labelEl = document.createElement('label');
        this.labelEl.textContent = label;
        this.labelEl.style.color = '#dbeafe';
        this.labelEl.style.fontSize = '14px';
        this.labelEl.style.fontWeight = '600';


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
        this.input.style.boxSizing = 'border-box';


        this.errorEl = document.createElement('div');
        this.errorEl.style.minHeight = '18px';
        this.errorEl.style.color = '#fca5a5';
        this.errorEl.style.fontSize = '12px';


        this.wrapper.appendChild(this.labelEl);
        this.wrapper.appendChild(this.input);
        this.wrapper.appendChild(this.errorEl);
        container.appendChild(this.wrapper);
    }

    getValue() {
        return this.input.value;
    }

    setValue(value) {
        this.input.value = value;
    }

    setDisabled(isDisabled) {
        this.input.disabled = isDisabled;
        this.input.style.opacity = isDisabled ? '0.7' : '1';
    }

    setError(message) {
        this.errorElement.textContent = message || '';
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
        this.wrapper.remove();
    }
}