import AttackHitbox from './AttackHitbox.js';

export default class StaffStrike extends AttackHitbox {
    constructor(scene, player, config = {}) {
        const direction = player.facing === 'left' ? -1 : 1;
        const width = config.width ?? 116;
        const height = config.height ?? 46;
        const offsetX = config.offsetX ?? 72;
        const offsetY = config.offsetY ?? -6;

        const x = player.x + direction * offsetX;
        const y = player.y + offsetY;

        super(scene, x, y, width, height, {
            owner: player,
            damage: config.damage ?? 1,
            direction,
            knockbackX: config.knockbackX ?? 90,
            knockbackY: config.knockbackY ?? 0,
            lifeSpan: config.lifeSpan ?? 110
        });
    }
}
