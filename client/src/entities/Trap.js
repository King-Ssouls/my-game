import Phaser from 'phaser';


export default class Trap extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'spike', damage = 1) {

        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this, true);

        this.damage = damage;

        this.setOrigin(0.5, 1);
    }
}