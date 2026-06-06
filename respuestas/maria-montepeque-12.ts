export {};

// Ejercicio 12: Herencia
    
abstract class HeroeMOBA {
  constructor(
    public readonly nombre: string,
    public readonly rol: string,
    protected energia: number,
    protected vida: number,
  ) {}

  // Comportamiento compartido por todos los heroes.
  usarHabilidadBasica(): string {
    this.energia = Math.max(0, this.energia - 10);
    return `${this.nombre} (${this.rol}) usa su habilidad basica. Energia restante: ${this.energia}.`;
  }

  // Cada hija decide como se ve su habilidad especial.
  abstract habilidadEspecial(): string;
}

class Tanque extends HeroeMOBA {
  constructor(
    nombre: string,
    energia: number,
    vida: number,
    private armadura: number,
  ) {
    super(nombre, "Tanque", energia, vida);
  }

  habilidadEspecial(): string {
    this.armadura += 25;
    return `${this.nombre} activa Muro de Acero y sube su armadura a ${this.armadura} puntos.`;
  }
}

class Asesino extends HeroeMOBA {
  constructor(
    nombre: string,
    energia: number,
    vida: number,
    private danoCritico: number,
  ) {
    super(nombre, "Asesino", energia, vida);
  }

  habilidadEspecial(): string {
    const golpe = this.danoCritico * 2;
    return `${this.nombre} ejecuta Sombra Letal e inflige ${golpe} de dano critico.`;
  }
}

class Soporte extends HeroeMOBA {
  constructor(
    nombre: string,
    energia: number,
    vida: number,
    private poderCuracion: number,
  ) {
    super(nombre, "Soporte", energia, vida);
  }

  // Sobrescribe la habilidad basica: el soporte tambien se recupera al usarla.
  usarHabilidadBasica(): string {
    this.vida += 5;
    return `${super.usarHabilidadBasica()} Ademas regenera vida hasta ${this.vida}.`;
  }

  curarAliado(aliado: HeroeMOBA): string {
    return `${this.nombre} cura a ${aliado.nombre} con ${this.poderCuracion} puntos de curacion.`;
  }

  habilidadEspecial(): string {
    return `${this.nombre} lanza Aura Sanadora y restaura a todo el equipo.`;
  }
}

const tanque = new Tanque("Bastion", 100, 600, 85);
const asesino = new Asesino("Nyx", 90, 320, 140);
const soporte = new Soporte("Lumen", 110, 400, 70);

const equipo: HeroeMOBA[] = [tanque, asesino, soporte];

// Comportamiento heredado y comun a todos.
for (const heroe of equipo) {
  console.log(heroe.usarHabilidadBasica());
}

// Habilidad especial distinta para cada heroe.
for (const heroe of equipo) {
  console.log(heroe.habilidadEspecial());
}

// Reto extra: el soporte cura a un aliado.
console.log(soporte.curarAliado(tanque));
