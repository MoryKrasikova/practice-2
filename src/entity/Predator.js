import Entity from './Entity.js';

export default class Predator extends Entity {
    constructor(x, y) {
        super(x, y, 'predator');
        this.energy = 35;
        this.initialEnergy = 35;
        this.maxAge = 70;
        this.visionRange = 12;
        this.scavengerHuntChance = 0.06;
        this.target = null;
        this.stamina = 100;
        this.sprintCost = 30;
        this.sprintEnergyCost = 2;
        this.targetCheckCooldown = 0;
    }

    hunt(entities) {
        // Проверяем травоядных в радиусе 1 клетки
        const herbivores = entities.filter(e => 
            e.type === 'herbivore' && 
            Math.abs(e.x - this.x) <= 1 && 
            Math.abs(e.y - this.y) <= 1
        );

        if (herbivores.length > 0) {
            const target = herbivores[0];
            this.consumeTarget(target, entities, 22);
            return true;
        }

        // С шансом 20% проверяем падальщиков
        if (Math.random() < this.scavengerHuntChance) {
            const scavengers = entities.filter(e => 
                e.type === 'scavenger' && 
                Math.abs(e.x - this.x) <= 1 && 
                Math.abs(e.y - this.y) <= 1
            );

            if (scavengers.length > 0) {
                const target = scavengers[0];
                this.consumeTarget(target, entities, 15);
                return true;
            }
        }

        return false;
    }

    consumeTarget(target, entities, energyGain) {
        this.x = target.x;
        this.y = target.y;
        entities.splice(entities.indexOf(target), 1);
        this.energy += energyGain;
        this.target = null;
        
        if (Math.random() < 0.7) {
            entities.push(new Corpse(target.x, target.y));
        }
    }

    move(worldSize, entities) {
        // 1. Проверяем, существует ли текущая цель в entities
        if (this.target && !entities.includes(this.target)) {
            this.target = null; // Цель исчезла - сбрасываем
        }

        // 2. Пытаемся поесть перед движением
        if (this.hunt(entities)) {
            this.stamina = Math.min(100, this.stamina + 15);
            this.targetCheckCooldown = 0;
            return;
        }

        // 3. Проверка более близких целей (важная оптимизация!)
        if (this.target && this.targetCheckCooldown <= 0) {
            const newTarget = this.findNearestTarget(entities);
            if (newTarget) {
                const currentDist = this.calculateDistance(this.target);
                const newDist = this.calculateDistance(newTarget);
                if (newDist < currentDist - 2) { // Переключаемся только если значительно ближе
                    this.target = newTarget;
                }
            }
            this.targetCheckCooldown = 3; // Задержка между проверками
        } else {
            this.targetCheckCooldown--;
        }

        // 4. Если цель есть, но она вне радиуса видимости - сбрасываем
        if (this.target && this.calculateDistance(this.target) > this.visionRange) {
            this.target = null;
        }

        // 5. Поиск новой цели если нужно
        if (!this.target) {
            this.target = this.findNearestTarget(entities);
        }

        // 6. Логика движения
        if (!this.target) {
            super.move(worldSize); // Простое случайное движение
        } else {
            const distance = this.calculateDistance(this.target);
            if (distance > 2 && this.stamina >= this.sprintCost) {
                this.sprintTowardTarget(worldSize);
            } else {
                this.moveTowardTarget(worldSize);
            }
        }

        // 7. Восстановление стамины и затраты энергии
        this.stamina = Math.min(100, this.stamina + 5);
        this.energy -= 1;
    }
    // Единственный метод findNearestTarget
    findNearestTarget(entities) {
        let nearestTarget = null;
        let minDistance = Infinity;

        entities.forEach(entity => {
            if (entity.type === 'herbivore' || 
                (entity.type === 'scavenger' && Math.random() < this.scavengerHuntChance)) {
                
                const dist = this.calculateDistance(entity);
                if (dist < minDistance && dist <= this.visionRange) {
                    minDistance = dist;
                    nearestTarget = entity;
                }
            }
        });

        return nearestTarget;
    }
    sprintTowardTarget(worldSize) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            this.x = this.clamp(this.x + Math.sign(dx)*2, worldSize);
            this.y = this.clamp(this.y + Math.sign(dy)*1, worldSize);
        } else {
            this.x = this.clamp(this.x + Math.sign(dx)*1, worldSize);
            this.y = this.clamp(this.y + Math.sign(dy)*2, worldSize);
        }

        this.stamina -= this.sprintCost;
        this.energy -= this.sprintEnergyCost;
    }

    moveTowardTarget(worldSize) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            this.x = this.clamp(this.x + Math.sign(dx), worldSize);
        } else {
            this.y = this.clamp(this.y + Math.sign(dy), worldSize);
        }
    }

    clamp(value, worldSize) {
        return Math.max(0, Math.min(worldSize-1, value));
    }

    calculateDistance(entity) {
        return Math.sqrt(
            Math.pow(entity.x - this.x, 2) + 
            Math.pow(entity.y - this.y, 2)
        );
    }
}