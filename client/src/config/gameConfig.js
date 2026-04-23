import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

  async create() {
      if (document.fonts) {
          await Promise.all([
              document.fonts.load('48px "Press Start 2P"'),
              document.fonts.load('24px "Press Start 2P"'),
              document.fonts.load('20px "Press Start 2P"'),
              document.fonts.load('18px "Press Start 2P"'),
          ]);
      }

    const width = this.scale.width;
    const height = this.scale.height;

    this.cameras.main.setBackgroundColor('#10131a');

    this.add
      .text(width / 2, height / 2 - 100, 'glimmer', {
        fontFamily: '"Press Start 2P"',
        fontSize: '48px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 30, 'Проверка запуска', {
        fontFamily: '"Press Start 2P"',
        fontSize: '24px',
        color: '#b7b9bb',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2,height / 2 + 30,
        'Планы: вынести BootScene в отдельный файл и добавить PreloadScene',
        {
          fontFamily: '"Press Start 2P"',
          fontSize: '20px',
          color: '#b7b9bb',
          align: 'center',
          wordWrap: { width: 800 },
        },
      )
      .setOrigin(0.5);

    this.add.rectangle(width / 2, height - 120, 420, 24, 0x3a506b);

    this.add
      .text(width / 2, height - 80, 'Phaser запустился', {
        fontFamily: '"Press Start 2P"',
        fontSize: '18px',
        color: '#5f833b',
      })
      .setOrigin(0.5);
  }
}

const gameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 1280,
  height: 720,
  backgroundColor: '#0b0e14',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene],
};

export default gameConfig;
