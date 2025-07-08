import Entity from './Entity.js';
// Класс хищника
        export default class Predator extends Entity {
            constructor(x, y) {
                super(x, y, 'predator');
                this.energy = 35;
                this.initialEnergy = 35;
                this.maxAge = 70;
                this.scavengerHuntChance = 0.2; // 20% шанс атаки на падальщика
            }

            hunt(entities) {
                // 1. Сначала пробуем атаковать травоядных (приоритет)
                const herbivores = entities.filter(e => 
                    e.type === 'herbivore' && 
                    Math.abs(e.x - this.x) <= 1 && 
                    Math.abs(e.y - this.y) <= 1
                );

                if (herbivores.length > 0) {
                    const target = herbivores[0];
                    this.x = target.x
                    this.y = target.y
                    entities.splice(entities.indexOf(target), 1);
                    this.energy += 22;
                    // Оставляем труп с шансом 70%
                    if (Math.random() < 0.7) entities.push(new Corpse(target.x, target.y));
                    return true;
                }

                // 2. Если травоядных нет - с шансом 20% атакуем падальщика
                if (Math.random() < this.scavengerHuntChance) {
                    const scavengers = entities.filter(e => 
                        e.type === 'scavenger' && 
                        Math.abs(e.x - this.x) <= 1 && 
                        Math.abs(e.y - this.y) <= 1
                    );

                    if (scavengers.length > 0) {
                        const target = scavengers[0];
                        this.x = target.x
                        this.y = target.y
                        entities.splice(entities.indexOf(target), 1);
                        this.energy += 15; // Меньше энергии, чем за травоядного
                        // Оставляем труп с шансом 70%
                        if (Math.random() < 0.7) entities.push(new Corpse(target.x, target.y));
                        return true;
                    }
                }

                return false;
            }
        }