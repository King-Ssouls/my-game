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
                this.weaponSystem.hitboxes,
                enemy,
                (hitboxSource, enemySource) => this.handleWeaponHit(hitboxSource, enemySource),
                null,
                this
            );

            this.scene.physics.add.overlap(
                this.player,
                enemy,
                (player, targetEnemy) => this.handlePlayerThreat(targetEnemy),
                null,
                this
            );
        });

        this.traps.forEach((trap) => {
            this.scene.physics.add.overlap(
                this.player,
                trap,
                () => this.handlePlayerThreat(trap),
                null,
                this
            );
        });

        this.scene.physics.add.overlap(
            this.player,
            this.finish,
            () => this.handleFinish(),
            null,
            this
        );
    }

    resolveArcadeObject(source) {
        if (!source) {
            return null;
        }

        if (source.hitboxRef) {
            return source.hitboxRef;
        }

        if (source.entityRef) {
            return source.entityRef;
        }

        if (source.gameObject) {
            return source.gameObject;
        }

        if (source.body) {
            return this.resolveArcadeObject(source.body);
        }

        return source;
    }

    resolveHitbox(source) {
        const hitbox = this.resolveArcadeObject(source);

        if (!hitbox) {
            return null;
        }

        if (!(hitbox.hitTargets instanceof Set)) {
            hitbox.hitTargets = new Set();
        }

        return hitbox;
    }

    processAttackHitbox(hitboxSource) {
        const hitbox = this.resolveHitbox(hitboxSource);

        if (!hitbox || !hitbox.active) {
            return false;
        }

        const hitboxLeft = hitbox.x - hitbox.width / 2;
        const hitboxTop = hitbox.y - hitbox.height / 2;
        const hitboxRight = hitboxLeft + hitbox.width;
        const hitboxBottom = hitboxTop + hitbox.height;

        let didHit = false;

        this.enemies.forEach((enemySource) => {
            const enemy = this.resolveArcadeObject(enemySource);

            if (!enemy || !enemy.active || enemy.isDead || !enemy.body) {
                return;
            }

            const enemyLeft = enemy.body.x;
            const enemyTop = enemy.body.y;
            const enemyRight = enemyLeft + enemy.body.width;
            const enemyBottom = enemyTop + enemy.body.height;
            const overlaps =
                hitboxLeft < enemyRight &&
                hitboxRight > enemyLeft &&
                hitboxTop < enemyBottom &&
                hitboxBottom > enemyTop;

            if (!overlaps) {
                return;
            }

            didHit = true;
            this.handleWeaponHit(hitbox, enemy);
        });

        return didHit;
    }

    handleWeaponHit(hitboxSource, enemySource) {
        const hitbox = this.resolveHitbox(hitboxSource);
        const enemy = this.resolveArcadeObject(enemySource);

        const hitboxActive = Boolean(hitbox?.active ?? hitbox?.body?.enable);
        const enemyActive = Boolean(enemy?.active ?? enemy?.body?.enable);

        if (!hitbox || !enemy || !hitboxActive || !enemyActive || enemy.isDead) {
            return;
        }

        if (hitbox.hitTargets.has(enemy)) {
            return;
        }

        hitbox.hitTargets.add(enemy);

        const aliveBefore = !enemy.isDead;

        this.healthSystem.damage(enemy, hitbox.damage ?? 1, {
            knockbackX: (hitbox.direction ?? 1) * (hitbox.knockbackX ?? 0),
            knockbackY: hitbox.knockbackY ?? 0
        });

        if (aliveBefore && enemy.isDead && typeof this.onEnemyKilled === 'function') {
            this.onEnemyKilled(enemy);
        }
    }

    handlePlayerThreat(source) {
        if (!source?.active || source.isDead) {
            return;
        }

        if (!this.player.active || this.player.isDead || this.player.isInvulnerable) {
            return;
        }

        const sourceIsEnemy = this.enemies.includes(source);

        if (sourceIsEnemy && this.player.isAttacking && this.weaponSystem.hasActiveHitbox()) {
            return;
        }

        const playerWasAlive = !this.player.isDead;
        const direction = this.player.x < source.x ? -1 : 1;

        const didDamage = this.healthSystem.damage(this.player, source.damage ?? 1, {
            knockbackX: direction * 42,
            knockbackY: -34
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
