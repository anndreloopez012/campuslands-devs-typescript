export {};

// Ejercicio 12: Herencia
// Contexto: Personajes de videojuegos MOBA

// TODO: crea clases con herencia.

class HeroeMOBA {
  public readonly nombre: string;
  protected vida: number;
  protected velocidad: number;

  constructor(nombre: string, vida: number, velocidad: number) {
    this.nombre = nombre;
    this.vida = vida;
    this.velocidad = velocidad;
  }

  imprimir() {
    return `El heroe ${this.nombre} tiene ${this.vida} de vida y una velocidad de ${this.velocidad}`;
  }
}

class Tanque extends HeroeMOBA {
  public armadura: number;

  constructor(
    nombre: string,
    vida: number,
    velocidad: number,
    armadura: number = 100,
  ) {
    super(nombre, vida, velocidad);
    this.armadura = armadura;
  }

  absorver(): string {
    return `${this.nombre} activó su escudo protector y es capaz de absorber ${this.armadura} de daño`;
  }
}

class Asesino extends HeroeMOBA {
  public danio: number;

  constructor(
    nombre: string,
    vida: number,
    velocidad: number,
    danio: number = 85,
  ) {
    super(nombre, vida, velocidad);
    this.danio = danio;
  }

  infligir(): string {
    return `${this.nombre} activó habilidad de llamas y es capaz de infligir ${this.danio} de daño a los enemigos`;
  }
}

const defensor = new Tanque("Axe", 100, 20);
const atacante = new Asesino("Akali", 85, 45);

console.log(defensor.imprimir());
console.log(atacante.imprimir());

console.log(defensor.absorver());
console.log(atacante.infligir());
