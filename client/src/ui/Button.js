export default class Button {
    constructor({
        container,
        text = 'Button',
        type = 'button',
        variant = 'primary',
        width = '100%',
        fontFamily = 'Arial, sans-serif',
        fontSize = '15px',
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
        this.element.style.fontSize = fontSize;
        this.element.style.fontWeight = '700';
        this.element.style.fontFamily = fontFamily;
        this.element.style.boxShadow = 'none';
        this.element.style.textShadow = 'none';

        const variants = {
            primary: {
                background: '#9702A7',
                color: '#ffffff'
            },
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
