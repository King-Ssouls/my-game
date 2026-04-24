export default class Notification {
    constructor(container = document.body) {
        this.container = container;
        this.hideTimer = null;

        this.element = document.createElement('div');
        this.element.style.position = 'fixed';
        this.element.style.top = '20px';
        this.element.style.right = '20px';
        this.element.style.zIndex = '2000';
        this.element.style.maxWidth = '360px';
        this.element.style.padding = '14px 16px';
        this.element.style.borderRadius = '12px';
        this.element.style.color = '#ffffff';
        this.element.style.fontSize = '14px';
        this.element.style.fontWeight = '600';
        this.element.style.lineHeight = '1.4';
        this.element.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.25)';
        this.element.style.opacity = '0';
        this.element.style.transform = 'translateY(-8px)';
        this.element.style.pointerEvents = 'none';

        this.container.appendChild(this.element);
    }

    show(message, type = 'info', duration = 3000) {
        const colors = {
            info: '#334155',
            success: '#16a34a',
            error: '#dc2626'
        };

        this.element.textContent = message;
        this.element.style.background = colors[type] || colors.info;
        
        this.element.style.opacity = '1';
        this.element.style.transform = 'translateY(0)';

        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
        }

        if (duration > 0) {
            this.hideTimer = setTimeout(() => {
                this.hide();
            }, duration);
        }
    }

    hide() {
        this.element.style.opacity = '0';
        this.element.style.transform = 'translateY(-8px)';
    }

    destroy() {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
        }
        this.element.remove();
    }
}