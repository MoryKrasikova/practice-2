<template>
  <canvas ref="canvas" class="world"></canvas>
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
      
      // Очищаем canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Рисуем каждую сущность
      this.entities.forEach(entity => {
        ctx.fillStyle = this.getEntityColor(entity.type);
        ctx.fillRect(
          entity.x * this.pixelSize,
          entity.y * this.pixelSize,
          this.pixelSize,
          this.pixelSize
        );
      });
    },
    getEntityColor(type) {
      const colors = {
        plant: '#3498db',
        herbivore: '#2ecc71',
        predator: '#e74c3c',
        scavenger: '#9b59b6',
        corpse: '#7f8c8d'
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
.world {
  background-color: #fff;
  border: 1px solid #ddd;
  margin: 0 auto; /* Это обеспечивает центрирование */
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  display: block; /* Важно для canvas */
}
</style>