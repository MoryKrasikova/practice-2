<template>
  <div class="simulation-wrapper">
    <canvas ref="canvas" class="world"></canvas>
  </div>
</template>

<script>
export default {
  name: 'SimulationDisplay',
  props: {
    entities: Array,
    worldSize: Number,
    pixelSize: Number
  },
  mounted() {
    this.setupCanvas();
    this.draw();
  },
  updated() {
    this.draw();
  },
  methods: {
    setupCanvas() {
      const canvas = this.$refs.canvas;
      canvas.width = this.worldSize * this.pixelSize;
      canvas.height = this.worldSize * this.pixelSize;
    },
    draw() {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      this.entities.forEach(entity => {
        this.drawEntity(ctx, entity);
      });
    },
    drawEntity(ctx, entity) {
      const x = entity.x * this.pixelSize;
      const y = entity.y * this.pixelSize;
      const size = this.pixelSize;
      
      if (entity.type === 'corpse') {
        ctx.fillStyle = '#7f8c8d'; // Серый цвет для трупов
        // Рисуем форму оригинала, если она сохранена
        if (entity.originalType) {
          this.drawShape(ctx, x, y, size, entity.originalType);
        } else {
          // Стандартный квадрат, если originalType не указан
          ctx.fillRect(x, y, size, size);
        }
        return;
      }
      
      // Рисуем живые существа
      ctx.fillStyle = this.getEntityColor(entity.type);
      this.drawShape(ctx, x, y, size, entity.type);
    },
    drawShape(ctx, x, y, size, type) {
      switch(type) {
        case 'plant':
          ctx.beginPath();
          ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'herbivore':
          ctx.fillRect(x, y, size, size);
          break;
          
        case 'predator':
          ctx.beginPath();
          ctx.moveTo(x + size/2, y);
          ctx.lineTo(x + size, y + size);
          ctx.lineTo(x, y + size);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'scavenger':
          ctx.beginPath();
          ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        default:
          ctx.fillRect(x, y, size, size);
      }
    },
    getEntityColor(type) {
      const colors = {
        plant: '#27ae60',
        herbivore: '#f39c12',
        predator: '#e74c3c',
        scavenger: '#9b59b6'
      };
      return colors[type] || '#000000';
    }
  },
  watch: {
    worldSize() {
      this.setupCanvas();
      this.draw();
    },
    pixelSize() {
      this.setupCanvas();
      this.draw();
    }
  }
}
</script>

<style scoped>
.simulation-wrapper {
  display: flex;
  justify-content: center;
  margin: 0 auto;
  max-width: fit-content;
}

.world {
  background-color: #fff;
  border: 2px solid #ddd;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: block;
  border-radius: 4px;
}
</style>