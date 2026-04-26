export default class CombatSystem {

    constructor(scene, config) {

        this.scene = scene;
        this.player = config.player;
        this.enemies = config.enemies || [];
        this.traps = config.traps || [];
        this.finish = config.finish;
        this.weaponSystem = config.weaponSystem;
        this.healthSystem = config.healthSystem;

        this.onPlayerDamaged = config.onPlayerDamaged;
        this.onPlayerDeath = config.onPlayerDeath;
        this.onEnemyKilled = config.onEnemyKilled;
        this.onLevelComplete = config.onLevelComplete;

        this.completed = false;

        this.register();
    }

    register() {

        this.enemies.forEach((enemy) => {

            this.scene.physics.add.overlap(
                this.weaponSystem.hitboxes, enemy,
                (hitbox, targetEnemy) => this.handleWeaponHit(hitbox, targetEnemy),
                null, this
            );

            this.scene.physics.add.overlap(
                this.player, enemy,
                (player, targetEnemy) => this.handlePlayerThreat(targetEnemy),
                null, this
            );
        });

        this.traps.forEach((trap) => {
            this.scene.physics.add.overlap(
                this.player, trap,
                () => this.handlePlayerThreat(trap),
                null, this
            );
        });

        this.scene.physics.add.overlap(
            this.player, this.finish,
            () => this.handleFinish(),
            null, this
        );
    }

    handleWeaponHit(hitbox, enemy) {

        if (!hitbox.active || !enemy.active || enemy.isDead) {
            return;
        }

        if (hitbox.hitTargets.has(enemy)) {
            return;
        }

        hitbox.hitTargets.add(enemy);

        const AliveBefore = !enemy.isDead;

        this.healthSystem.damage(enemy, hitbox.damage, {
            knockbackX: hitbox.direction * hitbox.knockbackX,
            knockbackY: hitbox.knockbackY
        });

        if (AliveBefore && enemy.isDead && typeof this.onEnemyKilled === 'function') {
            this.onEnemyKilled(enemy);
        }
    }

    handlePlayerThreat(source) {

        if (!this.player.active || this.player.isDead) {
            return;
        }

        const playerWasAlive = !this.player.isDead;
        let direction = 1;

        if (this.player.x < source.x) {
            direction = -1;
        } else {
            direction = 1;
        }

        const didDamage = this.healthSystem.damage(this.player, source.damage ?? 1, {
            knockbackX: direction * 210,
            knockbackY: -200
        });

        if (didDamage && typeof this.onPlayerDamaged === 'function') {
            this.onPlayerDamaged(source);
        }

        if (playerWasAlive && this.player.isDead && typeof this.onPlayerDeath === 'function') {
            this.onPlayerDeath(source);
        }
    }

    handleFinish() {

        if (this.completed || this.player.isDead) {
            return;
        }
        this.completed = true;

        if (typeof this.onLevelComplete === 'function') {
            this.onLevelComplete();
        }
    }
}