import Enemy from './Enemy.js';


export default class WalkingEnemy extends Enemy {
    constructor(scene, x, y, config = {}) {
        
        super(scene, x, y, 'enemy-sheet', {
            speed: config.speed ?? 60,
            patrolDistance: config.patrolDistance ?? 110,
            damage: config.damage ?? 1,
            maxHealth: config.maxHealth ?? 2
        });
    }
}