export {};

// Ejercicio 12: Herencia
// Contexto: Personajes de videojuegos MOBA

// TODO: crea clases con herencia.
console.log("-------------Ejercicio 12: Herencia----------------")

class HeroeMOBA {
  readonly nombre: string;
  vida: number;
  constructor(nombre: string, vida: number) {
    this.nombre = nombre;
    this.vida = vida;
  }
  mostrarHabilidad(): void {
    console.log(`${this.nombre} usa una habilidad básica.`);
  }
}

class Tanque extends HeroeMOBA {
  escudo: number;
  constructor(nombre: string, vida: number, escudo: number) {
    super(nombre, vida); 
    this.escudo = escudo;
  }

  mostrarHabilidad(): void {
    console.log(`[Tanque] ${this.nombre} activa Escudo de Hierro de ${this.escudo} de aguante.`);
  }
}

class Asesino extends HeroeMOBA {
  dañoCritico: number;
  constructor(nombre: string, vida: number, dañoCritico: number) {
    super(nombre, vida);
    this.dañoCritico = dañoCritico;
  }
  mostrarHabilidad(): void {
    console.log(`[Asesino] ${this.nombre} salta desde las sombras infligiendo ${this.dañoCritico}% de daño.`);
  }
}

class Soporte extends HeroeMOBA {
  constructor(nombre: string, vida: number) {
    super(nombre, vida);
  }
  mostrarHabilidad(): void {
    console.log(`[Soporte] ${this.nombre} invoca un aura celestial.`);
  }
  curar(aliado: HeroeMOBA): void {
    aliado.vida += 150;
    console.log(`${this.nombre} curó 150 de vida a ${aliado.nombre}. (Nueva vida: ${aliado.vida})`);
  }
}

const miTanque = new Tanque("Malphite", 3000, 500);
const miAsesino = new Asesino("Zed", 1800, 200);
const miSoporte = new Soporte("Soraka", 1500);

miTanque.mostrarHabilidad();
miAsesino.mostrarHabilidad();
miSoporte.mostrarHabilidad();

miSoporte.curar(miAsesino);