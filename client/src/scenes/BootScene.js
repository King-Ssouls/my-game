import Phaser from 'phaser';


export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    async create() {
        if (document.fonts) {
            await Promise.all([
                document,fonts.load('52px "Press Start 2P"'),
                document.fonts.load('22px "Press Start 2P"'),
            ]);
        }
        
        const width = this.scale.width;
        const height = this.scale.height;

        this.cameras.main.setBackgroundColor('#10131a');

        this.add
        .text(width / 2, height / 2 - 40, 'glimmer', {
            fontFamily: '"Press Start 2P"',
            fontSize: '52px',
            color: '#ffffff',
            fontStyle: 'bold'
        })
        .setOrigin(0.5);

        this.add
        .text(width / 2, height / 2 + 20, 'Загрузка...', {
            fontFamily: '"Press Start 2P"',
            fontSize: '22px',
            color: '#9fd3ff'
        })
        .setOrigin(0.5);


        this.time.delayedCall(600, () => {
            this.scene.start('PreloadScene');
        });
    }
}