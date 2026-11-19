export {};

// Ejercicio 12: Herencia
// Contexto: Personajes de videojuegos MOBA
// Resolucion: Dulce Morales

// Clase base: aqui viven las propiedades y el comportamiento comun a todos los heroes
class HeroeMOBA {
  public readonly nombre: string;
  public readonly rol: string;
  protected vida: number;
  protected readonly vidaMaxima: number;
  protected readonly danioBase: number;

  constructor(nombre: string, rol: string, vidaMaxima: number, danioBase: number) {
    this.nombre = nombre;
    this.rol = rol;
    this.vidaMaxima = vidaMaxima;
    this.vida = vidaMaxima;
    this.danioBase = danioBase;
  }

  public get vidaActual(): number {
    return this.vida;
  }

  public recibirDanio(cantidad: number): number {
    this.vida = Math.max(0, this.vida - cantidad);
    return this.vida;
  }

  // La vida nunca supera la vida maxima
  public recibirCuracion(cantidad: number): number {
    this.vida = Math.min(this.vidaMaxima, this.vida + cantidad);
    return this.vida;
  }

  public atacar(): string {
    return `${this.nombre} hace un ataque basico de ${this.danioBase} de danio.`;
  }

  // Cada clase hija sobrescribe este metodo con su propia habilidad
  public habilidadEspecial(): string {
    return `${this.nombre} no tiene habilidad especial.`;
  }

  public presentarse(): string {
    return `${this.nombre} [${this.rol}] - Vida ${this.vida}/${this.vidaMaxima}`;
  }
}

class Tanque extends HeroeMOBA {
  private readonly armadura: number;

  constructor(nombre: string, armadura: number) {
    super(nombre, "Tanque", 1200, 45); // las propiedades comunes las pone la clase base
    this.armadura = armadura;
  }

  // El tanque reduce el danio que recibe gracias a su armadura
  public override recibirDanio(cantidad: number): number {
    const danioReducido: number = Math.max(0, cantidad - this.armadura);
    return super.recibirDanio(danioReducido);
  }

  public override habilidadEspecial(): string {
    return `${this.nombre} usa MURO DE ACERO: provoca a los enemigos y bloquea ${this.armadura} de danio por golpe.`;
  }
}

class Asesino extends HeroeMOBA {
  private readonly probabilidadCritico: number;

  constructor(nombre: string, probabilidadCritico: number) {
    super(nombre, "Asesino", 600, 110);
    this.probabilidadCritico = probabilidadCritico;
  }

  // El asesino hace mas danio en su ataque
  public override atacar(): string {
    const danioCritico: number = this.danioBase * 2;
    return `${this.nombre} ataca por la espalda: ${danioCritico} de danio critico.`;
  }

  public override habilidadEspecial(): string {
    return `${this.nombre} usa SOMBRA LETAL: se vuelve invisible con ${this.probabilidadCritico}% de critico.`;
  }
}

// Reto extra: clase soporte con curacion
class Soporte extends HeroeMOBA {
  private readonly poderCuracion: number;

  constructor(nombre: string, poderCuracion: number) {
    super(nombre, "Soporte", 750, 30);
    this.poderCuracion = poderCuracion;
  }

  // Puede curar a cualquier heroe, sin importar su clase
  public curar(aliado: HeroeMOBA): string {
    const vidaAntes: number = aliado.vidaActual;
    aliado.recibirCuracion(this.poderCuracion);
    return `${this.nombre} cura a ${aliado.nombre}: ${vidaAntes} -> ${aliado.vidaActual} de vida.`;
  }

  public override habilidadEspecial(): string {
    return `${this.nombre} usa LUZ SANADORA: cura ${this.poderCuracion} de vida a sus aliados.`;
  }
}

// Todos se guardan como HeroeMOBA, pero cada uno usa su propia version de los metodos
const equipo: HeroeMOBA[] = [
  new Tanque("Brakka", 40),
  new Asesino("Vex", 35),
  new Soporte("Elara", 150),
];

console.log("============== EQUIPO MOBA ==============");
equipo.forEach((heroe: HeroeMOBA): void => {
  console.log(heroe.presentarse());
  console.log(`  Ataque:    ${heroe.atacar()}`);
  console.log(`  Habilidad: ${heroe.habilidadEspecial()}`);
});

console.log("\n============== EN COMBATE ===============");
const tanque: Tanque = new Tanque("Brakka", 40);
const asesino: Asesino = new Asesino("Vex", 35);
const soporte: Soporte = new Soporte("Elara", 150);

tanque.recibirDanio(300);
asesino.recibirDanio(300);
console.log(`Ambos reciben 300 de danio:`);
console.log(`  ${tanque.presentarse()}  (la armadura bloqueo 40)`);
console.log(`  ${asesino.presentarse()}`);
console.log(soporte.curar(asesino));
console.log(soporte.curar(tanque));
