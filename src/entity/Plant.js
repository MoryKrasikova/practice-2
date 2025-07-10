import Entity from './Entity.js';
// Класс растения
        export default class Plant extends Entity {
            constructor(x, y) {
                super(x, y, 'plant');
                this.energy = 20;
                this.initialEnergy = 20;
                this.maxAge = 70;
                this.photosynthesisRate = 0.3;
            }
            move() {
                return; 
            }
        }