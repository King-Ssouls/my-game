export default class HealthSystem {
    constructor(scene) {
        this.scene = scene;
    }

    bind(entity, config = {}) {
        let maxHealth;

        if (config.maxHealth !== undefined && config.maxHealth !== null) {
            maxHealth = config.maxHealth;
        } else if (entity.maxHealth !== undefined && entity.maxHealth !== null) {
            maxHealth = entity.maxHealth;
        } else {
            maxHealth = 5;
        }

        let invulnerabilityDuration;

        if (
            config.invulnerabilityDuration !== undefined &&
            config.invulnerabilityDuration !== null
        ) {
            invulnerabilityDuration = config.invulnerabilityDuration;
        } else if (
            config.invulnerableTime !== undefined &&
            config.invulnerableTime !== null
        ) {
            invulnerabilityDuration = config.invulnerableTime;
        } else if (
            entity.invulnerabilityDuration !== undefined &&
            entity.invulnerabilityDuration !== null
        ) {
            invulnerabilityDuration = entity.invulnerabilityDuration;
        } else if (
            entity.invulnerableTime !== undefined &&
            entity.invulnerableTime !== null
        ) {
            invulnerabilityDuration = entity.invulnerableTime;
        } else {
            invulnerabilityDuration = 0;
        }

        entity.maxHealth = maxHealth;
        if (config.health !== undefined && config.health !== null) {
            entity.health = config.health;
        } else {
            entity.health = maxHealth;
        }
        entity.invulnerabilityDuration = invulnerabilityDuration;
        entity.invulnerableTime = invulnerabilityDuration;
        entity.isInvulnerable = false;
        entity.isDead = false;

        entity._onDamageCallback = config.onDamage ?? null;
        entity._onDeathCallback = config.onDeath ?? null;

        return entity;
    }

    damage(entity, amount = 1, force = {}) {
        if (!entity || !entity.active || entity.isDead || entity.isInvulnerable) {
            return false;
        }

        entity.health = Math.max(0, entity.health - amount);

        if (entity.body) {
            entity.body.setVelocity(
                force.knockbackX ?? 0,
                force.knockbackY ?? -160
            );
        }

        if (entity.health <= 0) {
            this.kill(entity);
            return true;
        }

        const invulnerabilityDuration = entity.invulnerabilityDuration ?? 0;
        entity.isInvulnerable = invulnerabilityDuration > 0;

        if (entity.setTintFill) {
            entity.setTintFill(0xffffff);
        }

        if (typeof entity.onDamaged === 'function') {
            entity.onDamaged(force);
        }

        if (typeof entity._onDamageCallback === 'function') {
            entity._onDamageCallback(entity, amount, force);
        }

        if (!entity.isInvulnerable) {
            if (entity.clearTint) {
                entity.clearTint();
            }

            return true;
        }

        this.scene.time.delayedCall(invulnerabilityDuration, () => {
            if (!entity.active) {
                return;
            }

            entity.isInvulnerable = false;

            if (entity.clearTint) {
                entity.clearTint();
            }
        });

        return true;
    }

    heal(entity, amount = 1) {
        if (!entity || !entity.active || entity.isDead) {
            return false;
        }

        entity.health = Math.min(entity.maxHealth, entity.health + amount);
        return true;
    }

    kill(entity) {
        if (!entity || !entity.active || entity.isDead) {
            return false;
        }

        entity.health = 0;
        entity.isDead = true;
        entity.isInvulnerable = false;

        if (entity.clearTint) {
            entity.clearTint();
        }

        if (typeof entity.onDeath === 'function') {
            entity.onDeath();
        }

        if (typeof entity._onDeathCallback === 'function') {
            entity._onDeathCallback(entity);
        }

        return true;
    }
}