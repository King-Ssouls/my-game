import AttackHitbox from './AttackHitbox.js';


export default class StaffStrike extends AttackHitbox {
    constructor(scene, player, config = {}) {

        let direction = 1
        if (player.facing === 'left') {
            direction = -1
        }else {
            direction = 1
        }

        const width = config.width ?? 54;
        const height = config.height ?? 28;

        const x = player.x + direction * 34;
        const y = player.y + 2;

        super(scene, x, y, width, height, {
            owner: player,
            damage: config.damage ?? 1,
            direction,
            knockbackX: config.knockbackX ?? 265,
            knockbackY: config.knockbackY ?? -110,
            lifeSpan: config.lifeSpan ?? 150
        });

        this.flash = scene.add.rectangle(x, y, width, height, 0xa855f7, 0.4);
        this.flash.setDepth(20);

        scene.time.delayedCall(100, () => {
            if (this.flash && this.flash.active) {
                this.flash.destroy();
            }
        });
    }

    destroy(fromScene) {
        if (this.flash && this.flash.active) {
            this.flash.destroy();
        }
        super.destroy(fromScene);
    }
}