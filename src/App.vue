<template>
    <div class="artificial-life">
        <h1>Искусственная жизнь</h1>
        
        <div class="settings">
            <div class="slider-container">
                <label for="speed">Скорость симуляции:</label>
                <input type="range" id="speed" min="50" max="1000" v-model="simulationSpeed">
                <span>{{ simulationSpeed }} мс</span>
            </div>
        </div>
        
        <div class="controls">
            <button @click="startSimulation">Старт</button>
            <button @click="stopSimulation">Стоп</button>
            <button @click="resetSimulation">Сброс</button>
        </div>
        
        <div class="stats">
            <div>Растения: {{ plantCount }}</div>
            <div>Травоядные: {{ herbivoreCount }}</div>
            <div>Хищники: {{ predatorCount }}</div>
            <div>Падальщики: {{ scavengerCount }}</div>
            <div>Останки: {{ corpseCount }}</div>
            <div>Цикл: {{ cycle }}</div>
        </div>
        
        <div class="world" ref="world" 
            :style="{
                width: worldSize * pixelSize + 'px', 
                height: worldSize * pixelSize + 'px'
            }">
            <div 
                v-for="(entity, index) in entities" 
                :key="index"
                class="entity"
                :class="[entity.type]"
                :style="{
                    left: entity.x * pixelSize + 'px',
                    top: entity.y * pixelSize + 'px',
                    width: pixelSize + 'px',
                    height: pixelSize + 'px'
                }"
            ></div>
        </div>
    </div>
</template>

<script>
import Plant from "./entity/Plant.js";
import Herbivore from "./entity/Herbivore.js";
import Predator from "./entity/Predator.js";
import Scavenger from "./entity/Scavenger.js";
import Corpse from "./entity/Corpse.js";

export default {
    name: 'App',
    data() {
        return {
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
        }
    },
    computed: {
        plantCount() { return this.entities.filter(e => e.type === 'plant' && e.energy > 0).length; },
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
                plant.reproductionProbability = this.reproductionProbability;
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
            const newEntities = [];
            const newCorpses = [];
            
            this.entities.forEach(entity => {
                entity.age++;
                
                if (entity.type === 'plant') {
                    entity.energy += entity.photosynthesisRate;
                } 
                else {
                    // Сначала проверяем взаимодействия (охота/сбор падали)
                    let acted = false;
                    if (entity instanceof Predator) {
                        acted = entity.hunt(this.entities);
                    }
                    else if (entity instanceof Scavenger) {
                        acted = entity.scavenge(this.entities);
                    }
                    
                    // Двигаемся только если не было взаимодействия
                    if (!acted) {
                        entity.move(this.worldSize);
                    }
                    
                    // Травоядные действуют как обычно
                    if (entity instanceof Herbivore) {
                        entity.eat(this.entities);
                    }
                }
                
                // 3. Проверка смерти (оставьте как было)
                this.entities = this.entities.filter(entity => {
                    if(entity.type === 'corpse' && entity.age > entity.maxAge) return false;
                    
                    const isDead = (entity.age > entity.maxAge || entity.energy <= 0) && entity.type !== 'corpse';
                    if (isDead && entity.type !== 'corpse' && Math.random() < this.corpseSpawnProbability) {
                        newCorpses.push(new Corpse(entity.x, entity.y));
                    }
                    return !isDead;
                });
                
                // 4. Размножение
                const offspring = entity.reproduce(this.worldSize);
                if (offspring) newEntities.push(offspring);
            });
            
            this.entities.push(...newEntities, ...newCorpses);
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
}
</script>

<style>
body {
    font-family: Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f5f5;
}
h1 {
    text-align: center;
    color: #333;
}
.controls {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 20px 0;
    flex-wrap: wrap;
}
button {
    padding: 8px 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
button:hover {
    background-color: #45a049;
}
.stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
    background-color: #fff;
    padding: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    flex-wrap: wrap;
    gap: 10px;
}
.world {
    position: relative;
    background-color: #fff;
    border: 1px solid #ddd;
    margin: 0 auto;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.entity {
    position: absolute;
    box-sizing: border-box;
}
.plant {
    background-color: #3498db;
    z-index: 1;
}
.herbivore {
    background-color: #2ecc71;
    z-index: 3;
}
.predator {
    background-color: #e74c3c;
    z-index: 5;
}
.scavenger {
    background-color: #9b59b6;
    z-index: 4;
}
.corpse {
    background-color: #7f8c8d;
    z-index: 2;
}
.slider-container {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 0;
}
.slider-container label {
    min-width: 150px;
}
.settings {
    background-color: #fff;
    padding: 15px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}
</style>