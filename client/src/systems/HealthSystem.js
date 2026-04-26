export default class HealthSystem {
    constructor(scene) {
        this.scene = scene;
    }

    bind(entity, config = {}) {

        if (config.maxHealth !== undefined && config.maxHealth !== null) {
            entity.maxHealth = config.maxHealth;
        }else if (entity.maxHealth === undefined || entity.maxHealth === null) {
            entity.maxHealth = 5;
        }

        if (config.health !== undefined && config.health !== null) {
            entity.health = config.health;
        } else {
            entity.health = entity.maxHealth;
        }

        if (config.invulnerableTime !== undefined &&
            config.invulnerableTime !== null
        ) {
            entity.invulnerableTime = config.invulnerableTime;
        }else if (entity.invulnerableTime === undefined ||
            entity.invulnerableTime === null
        ) {
            entity.invulnerableTime = 0;
        }

        entity.isInvulnerable = false;
        entity.isDead = false;

        entity._onDamageCallback = config.onDamage || null;
        entity._onDeathCallback = config.onDeath || null;

        return entity;
    }


    damage(entity, amount = 1, force = {}) {
        
        if (!entity || !entity.active || entity.isDead || entity.isInvulnerable) {
            return false;
        }

        entity.health = Math.max(0, entity.health - amount);

        if (entity.body) {
            let knockbackX = 0;
            let knockbackY = -160;

            if (force.knockbackX !== undefined && force.knockbackX !== null) {
                knockbackX = force.knockbackX;
            } else {
                knockbackX = 0;
            }

            if (force.knockbackY !== undefined && force.knockbackY !== null) {
                knockbackY = force.knockbackY;
            } else {
                knockbackY = -160;
            }

            entity.body.setVelocity(knockbackX, knockbackY);
        }

        if (entity.health <= 0) {
            this.kill(entity);
            return true;
        }

        entity.isInvulnerable = true;

        if (entity.setTintFill) {
            entity.setTintFill(0xffffff);
        }

        if (typeof entity.onDamaged === 'function') {
            entity.onDamaged(force);
        }

        if (typeof entity._onDamageCallback === 'function') {
            entity._onDamageCallback(entity, amount, force);
        }

        this.scene.time.delayedCall(entity.invulnerableTime, () => {
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