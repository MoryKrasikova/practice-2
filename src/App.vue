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
      
      <div class="buttons">
        <button @click="startSimulation">Старт</button>
        <button @click="stopSimulation">Стоп</button>
        <button @click="resetSimulation">Сброс</button>
      </div>
    </div>
    
  <div class="simulation-container">
  <SimulationDisplay
    :entities="entities"
    :world-size="worldSize"
    :pixel-size="pixelSize"
  />
  
  <div class="speed-control">
    <!-- Ползунок скорости -->
    <div class="control-slider">
      <label for="speed">Скорость</label>
      <input 
        type="range" 
        id="speed" 
        min="50" 
        max="1000" 
        v-model.number="simulationSpeed"
      >
      <span class="value">{{ simulationSpeed }} мс</span>
    </div>
    
    <!-- Ползунок растений -->
    <div class="control-slider">
      <label for="plants">Растения</label>
      <input 
        type="range" 
        id="plants" 
        min="50" 
        max="250" 
        v-model.number="initialPlants"
      >
      <span class="value">{{ initialPlants }}</span>
    </div>
    
    <!-- Ползунок травоядных -->
    <div class="control-slider">
      <label for="herbivores">Травоядные</label>
      <input 
        type="range" 
        id="herbivores" 
        min="10" 
        max="100" 
        v-model.number="initialHerbivores"
      >
      <span class="value">{{ initialHerbivores }}</span>
    </div>
    
    <!-- Ползунок хищников -->
    <div class="control-slider">
      <label for="predators">Хищники</label>
      <input 
        type="range" 
        id="predators" 
        min="10" 
        max="100" 
        v-model.number="initialPredators"
      >
      <span class="value">{{ initialPredators }}</span>
    </div>
    
    <!-- Ползунок падальщиков -->
    <div class="control-slider">
      <label for="scavengers">Падальщики</label>
      <input 
        type="range" 
        id="scavengers" 
        min="10" 
        max="100" 
        v-model.number="initialScavengers"
      >
      <span class="value">{{ initialScavengers }}</span>
      <button class="apply-button" @click="applySettings">Применить</button>
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
      reproductionProbability: 0.3,
      corpseSpawnProbability: 0.8,
      plantSpawnProbability: 0.4, // 40% chance to spawn plants each cycle
      maxNewPlants: 5, // Максимальное количество новых растений за цикл
      maxPlants: 500 // Максимальное общее количество растений
      
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
      if (!this.simulationInterval) {
        this.simulationInterval = setInterval(() => this.simulateCycle(), this.simulationSpeed);
      }
    },
    
    // Добавляем новый метод applySettings
    applySettings() {
      // Если симуляция запущена - останавливаем
      if (this.simulationInterval) {
        this.stopSimulation();
      }
      
      // Переинициализируем мир с новыми параметрами
      this.initWorld();
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
      const currentPlantCount = this.entities.filter(e => e.type === 'plant' && e.energy > 0).length;
      this.entities.forEach(entity => {
        entity.age++;
        
        if (entity.type === 'plant') {
          entity.energy += entity.photosynthesisRate;
        } else {
          // Для травоядных передаем entities для интеллектуального поведения
          if (entity.type === 'herbivore') {
            entity.move(this.worldSize, this.entities);
          } 
          else if(entity.type === 'scavenger'){
            // Для других существ обычное движение
            entity.move(this.worldSize, this.entities); 
          }
          else if(entity.type === 'predator'){
            entity.move(this.worldSize, this.entities); 
          }
        }
        
        // Фильтрация умерших существ (кроме растений и трупов)
        this.entities = this.entities.filter(entity => {
          // Удаляем старые трупы
          if(entity.type === 'corpse' && entity.age > entity.maxAge) return false;
          
          if(entity.type === 'plant' && (entity.age > entity.maxAge || entity.energy <= 0)) {
              return false; // Удаляем растение
          }
          // Проверяем смерть только для животных (не plants и не corpses)
          const isAnimal = ['herbivore', 'predator', 'scavenger'].includes(entity.type);
          const isDead = isAnimal && (entity.age > entity.maxAge || entity.energy <= 0);
          
          if (isDead && Math.random() < this.corpseSpawnProbability) {
          const corpse = new Corpse(entity.x, entity.y);
          corpse.originalType = entity.type; 
          newCorpses.push(corpse);
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
      
      if (this.cycle % 10 === 0 && Math.random() < 0.7) {
        const count = 1 + Math.floor(Math.random() * 10);
        const weightedTypes = ["herbivore", "herbivore", "predator", "scavenger"];
        
        for (let i = 0; i < count; i++) {
          const type = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
          let animal;
          
          // Создаем животное соответствующего типа
          switch(type) {
            case 'herbivore':
              animal = new Herbivore(
                Math.random() * this.worldSize,
                Math.random() * this.worldSize
              );
              break;
            case 'predator':
              animal = new Predator(
                Math.random() * this.worldSize,
                Math.random() * this.worldSize
              );
              break;
            case 'scavenger':
              animal = new Scavenger(
                Math.random() * this.worldSize,
                Math.random() * this.worldSize
              );
              break;
            default:
              animal = new Herbivore(
                Math.random() * this.worldSize,
                Math.random() * this.worldSize
              );
          }
          
          animal.isMigrating = true;
          newEntities.push(animal);
        }
      }
      //добавление случайных растений
      if (currentPlantCount < 500 && Math.random() < this.plantSpawnProbability) {
        const plantCount = 1 + Math.floor(Math.random() * this.maxNewPlants);
        
        for (let i = 0; i < plantCount; i++) {
          const plant = new Plant(
            Math.random() * this.worldSize, // Случайная X координата
            Math.random() * this.worldSize, // Случайная Y координата
            this.initialPlantEnergy // Начальная энергия
          );
          newEntities.push(plant);
        }
      }
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
}
.apply-button {
  padding: 10px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  width: 100%;
}

.apply-button:hover {
  background-color: #0b7dda;
}
h1 {
  text-align: center;
  color: #333;
  margin-bottom: 15px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 20px 0;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
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

.settings-group {
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.setting {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.setting:last-child {
  margin-bottom: 0;
}

.setting label {
  min-width: 120px;
  font-size: 14px;
}

.setting input[type="range"] {
  flex-grow: 1;
}

.simulation-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
}

/* Обновленные стили для блока управления */
.speed-control {
  position: absolute; /* Вырываем блок из потока и позиционируем отдельно */
  left: 1050px; /* Сдвигаем вправо от левого края */
  top: 220px; /* Регулируем вертикальное положение */
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 250px;
  background: white; /* Чтобы не сливалось с фоном */
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 10; 
}
/* Стили для всех ползунков*/
.control-slider {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.control-slider label {
  font-weight: bold;
  font-size: 14px;
}

.control-slider input[type="range"] {
  width: 250px;
  height: 14px;
  margin-left: 0;
}

.control-slider .value {
  background: white;
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  font-size: 14px;
  text-align: center;
}
</style>