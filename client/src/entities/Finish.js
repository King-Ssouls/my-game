import Phaser from 'phaser';


export default class Finish extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {

        super(scene, x, y, 'finish');

        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        this.setOrigin(0.5, 1);
        this.body.setSize(22, 58);
        this.body.setOffset(5, 4);

        scene.tweens.add({
            targets: this,
            duration: 900,
            y: y - 6,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}