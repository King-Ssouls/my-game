import Phaser from 'phaser';

const PLAYER_SCALE = 0.88;
const ATTACK_MOVE_MULTIPLIER = 0.96;

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player-sheet', '0');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(PLAYER_SCALE);
        this.setCollideWorldBounds(true);
        this.setBounce(0);
        this.setDragX(1400);

        this.body.setSize(34, 68);
        this.body.setOffset(58, 56);
        this.body.entityRef = this;

        this.moveSpeed = 270;
        this.jumpForce = 560;

        this.facing = 'right';
        this.isAttacking = false;
        this.isDead = false;
        this.locked = false;

        this.maxHealth = 5;
        this.health = 5;
        this.isInvulnerable = false;
        this.invulnerabilityDuration = 900;

        this.play('player-idle');
    }

    update(cursors, keys) {
        if (this.isDead) {
            if (this.anims.currentAnim?.key !== 'player-death') {
                this.play('player-death', true);
            }

            return;
        }

        if (this.locked) {
            this.setVelocityX(0);
            return;
        }

        const leftPressed = cursors.left.isDown || keys.A.isDown;
        const rightPressed = cursors.right.isDown || keys.D.isDown;
        const jumpPressed =
            Phaser.Input.Keyboard.JustDown(cursors.up) ||
            Phaser.Input.Keyboard.JustDown(keys.W) ||
            Phaser.Input.Keyboard.JustDown(keys.SPACE);

        const onFloor = this.body.blocked.down || this.body.touching.down;
        const moveSpeed = this.isAttacking
            ? this.moveSpeed * ATTACK_MOVE_MULTIPLIER
            : this.moveSpeed;

        if (leftPressed && !rightPressed) {
            this.setVelocityX(-moveSpeed);
            this.facing = 'left';
            this.setFlipX(true);
        } else if (rightPressed && !leftPressed) {
            this.setVelocityX(moveSpeed);
            this.facing = 'right';
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }

        if (jumpPressed && onFloor) {
            this.setVelocityY(-this.jumpForce);
        }

        this.updateAnimation(onFloor);
    }

    updateAnimation(onFloor) {
        if (this.isDead) {
            this.play('player-death', true);
            return;
        }

        if (this.isAttacking) {
            this.play('player-attack', true);
            return;
        }

        if (this.isInvulnerable && onFloor) {
            this.play('player-hurt', true);
            return;
        }

        if (!onFloor) {
            if (this.body.velocity.y > 30 && this.scene.anims.exists('player-fall')) {
                this.play('player-fall', true);
            } else {
                this.play('player-jump', true);
            }

            return;
        }

        if (Math.abs(this.body.velocity.x) > 5) {
            this.play('player-run', true);
            return;
        }

        this.play('player-idle', true);
    }

    startAttack(duration = 100) {
        if (this.isDead || this.locked || this.isAttacking) {
            return;
        }

        this.isAttacking = true;
        this.play('player-attack', true);

        this.scene.time.delayedCall(duration, () => {
            if (this.active) {
                this.isAttacking = false;
            }
        });
    }

    onDamaged() {
        if (this.isDead) {
            return;
        }

        this.isAttacking = false;
        this.play('player-hurt', true);
    }

    onDeath() {
        this.isDead = true;
        this.locked = true;
        this.isAttacking = false;
        this.setVelocity(0, -120);
        this.play('player-death', true);
    }

    lock() {
        this.locked = true;
        this.isAttacking = false;
        this.setVelocity(0, 0);
    }

    unlock() {
        this.locked = false;
        this.isAttacking = false;
    }
}
