const GAME_HUD_SELECTOR = '[data-game-hud="true"]';

export function clearGameHud() {
    if (typeof document === 'undefined') {
        return;
    }

    document.querySelectorAll(GAME_HUD_SELECTOR).forEach((node) => {
        node.remove();
    });
}

export default class HUD {
    constructor(scene) {
        this.scene = scene;
        clearGameHud();

        this.mountNode = document.getElementById('app') || document.body;
        this.root = document.createElement('div');
        this.root.dataset.gameHud = 'true';
        this.root.style.position = 'absolute';
        this.root.style.inset = '0';
        this.root.style.pointerEvents = 'none';
        this.root.style.zIndex = '5000';
        this.root.style.fontFamily = 'Arial, sans-serif';
        this.root.style.display = 'block';
        this.root.style.visibility = 'visible';
        this.root.style.opacity = '1';

        this.panel = document.createElement('div');
        this.panel.style.position = 'absolute';
        this.panel.style.left = '18px';
        this.panel.style.top = '18px';
        this.panel.style.display = 'grid';
        this.panel.style.gap = '10px';

        this.healthText = this.createBadge('HP: 0/0', '24px');
        this.scoreText = this.createBadge('\u041e\u0447\u043a\u0438: 0', '22px');
        this.timeText = this.createBadge('\u0412\u0440\u0435\u043c\u044f: 00:00', '22px');

        this.statusText = document.createElement('div');
        this.statusText.style.position = 'absolute';
        this.statusText.style.left = '50%';
        this.statusText.style.top = '18px';
        this.statusText.style.transform = 'translateX(-50%)';
        this.statusText.style.padding = '8px 14px';
        this.statusText.style.borderRadius = '12px';
        this.statusText.style.background = '#1e293b';
        this.statusText.style.color = '#ffffff';
        this.statusText.style.fontSize = '22px';
        this.statusText.style.fontWeight = '700';
        this.statusText.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.24)';
        this.statusText.style.display = 'none';

        this.panel.appendChild(this.healthText);
        this.panel.appendChild(this.scoreText);
        this.panel.appendChild(this.timeText);

        this.root.appendChild(this.panel);
        this.root.appendChild(this.statusText);
        this.mountNode.appendChild(this.root);
    }

    createBadge(text, fontSize) {
        const element = document.createElement('div');
        element.textContent = text;
        element.style.padding = '8px 12px';
        element.style.borderRadius = '12px';
        element.style.background = '#0f172a';
        element.style.color = '#ffffff';
        element.style.fontSize = fontSize;
        element.style.fontWeight = '700';
        element.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
        element.style.width = 'fit-content';

        return element;
    }

    setHealth(current, max) {
        this.healthText.textContent = `HP: ${current}/${max}`;
    }

    setScore(score) {
        this.scoreText.textContent = `\u041e\u0447\u043a\u0438: ${score}`;
    }

    setTime(text) {
        this.timeText.textContent = `\u0412\u0440\u0435\u043c\u044f: ${text}`;
    }

    setStatus(text) {
        const value = text || '';

        this.statusText.textContent = value;
        this.statusText.style.display = value ? 'block' : 'none';
    }

    destroy() {
        if (this.root) {
            this.root.remove();
            this.root = null;
        }

        this.panel = null;
        this.healthText = null;
        this.scoreText = null;
        this.timeText = null;
        this.statusText = null;
    }
}
