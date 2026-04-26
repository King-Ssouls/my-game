import StaffStrike from '../entities/StaffStrike.js';


export default class WeaponSystem {
    constructor(scene, player) {

        this.scene = scene;
        this.player = player;

        this.cooldown = 320;
        this.attackDuration = 120;
        this.lastAttack = -Infinity;

        this.hitboxes = scene.physics.add.group({
            allowGravity: false,
            immovable: true
        });
    }

    canAttack() {
        const now = this.scene.time.now;

        return (
            !this.player.isDead &&
            !this.player.locked &&
            !this.player.isAttacking &&
            now - this.lastAttack >= this.cooldown
        );
    }

    attack() {
        if (!this.canAttack()) {
            return null;
        }

        this.lastAttack = this.scene.time.now;
        this.player.startAttack(this.attackDuration);

        const strike = new StaffStrike(this.scene, this.player, {
            lifeSpan: this.attackDuration
        });

        this.hitboxes.add(strike);

        return strike;
    }
}