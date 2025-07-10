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
      
      // Сортируем сущности по приоритету
      const sortedEntities = [...this.entities].sort((a, b) => {
        return this.getEntityPriority(a.type) - this.getEntityPriority(b.type);
      });
      
      sortedEntities.forEach(entity => {
        this.drawEntity(ctx, entity);
      });
    },
    getEntityPriority(type) {
      const priorities = {
        predator: 4,     // Самый высокий приоритет
        scavenger: 3,
        herbivore: 2,
        plant: 1,        // Самый низкий приоритет
        corpse: 0
      };
      return priorities[type] || 10;
    },
    drawEntity(ctx, entity) {
      const x = entity.x * this.pixelSize;
      const y = entity.y * this.pixelSize;
      const size = this.pixelSize;
      
      ctx.save();
      
      if (entity.type === 'corpse') {
        ctx.fillStyle = '#7f8c8d';
        const shapeType = entity.originalType || 'herbivore';
        this.drawShape(ctx, x, y, size, shapeType, false);
        ctx.restore();
        return;
      }
      
      ctx.fillStyle = this.getEntityColor(entity.type);
      this.drawShape(ctx, x, y, size, entity.type, entity.isMigrating || false);
      ctx.restore();
    },
    drawShape(ctx, x, y, size, type, needStroke) {
      // Рисуем основную фигуру
      switch(type) {
        case 'plant':
        case 'scavenger':
          ctx.beginPath();
          ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
          ctx.fill();
          if (needStroke) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          break;
          
        case 'herbivore':
          ctx.fillRect(x, y, size, size);
          if (needStroke) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, size, size);
          }
          break;
          
        case 'predator':
          ctx.beginPath();
          ctx.moveTo(x + size/2, y);
          ctx.lineTo(x + size, y + size);
          ctx.lineTo(x, y + size);
          ctx.closePath();
          ctx.fill();
          if (needStroke) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          break;
          
        default:
          ctx.fillRect(x, y, size, size);
          if (needStroke) {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, size, size);
          }
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