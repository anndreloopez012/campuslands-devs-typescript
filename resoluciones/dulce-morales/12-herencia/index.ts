export {};

// Ejercicio 12: Herencia
// Contexto: Personajes de videojuegos MOBA

// Clase base común para todos los héroes
class HeroeMOBA {
  constructor(
    public nombre: string,
    public vida: number,
    public daño: number,
  ) {}

  // Método base que será especializado por las clases hijas
  public usarHabilidadEspecial(): void {
    console.log(`${this.nombre} usa una habilidad básica.`);
  }
}

// Clase hija: Tanque
class Tanque extends HeroeMOBA {
  constructor(
    nombre: string,
    vida: number,
    daño: number,
    public armadura: number,
  ) {
    super(nombre, vida, daño); // Llama al constructor de la clase base
  }

  // Sobrescritura del método para comportamiento específico
  public override usarHabilidadEspecial(): void {
    console.log(
      `${this.nombre} activa Escudo Supremo. Armadura aumentada en ${this.armadura}.`,
    );
  }
}

// Clase hija: Asesino
class Asesino extends HeroeMOBA {
  constructor(
    nombre: string,
    vida: number,
    daño: number,
    public sigilo: boolean,
  ) {
    super(nombre, vida, daño);
  }

  public override usarHabilidadEspecial(): void {
    console.log(
      `${this.nombre} ejecuta Emboscada Furtiva infligiendo ${this.daño * 2} de daño crítico.`,
    );
  }
}

// Reto Extra: Clase hija Soporte con función de curación
class Soporte extends HeroeMOBA {
  constructor(
    nombre: string,
    vida: number,
    daño: number,
    public poderCuracion: number,
  ) {
    super(nombre, vida, daño);
  }

  public override usarHabilidadEspecial(): void {
    console.log(
      `${this.nombre} lanza Aura Vital, curando ${this.poderCuracion} puntos de vida a los aliados.`,
    );
  }
}

// Ejecución y validación de las especialidades
const heroe1 = new Tanque("Malphite", 3000, 80, 150);
const heroe2 = new Asesino("Zed", 1800, 250, true);
const heroe3 = new Soporte("Soraka", 1500, 50, 300);

heroe1.usarHabilidadEspecial();
heroe2.usarHabilidadEspecial();
heroe3.usarHabilidadEspecial();
