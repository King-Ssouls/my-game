import Phaser from 'phaser';

const ENEMY_SCALE = 0.34;
const DEFAULT_TURN_SMOOTHING = 0.16;
const DEFAULT_TURN_BUFFER = 10;

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
        this.turnSmoothing = config.turnSmoothing ?? DEFAULT_TURN_SMOOTHING;
        this.turnBuffer = config.turnBuffer ?? DEFAULT_TURN_BUFFER;

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

        const leftBound = this.startX - this.patrolDistance;
        const rightBound = this.startX + this.patrolDistance;

        if (this.x <= leftBound) {
            this.direction = 1;
        } else if (this.x >= rightBound) {
            this.direction = -1;
        }

        const targetVelocityX = this.speed * this.direction;
        const currentVelocityX = this.body?.velocity?.x ?? 0;
        let nextVelocityX = Phaser.Math.Linear(
            currentVelocityX,
            targetVelocityX,
            this.turnSmoothing
        );

        if (Math.abs(targetVelocityX - nextVelocityX) < this.turnBuffer) {
            nextVelocityX = targetVelocityX;
        }

        this.setVelocityX(nextVelocityX);

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
