<template>
  <div class="artificial-life">
    <h1>Искусственная жизнь</h1>
    
    <div class="stats">
      <div>Растения: {{ plantCount }}</div>
      <div>Травоядные: {{ herbivoreCount }}</div>
      <div>Хищники: {{ predatorCount }}</div>
      <div>Падальщики: {{ scavengerCount }}</div>
      <div>Останки: {{ corpseCount }}</div>
      <div>Цикл: {{ cycle }}</div>
    </div>
    
    <div class="controls">
      <button @click="startSimulation">Старт</button>
      <button @click="stopSimulation">Стоп</button>
      <button @click="resetSimulation">Сброс</button>
    </div>
    
    <div class="simulation-container">
      <SimulationDisplay
        :entities="entities"
        :world-size="worldSize"
        :pixel-size="pixelSize"
      />
      
      <div class="speed-control">
        <label for="speed">Скорость:</label>
        <input 
          type="range" 
          id="speed" 
          min="50" 
          max="1000" 
          v-model="simulationSpeed"
        >
        <span>{{ simulationSpeed }} мс</span>
      </div>
    </div>
  </div>
</template>

<script>
import Plant from "./entity/Plant.js";
import Herbivore from "./entity/Herbivore.js";
import Predator from "./entity/Predator.js";
import Scavenger from "./entity/Scavenger.js";
import Corpse from "./entity/Corpse.js";
import SimulationDisplay from './components/SimulationDisplay.vue';

export default {
  name: 'App',
  components: {
    SimulationDisplay
  },
  data() {
    return {
      worldSize: 50,
      pixelSize: 10,
      entities: [],
      simulationInterval: null,
      cycle: 0,
      initialPlants: 200,
      initialHerbivores: 75,
      initialPredators: 17,
      initialScavengers: 30,
      simulationSpeed: 200,
      reproductionProbability: 0.27,
      corpseSpawnProbability: 0.75
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
        } else {
          entity.move(this.worldSize);
        }
        
        // Фильтрация умерших существ (кроме растений и трупов)
        this.entities = this.entities.filter(entity => {
          // Удаляем старые трупы
          if(entity.type === 'corpse' && entity.age > entity.maxAge) return false;
          
          // Проверяем смерть только для животных (не plants и не corpses)
          const isAnimal = ['herbivore', 'predator', 'scavenger'].includes(entity.type);
          const isDead = isAnimal && (entity.age > entity.maxAge || entity.energy <= 0);
          
          if (isDead && Math.random() < this.corpseSpawnProbability) {
            newCorpses.push(new Corpse(entity.x, entity.y));
          }
          
          return !isDead;
        });
        
        // Логика питания
        if (entity instanceof Herbivore) entity.eat(this.entities);
        else if (entity instanceof Predator) entity.hunt(this.entities);
        else if (entity instanceof Scavenger) entity.scavenge(this.entities);
        
        // Размножение
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
.artificial-life {
  font-family: Arial, sans-serif;
  max-width: 1000px; /* Увеличил максимальную ширину */
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 15px;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 20px 0;
}

button {
  padding: 12px 24px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #45a049;
}

.stats {
  display: flex;
  justify-content: space-around;
  background-color: #fff;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px 20px;
}

.simulation-container {
  display: flex;
  justify-content: flex-start; /* Изменил на flex-start */
  align-items: flex-start;
  gap: 15px;
  padding-left: 235px; /* Смещаем всю группу вправо */
}

.speed-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 250px; /* Увеличил ширину */
  padding-top: 50px;
  flex-shrink: 0;
}

.speed-control input[type="range"] {
  width: 250px; /* Увеличил длину ползунка */
  height: 25px; /* Увеличил высоту */
  margin: 10px 0;
}

.speed-control label {
  font-weight: bold;
  font-size: 18px; /* Увеличил шрифт */
}

.speed-control span {
  background: white;
  padding: 8px 15px; /* Увеличил отступы */
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  font-size: 16px; /* Увеличил шрифт */
}
</style>