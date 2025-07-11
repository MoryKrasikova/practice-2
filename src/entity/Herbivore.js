import Entity from './Entity.js';

export default class Herbivore extends Entity {
    constructor(x, y) {
        super(x, y, 'herbivore');
        this.energy = 30;
        this.initialEnergy = 30;
        this.maxAge = 70;
        this.visionRange = 4; // Радиус обзора (в клетках)
        this.targetPlant = null; // Текущая цель-растение
        this.predatorNearby = false; // Флаг наличия хищника рядом
    }
    
    // Поиск ближайшего растения в радиусе видимости
    findNearestPlant(entities) {
        const plants = entities.filter(e => e.type === 'plant');
        let nearestPlant = null;
        let minDistance = Infinity;
        
        plants.forEach(plant => {
            const dist = this.calculateDistance(plant);
            if (dist < minDistance && dist <= this.visionRange) {
                minDistance = dist;
                nearestPlant = plant;
            }
        });
        
        return nearestPlant;
    }
    
    // Поиск хищников в радиусе видимости
    detectPredators(entities) {
        return entities.some(e => 
            e.type === 'predator' && 
            this.calculateDistance(e) <= this.visionRange
        );
    }
    
    // Расчет расстояния до другой сущности
    calculateDistance(entity) {
        return Math.sqrt(
            Math.pow(entity.x - this.x, 2) + 
            Math.pow(entity.y - this.y, 2)
        );
    }
    
    // Движение к цели или от хищника
    move(worldSize, entities) {
        // Запоминаем предыдущую позицию
        const prevX = this.x;
        const prevY = this.y;
        
        // 1. Проверка хищников вблизи
        this.predatorNearby = this.detectPredators(entities);
        
        if (this.predatorNearby) {
            // Убегаем от хищника с защитой от зацикливания
            this.runAway(entities, worldSize, prevX, prevY);
        } else {
            // 2. Попытка съесть растение
            if (!this.eat(entities)) {
                // 3. Поиск новой цели растения при необходимости
                if (!this.targetPlant || !entities.includes(this.targetPlant)) {
                    this.targetPlant = this.findNearestPlant(entities);
                }
                
                // 4. Движение к цели с защитой от колебаний
                if (this.targetPlant) {
                    this.moveTowardTarget(worldSize, prevX, prevY);
                    
                    // Проверка достижения цели
                    if (this.x === this.targetPlant.x && this.y === this.targetPlant.y) {
                        this.eat(entities);
                        this.targetPlant = null; // Сбрасываем цель после поедания
                    }
                } else {
                    // 5. Случайное движение без возврата на предыдущую клетку
                    super.move(worldSize);
                }
            }
        }
        
        this.energy -= 1;
    }
    
    // Движение к цели
    moveTowardTarget(worldSize) {
        const dx = this.targetPlant.x - this.x;
        const dy = this.targetPlant.y - this.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.x = (this.x + Math.sign(dx) + worldSize) % worldSize;
        } else {
            this.y = (this.y + Math.sign(dy) + worldSize) % worldSize;
        }
    }
    
    // Убегание от хищника
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
    
    eat(entities) {
        // Ищем растения в радиусе 
        const nearbyPlants = entities.filter(e => 
            e.type === 'plant' && 
            Math.abs(e.x - this.x) <= 1 && 
            Math.abs(e.y - this.y) <= 1
        );
        
        if (nearbyPlants.length > 0) {
            const plant = nearbyPlants[0];
            entities.splice(entities.indexOf(plant), 1);
            this.energy += 13;
            this.targetPlant = null; // Сбрасываем цель после еды
            return true;
        }
        return false;
    }
}
