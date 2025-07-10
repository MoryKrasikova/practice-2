import Entity from './Entity.js';

export default class Scavenger extends Entity {
    constructor(x, y) {
        super(x, y, 'scavenger');
        this.energy = 30;
        this.initialEnergy = 30;
        this.maxAge = 70;
        this.visionRange = 10; // Радиус поиска трупов
        this.targetCorpse = null; // Текущая цель
        this.fearLevel = 0.6; // Уровень страха перед хищниками (0-1)
    }
    
    // Поиск ближайшего трупа
    findNearestCorpse(entities) {
        const corpses = entities.filter(e => e.type === 'corpse');
        let nearestCorpse = null;
        let minDistance = Infinity;
        
        corpses.forEach(corpse => {
            const dist = this.calculateDistance(corpse);
            if (dist < minDistance && dist <= this.visionRange) {
                minDistance = dist;
                nearestCorpse = corpse;
            }
        });
        
        return nearestCorpse;
    }
    
    // Обнаружение хищников
    detectPredators(entities) {
        return entities.some(e => 
            e.type === 'predator' && 
            this.calculateDistance(e) <= this.visionRange
        );
    }
    
    // Движение с интеллектуальным поведением
    move(worldSize, entities) {
        // Запоминаем предыдущую позицию
        const prevPos = { x: this.x, y: this.y };
        
        // С вероятностью 30% убегаем от хищников
        const shouldFlee = this.detectPredators(entities) && Math.random() < this.fearLevel;
        
        if (shouldFlee) {
            this.runAway(entities, worldSize, prevPos);
        } else {
            // Пытаемся съесть труп перед движением
            if (!this.scavenge(entities)) {
                // Проверяем, существует ли текущая цель
                if (this.targetCorpse && !entities.includes(this.targetCorpse)) {
                    this.targetCorpse = null;
                }
                
                // Ищем новую цель, если нужно
                if (!this.targetCorpse) {
                    this.targetCorpse = this.findNearestCorpse(entities);
                }
                
                // Двигаемся к цели с защитой от колебаний
                if (this.targetCorpse) {
                    this.moveTowardTarget(worldSize, prevPos);
                    
                    // При достижении цели пытаемся съесть
                    if (this.x === this.targetCorpse.x && this.y === this.targetCorpse.y) {
                        if (this.scavenge(entities)) {
                            this.targetCorpse = null; // Сбрасываем цель после поедания
                        }
                    }
                } else {
                    // Случайное движение без возврата на предыдущую клетку
                    super.move(worldSize);
                }
            }
        }
        this.energy -= 1;
    }
    
    // Модифицированный метод поедания трупов
    scavenge(entities) {
        const nearbyCorpses = entities.filter(e => 
            e.type === 'corpse' && 
            Math.abs(e.x - this.x) <= 1 && 
            Math.abs(e.y - this.y) <= 1
        );
        
        if (nearbyCorpses.length > 0) {
            const corpse = nearbyCorpses[0];
            entities.splice(entities.indexOf(corpse), 1);
            this.energy += 25;
            this.targetCorpse = null;
            return true;
        }
        return false;
    }
    
    // Методы движения 
    calculateDistance(entity) {
        return Math.sqrt(
            Math.pow(entity.x - this.x, 2) + 
            Math.pow(entity.y - this.y, 2)
        );
    }
    
    moveTowardTarget(worldSize) {
        const dx = this.targetCorpse.x - this.x;
        const dy = this.targetCorpse.y - this.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.x = (this.x + Math.sign(dx) + worldSize) % worldSize;
        } else {
            this.y = (this.y + Math.sign(dy) + worldSize) % worldSize;
        }
    }
    
    runAway(entities, worldSize) {
        const predators = entities.filter(e => 
            e.type === 'predator' && 
            this.calculateDistance(e) <= this.visionRange
        );
        
        if (predators.length === 0) return;
        
        // Вычисляем среднее без деления (суммарный вектор)
        let fleeX = 0, fleeY = 0;
        predators.forEach(pred => {
            fleeX += this.x - pred.x;
            fleeY += this.y - pred.y;
        });
        
        // Упрощённая "нормализация" до -1/0/1
        this.x = (this.x + Math.sign(fleeX) + worldSize) % worldSize;
        this.y = (this.y + Math.sign(fleeY) + worldSize) % worldSize;
        
        this.target = null; // Сброс цели
    }
}