import Phaser from 'phaser';

export default class LevelCard extends Phaser.GameObjects.Container {
	constructor(scene, x, y, levelData, options = {}) {
		super(scene, x, y);

		this.levelData = levelData;
		this.onSelect = options.onSelect || null;
		this.cardWidth = options.width || options.size || 92;
		this.cardHeight = options.height || options.size || 92;

		this.levelNumber =
			levelData.number ||
			levelData.level ||
			levelData.id ||
			levelData.levelNumber ||
			'';

		this.levelTitle =
			levelData.title ||
			`Уровень ${this.levelNumber}`;

		this.levelDescription =
			levelData.description ||
			'Нажми, чтобы начать';

		this.background = scene.add.rectangle(
			0,
			0,
			this.cardWidth,
			this.cardHeight,
			0x0f172a,
			0.96
		);

		this.background.setStrokeStyle(2, 0x334155);
		this.background.setOrigin(0.5);
		this.background.setInteractive({ useHandCursor: true });

		this.numberBadge = scene.add.circle(
			-this.cardWidth / 2 + 42,
			0,
			24,
			0x9702a7,
			1
		);
		this.numberBadge.setStrokeStyle(2, 0xc084fc);

		this.levelText = scene.add.text(-this.cardWidth / 2 + 42, 0, String(this.levelNumber), {
			fontFamily: 'Arial',
			fontSize: '22px',
			color: '#ffffff',
			fontStyle: 'bold'
		});
		this.levelText.setOrigin(0.5);

		this.titleText = scene.add.text(-this.cardWidth / 2 + 84, -20, this.levelTitle, {
			fontFamily: 'Arial',
			fontSize: '18px',
			color: '#ffffff',
			fontStyle: 'bold',
			wordWrap: { width: this.cardWidth - 118, useAdvancedWrap: true }
		});
		this.titleText.setOrigin(0, 0);

		this.descriptionText = scene.add.text(
			-this.cardWidth / 2 + 84,
			24,
			this.levelDescription,
			{
				fontFamily: 'Arial',
				fontSize: '10px',
				color: '#94a3b8',
				wordWrap: { width: this.cardWidth - 118, useAdvancedWrap: true }
			}
		);
		this.descriptionText.setOrigin(0, 0);

		this.add([
			this.background,
			this.numberBadge,
			this.levelText,
			this.titleText,
			this.descriptionText
		]);

		this.background.on('pointerover', () => {
			this.setHoverState(true);
		});

		this.background.on('pointerout', () => {
			this.setHoverState(false);
		});

		this.background.on('pointerdown', () => {
			this.setPressedState();
		});

		this.background.on('pointerup', () => {
			this.setHoverState(true);

			if (typeof this.onSelect === 'function') {
				this.onSelect(this.levelData);
			}
		});

		scene.add.existing(this);
	}

	setHoverState(isHovered) {
		this.background.setFillStyle(isHovered ? 0x162033 : 0x0f172a, 0.98);
		this.background.setStrokeStyle(2, isHovered ? 0x38bdf8 : 0x334155);
		this.levelText.setColor(isHovered ? '#7dd3fc' : '#ffffff');
		this.titleText.setColor(isHovered ? '#f8fafc' : '#ffffff');
		this.descriptionText.setColor(isHovered ? '#cbd5e1' : '#94a3b8');
		this.numberBadge.setFillStyle(isHovered ? 0xb91ccf : 0x9702a7, 1);
	}

	setPressedState() {
		this.background.setFillStyle(0x1e293b, 1);
		this.background.setStrokeStyle(2, 0x0ea5e9);
		this.numberBadge.setFillStyle(0x7e22ce, 1);
	}
}
