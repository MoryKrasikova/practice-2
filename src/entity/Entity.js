// Базовый класс для всех существ
export default class Entity {
            constructor(x, y, type) {
                this.x = x;
                this.y = y;
                this.type = type;
                this.age = 0;
                this.reproductionProbability = 0.3;
            }
            
            move(worldSize) {
                const directions = [
                    { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
                    { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
                ];
                const dir = directions[Math.floor(Math.random() * directions.length)];
                this.x = (this.x + dir.dx + worldSize) % worldSize;
                this.y = (this.y + dir.dy + worldSize) % worldSize;
                this.energy -= 1;
            }
            G
            reproduce(worldSize) {
                if (this.energy > this.initialEnergy * 1.5 && 
                    Math.random() < this.reproductionProbability) {
                    // Уменьшаем энергию
                    this.energy *= 0.7;
                    
                    // Генерируем смещение (8 направлений)
                    const directions = [
                        [-1,-1], [-1,0], [-1,1],
                        [0,-1],          [0,1],
                        [1,-1],  [1,0],  [1,1]
                    ];
                    const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
                    
                    // Создаем потомка
                    const offspring = new this.constructor(
                        (this.x + dx + worldSize) % worldSize,
                        (this.y + dy + worldSize) % worldSize
                    );
                    
                    // Наследуем вероятность размножения
                    offspring.reproductionProbability = this.reproductionProbability;
                    
                    return offspring;
                }
                return null;
            }
        }