import Entity from './Entity.js';
// Класс растения
        export default class Plant extends Entity {
            constructor(x, y) {
                super(x, y, 'plant');
                this.energy = 10;
                this.initialEnergy = 10;
                this.maxAge = 70;
                this.photosynthesisRate = 0.22;
            }
            move() {
                return; 
            }
        }