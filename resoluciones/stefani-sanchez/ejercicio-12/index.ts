export {};

// Ejercicio 12: Herencia y Polimorfismo
// Contexto: Campeones de Videojuegos MOBA

abstract class CampeonMOBA {
  protected constructor(
    public readonly nombre: string,
    public vida: number,
    public energia: number,
    public nivel: number = 1
  ) {}

  abstract ejecutarHabilidadDefinitiva(): string;

  recibirDanio(cantidad: number): void {
    this.vida = Math.max(this.vida - cantidad, 0);
    console.log(`[${this.nombre}] recibió ${cantidad} de daño. Vida restante: ${this.vida}`);
  }

  subirNivel(): void {
    this.nivel += 1;
    this.vida += 50;
    this.energia += 25;
    console.log(`⭐ ${this.nombre} ha subido al nivel ${this.nivel}.`);
  }
}

class MagoMOBA extends CampeonMOBA {
  constructor(nombre: string, vida: number, energia: number, public poderHabilidad: number) {
    super(nombre, vida, energia);
  }

  ejecutarHabilidadDefinitiva(): string {
    const danio = this.poderHabilidad * 2.5;
    return `🔮 ${this.nombre} invoca Tormenta Astral desatando ${danio} de daño mágico en área!`;
  }
}

class TanqueMOBA extends CampeonMOBA {
  constructor(nombre: string, vida: number, energia: number, public armadura: number) {
    super(nombre, vida, energia);
  }

  override recibirDanio(cantidad: number): void {
    const danioReducido = Math.max(Math.round(cantidad * (1 - this.armadura / 100)), 5);
    super.recibirDanio(danioReducido);
  }

  ejecutarHabilidadDefinitiva(): string {
    return `🛡️ ${this.nombre} activa Escudo Colosal atrayendo y aturdiendo a todos los enemigos!`;
  }
}

const maga = new MagoMOBA("Luxanna", 480, 420, 150);
const tanque = new TanqueMOBA("Braum", 850, 200, 45);

console.log(maga.ejecutarHabilidadDefinitiva());
console.log(tanque.ejecutarHabilidadDefinitiva());
tanque.recibirDanio(100);
maga.subirNivel();
