import Entity from './Entity.js';
// Класс травоядного
        export default class Herbivore extends Entity {
            constructor(x, y) {
                super(x, y, 'herbivore');
                this.energy = 30;
                this.initialEnergy = 30;
                this.maxAge = 70;
            }
            
            eat(entities) {
                // Ищем растения вплотную (соседние пиксели)
                const nearbyPlants = entities.filter(e => 
                    e.type === 'plant' && 
                    Math.abs(e.x - this.x) <= 1 && 
                    Math.abs(e.y - this.y) <= 1 &&
                    !(e.x === this.x && e.y === this.y)
                );
                
                if (nearbyPlants.length > 0) {
                    const plant = nearbyPlants[0];
                    this.x = plant.x
                    this.y = plant.y
                    entities.splice(entities.indexOf(plant), 1);
                    this.energy += 13;
                    return true;
                }
                return false;
            }
        }
