import Phaser from 'phaser';


export default class AttackHitbox extends Phaser.GameObjects.Zone {
    constructor(scene, x, y, width, height, config = {}) {

        super(scene, x, y, width, height);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.owner = config.owner || null
        this.damage = config.damage ?? 1
        this.direction = config.direction ?? 1
        this.knockbackX = config.knockbackX ?? 265
        this.knockbackY = config.knockbackY ?? -110
        this.lifeSpan = config.lifeSpan ?? 150

        this.hitTargets = new Set();

        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        scene.time.delayedCall(this.lifeSpan, () => {
            if (this.active) {
                this.destroy();
            }
        }
        );
    }
}