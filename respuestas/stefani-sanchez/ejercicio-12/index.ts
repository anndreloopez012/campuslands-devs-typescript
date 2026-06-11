export {};

class HeroeMOBA {
  constructor(
    public readonly nombre: string,
    public readonly rol: string,
    protected energia: number,
  ) {}

  usarHabilidadBasica(): string {
    this.energia -= 10;
    return `${this.nombre} usa una habilidad basica. Energia restante: ${this.energia}`;
  }
}

class Tanque extends HeroeMOBA {
  constructor(nombre: string, energia: number, private armadura: number) {
    super(nombre, "Tanque", energia);
  }

  iniciarCombate(): string {
    return `${this.nombre} protege al equipo con ${this.armadura} puntos de armadura.`;
  }
}

class Asesino extends HeroeMOBA {
  constructor(nombre: string, energia: number, private danoCritico: number) {
    super(nombre, "Asesino", energia);
  }

  iniciarCombate(): string {
    return `${this.nombre} entra por la retaguardia con ${this.danoCritico} de dano critico.`;
  }
}

const tanque = new Tanque("Bastion", 100, 85);
const asesino = new Asesino("Nyx", 90, 140);

console.log(tanque.usarHabilidadBasica());
console.log(tanque.iniciarCombate());
console.log(asesino.usarHabilidadBasica());
console.log(asesino.iniciarCombate());
