import Phaser from 'phaser';


export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'enemy-sheet', config = {}) {

        super(scene, x, y, texture, '0');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);

        this.body.setSize(22, 28);
        this.body.setOffset(5, 4);

        this.startX = x;
        this.direction = -1;

        this.speed = config.speed ?? 60;
        this.patrolDistance = config.patrolDistance ?? 100;
        this.damage = config.damage ?? 1;

        this.maxHealth = config.maxHealth ?? 2;
        this.health = this.maxHealth;
        this.isDead = false;
        this.isInvulnerable = false;
        this.invulnerabilityDuration = 150;

        this.play('enemy-walk');
    }

    update() {
        
        if (this.isDead) {
            return;
        }

        this.setVelocityX(this.speed * this.direction);

        if (this.x <= this.startX - this.patrolDistance) {
            this.direction = 1;
        } else if (this.x >= this.startX + this.patrolDistance) {
            this.direction = -1;
        }

        this.setFlipX(this.direction < 0);

        if (!this.isInvulnerable && this.anims.currentAnim?.key !== 'enemy-walk') {
            this.play('enemy-walk', true);
        }
    }

    onDamaged(force = {}) {

        if (this.isDead) {
            return;
        }

        this.play('enemy-hurt', true);

        if (this.body) {
            this.body.setVelocity(
                force.knockbackX ?? (this.direction === 1 ? -140 : 140),
                force.knockbackY ?? -120
            );
        }
    }

    onDeath() {

        if (this.isDead) {
            return;
        }

        this.isDead = true;
        this.play('enemy-death', true);

        if (this.body) {
            this.body.enable = false;
        }

        this.scene.time.delayedCall(320, () => {
            if (this.active) {
                this.destroy();
            }
        });
    }
}