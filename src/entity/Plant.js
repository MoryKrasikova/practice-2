import Entity from './Entity.js';
// Класс растения
        export default class Plant extends Entity {
            constructor(x, y) {
                super(x, y, 'plant');
                this.energy = 15;
                this.initialEnergy = 15;
                this.maxAge = 70;
                this.photosynthesisRate = 0.25;
            }
            move() {
                return; 
            }
        }