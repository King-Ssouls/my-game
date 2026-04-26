import Phaser from 'phaser';

const ENEMY_SCALE = 0.34;

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'enemy-sheet', config = {}) {
        super(scene, x, y, texture, '0');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(ENEMY_SCALE);
        this.setCollideWorldBounds(true);

        this.body.setSize(68, 108);
        this.body.setOffset(118, 72);
        this.body.entityRef = this;

        this.startX = x;
        this.direction = -1;

        this.speed = config.speed ?? 60;
        this.patrolDistance = config.patrolDistance ?? 100;
        this.damage = config.damage ?? 1;

        this.maxHealth = config.maxHealth ?? 2;
        this.health = this.maxHealth;
        this.isDead = false;
        this.isInvulnerable = false;
        this.invulnerabilityDuration = 300;
        this.deathHandled = false;

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

        if (this.anims.currentAnim?.key !== 'enemy-walk') {
            this.play('enemy-walk', true);
        }

        if (this.body) {
            this.body.setVelocity(
                force.knockbackX ?? (this.direction === 1 ? -70 : 70),
                force.knockbackY ?? 0
            );
        }
    }

    onDeath() {
        if (this.deathHandled) {
            return;
        }

        this.deathHandled = true;
        this.isDead = true;
        this.setVelocity(0, 0);
        this.play('enemy-death', true);

        if (this.body) {
            this.body.enable = false;
        }

        this.scene.time.delayedCall(850, () => {
            if (this.active) {
                this.destroy();
            }
        });
    }
}
