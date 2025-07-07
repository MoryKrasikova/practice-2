
import Plant from "./Plant.js";
import Herbivore from "./Herbivore.js";
import Predator from "./Predator.js";
import Scavenger from "./Scavenger.js";
import Corpse from "./Corpse.js";
// Vue-приложение
        new Vue({
            el: '#app',
            data: {
                worldSize: 50,
                pixelSize: 10,
                entities: [],
                simulationInterval: null,
                cycle: 0,
                initialPlants: 200,
                initialHerbivores: 90,
                initialPredators: 20,
                initialScavengers: 30,
                simulationSpeed: 200,
                reproductionProbability: 0.27,
                corpseSpawnProbability: 0.7
            },
            computed: {
                plantCount() {return this.entities.filter(e =>e.type === 'plant' && e.energy > 0).length;},
                herbivoreCount() { return this.entities.filter(e => e.type === 'herbivore').length; },
                predatorCount() { return this.entities.filter(e => e.type === 'predator').length; },
                scavengerCount() { return this.entities.filter(e => e.type === 'scavenger').length; },
                corpseCount() { return this.entities.filter(e => e.type === 'corpse').length; }
            },
            methods: {
                initWorld() {
                    this.entities = [];
                    
                    // Создаем растения
                    for (let i = 0; i < this.initialPlants; i++) {
                        const plant = new Plant(
                            Math.floor(Math.random() * this.worldSize),
                            Math.floor(Math.random() * this.worldSize)
                        );
                        plant.reproductionProbability = this.reproductionProbability; // Устанавливаем вероятность
                        this.entities.push(plant);
                    }
                    
                    // Создаем травоядных
                    for (let i = 0; i < this.initialHerbivores; i++) {
                        const herbivore = new Herbivore(
                            Math.floor(Math.random() * this.worldSize),
                            Math.floor(Math.random() * this.worldSize)
                        );
                        herbivore.reproductionProbability = this.reproductionProbability;
                        this.entities.push(herbivore);
                    }
                    
                    // Создаем хищников
                    for (let i = 0; i < this.initialPredators; i++) {
                        const predator = new Predator(
                            Math.floor(Math.random() * this.worldSize),
                            Math.floor(Math.random() * this.worldSize)
                        );
                        predator.reproductionProbability = this.reproductionProbability;
                        this.entities.push(predator);
                    }
                    
                    // Создаем падальщиков
                    for (let i = 0; i < this.initialScavengers; i++) {
                        const scavenger = new Scavenger(
                            Math.floor(Math.random() * this.worldSize),
                            Math.floor(Math.random() * this.worldSize)
                        );
                        scavenger.reproductionProbability = this.reproductionProbability;
                        this.entities.push(scavenger);
                    }
                },

                startSimulation() {
                    if (this.simulationInterval) clearInterval(this.simulationInterval);
                    this.simulationInterval = setInterval(() => this.simulateCycle(), this.simulationSpeed);
                },
                
                stopSimulation() {
                    clearInterval(this.simulationInterval);
                    this.simulationInterval = null;
                },
                
                resetSimulation() {
                    this.stopSimulation();
                    this.cycle = 0;
                    this.initWorld();
                },
                
                simulateCycle() {
                    // Этап 1: Обработка всех существ
                    const newEntities = [];
                    const newCorpses = [];
                    
                    // 1. Обновляем все сущности
                    this.entities.forEach(entity => {
                        entity.age++;
                        
                        // Для растений - фотосинтез
                        if (entity.type === 'plant') {
                            entity.energy = entity.energy + entity.photosynthesisRate;
                        } 
                        // Для других - движение
                        else {
                            entity.move(this.worldSize);
                        }
                        
                        // Проверка смерти
                        this.entities = this.entities.filter(entity => {
                            if(entity.type === 'corpse' && entity.age > entity.maxAge){
                                return true;
                            }
                            const isDead = (entity.age > entity.maxAge || entity.energy <= 0)&&entity.type !== 'corpse' 
                            // Для растений
                            if (entity.type === 'plant') {
                                if (isDead) {
                                    return false; // Удаляем мёртвое растение
                                }
                                return true; // Оставляем живое растение
                            }
                            // Для других сущностей (не растений и не трупов)
                            if (isDead) {
                                if (entity.type !== 'corpse' && Math.random() < this.corpseSpawnProbability) {
                                    newCorpses.push(new Corpse(entity.x, entity.y));
                                }
                                return false; 
                            }
                            return true; 
                        });
                                                
                        // Взаимодействия
                        if (entity instanceof Herbivore) entity.eat(this.entities);
                        else if (entity instanceof Predator) entity.hunt(this.entities);
                        else if (entity instanceof Scavenger) entity.scavenge(this.entities);
                        
                        // Размножение (передаём worldSize)
                        const offspring = entity.reproduce(this.worldSize);
                        if (offspring) newEntities.push(offspring);
                        });
                        
                        // 3. Добавляем новых существ
                        this.entities.push(...newEntities, ...newCorpses);
                        
                        // 5. Увеличиваем счётчик циклов
                        this.cycle++;
                }
            },
            watch: {
                simulationSpeed(newSpeed) {
                    if (this.simulationInterval) {
                        clearInterval(this.simulationInterval);
                        this.simulationInterval = setInterval(() => this.simulateCycle(), newSpeed);
                    }
                }
            },
            mounted() {
                this.initWorld();
            }
        });