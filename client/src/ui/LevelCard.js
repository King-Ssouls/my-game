import Phaser from 'phaser';

export default class LevelCard extends Phaser.GameObjects.Container {
	constructor(scene, x, y, levelData, options = {}) {
		super(scene, x, y);

		this.levelData = levelData;
		this.onSelect = options.onSelect || null;

		this.cardSize = options.size || 92;

		this.levelNumber =
			levelData.number ||
			levelData.level ||
			levelData.id ||
			'';

		this.background = scene.add.rectangle(
			0,
			0,
			this.cardSize,
			this.cardSize,
			0x0f172a,
			0.96
		);

		this.background.setStrokeStyle(2, 0x334155);
		this.background.setOrigin(0.5);
		this.background.setInteractive({ useHandCursor: true });

		this.levelText = scene.add.text(0, 0, String(this.levelNumber), {
			fontFamily: 'Arial',
			fontSize: '42px',
			color: '#ffffff',
			fontStyle: 'bold'
		});

		this.levelText.setOrigin(0.5);

		this.add([
			this.background,
			this.levelText
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
	}

	setPressedState() {
		this.background.setFillStyle(0x1e293b, 1);
		this.background.setStrokeStyle(2, 0x0ea5e9);
	}
}