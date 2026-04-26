import Trap from './Trap.js';


export default class SpikeTrap extends Trap {
    constructor(scene, x, y) {
        
        super(scene, x, y, 'spike', 1);

        this.body.setSize(28, 18);
        this.body.setOffset(2, 4);
    }
}