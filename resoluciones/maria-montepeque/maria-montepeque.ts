export {};

// Ejercicio 12: Herencia

abstract class HeroeMOBA {
  constructor(
    public readonly nombre: string,
    public readonly rol: string,
    protected energia: number,
  ) {}
  usarHabilidadBasica(): string {
    this.energia -= 10;
    return `${this.nombre} usa habilidad basica. Energia: ${this.energia}`;
  }
  abstract habilidadEspecial(): string;
}
class Tanque extends HeroeMOBA {
  constructor(
    nombre: string,
    energia: number,
    private armadura: number,
  ) {
    super(nombre, "Tanque", energia);
  }
  habilidadEspecial(): string {
    return `${this.nombre} alza un escudo con ${this.armadura} de armadura.`;
  }
}
class Asesino extends HeroeMOBA {
  constructor(
    nombre: string,
    energia: number,
    private danoCritico: number,
  ) {
    super(nombre, "Asesino", energia);
  }
  habilidadEspecial(): string {
    return `${this.nombre} ejecuta un golpe de ${this.danoCritico} de dano critico.`;
  }
}
class Soporte extends HeroeMOBA {
  constructor(
    nombre: string,
    energia: number,
    private curacion: number,
  ) {
    super(nombre, "Soporte", energia);
  }
  habilidadEspecial(): string {
    return `${this.nombre} cura ${this.curacion} de vida al equipo.`;
  }
}
const heroes: HeroeMOBA[] = [
  new Tanque("Bastion", 100, 85),
  new Asesino("Nyx", 90, 140),
  new Soporte("Lumen", 80, 60),
];
for (const h of heroes) {
  console.log(h.usarHabilidadBasica());
  console.log(h.habilidadEspecial());
}