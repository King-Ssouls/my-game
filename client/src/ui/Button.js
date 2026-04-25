export default class Button {
    constructor({
        container,
        text = 'Button',
        type = 'button',
        variant = 'primary',
        width = '100%',
        onClick = null
    })
    {
        this.onClick = onClick;
        this.element = document.createElement('button');
        this.element.type = type;
        this.element.textContent = text;
        this.element.style.width = width;
        this.element.style.padding = '12px 16px';
        this.element.style.borderRadius = '14px';
        this.element.style.border = 'none';
        this.element.style.fontSize = '15px';
        this.element.style.fontWeight = '700';
        this.element.style.fontFamily = 'Arial, sans-serif';

        const variants = {
            primary: {
                background: '#4fc3f7',
                color: '#0b1220'
            },
            secondary: {
                background: '#334155',
                color: '#ffffff'
            },
            danger: {
                background: '#ef4444',
                color: '#ffffff'
            }
        };

        const palette = variants[variant] || variants.primary;

        this.element.style.background = palette.background;
        this.element.style.color = palette.color;

        this.handleClick = (event) => {
        if (typeof this.onClick === 'function') {
            this.onClick(event);
        }
        };

        this.element.addEventListener('click', this.handleClick);

        container.appendChild(this.element);
    }

    setDisabled(isDisabled) {
        this.element.disabled = isDisabled;
    }

    setText(text) {
        this.element.textContent = text;
    }

    destroy() {
        this.element.removeEventListener('click', this.handleClick);
        this.element.remove();
    }
}
