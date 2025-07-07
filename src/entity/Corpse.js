import Entity from './Entity.js';
// Класс трупа 
        export default class Corpse extends Entity {
            constructor(x, y) {
                super(x, y, 'corpse');
                this.energy = 0;
                this.maxAge = 5; // Труп исчезнет строго через 15 циклов
                this.age = 0; // Сбрасываем возраст при создании
            }
            
            move() {
                return; // Трупы не двигаются
            }
        }
