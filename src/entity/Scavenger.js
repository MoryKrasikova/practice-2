import Entity from './Entity.js';
// Класс падальщика
        export default class Scavenger extends Entity {
            constructor(x, y) {
                super(x, y, 'scavenger');
                this.energy = 30;
                this.initialEnergy = 30;
                this.maxAge = 70;
            }
            
            scavenge(entities) {
                // Ищем трупы вплотную
                const nearbyCorpses = entities.filter(e => 
                    e.type === 'corpse' && 
                    Math.abs(e.x - this.x) <= 1 && 
                    Math.abs(e.y - this.y) <= 1
                );
                
                if (nearbyCorpses.length > 0) {
                    const corpse = nearbyCorpses[0];
                    this.x = corpse.x
                    this.y = corpse.y
                    entities.splice(entities.indexOf(corpse), 1);
                    this.energy += 25;
                    return true;
                }
                return false;
            }
        }