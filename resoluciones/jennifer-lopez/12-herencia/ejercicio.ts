export {};

class HeroeMOBA {
  protected nombre: string;
  protected vidaMax: number;
  protected vidaActual: number;

  constructor(nombre: string, vidaMax: number) {
    this.nombre = nombre;
    this.vidaMax = vidaMax;
    this.vidaActual = vidaMax;
  }

  usarHabilidadEspecial(): void {
    console.log(`${this.nombre} usa una habilidad básica.`);
  }

  mostrarEstado(): void {
    console.log(`Héroe: ${this.nombre} | Vida: ${this.vidaActual}/${this.vidaMax}`);
  }
}

class Tanque extends HeroeMOBA {
  private escudoAbsorcion: number;

  constructor(nombre: string, vidaMax: number, escudoAbsorcion: number) {
    super(nombre, vidaMax);
    this.escudoAbsorcion = escudoAbsorcion;
  }

  override usarHabilidadEspecial(): void {
    this.vidaActual = Math.min(this.vidaActual + this.escudoAbsorcion, this.vidaMax);
    console.log(`${this.nombre} activa Escudo de Hierro, absorbiendo daño y mitigando ataques.`);
  }
}

class Asesino extends HeroeMOBA {
  private multiplicadorCritico: number;

  constructor(nombre: string, vidaMax: number, multiplicadorCritico: number) {
    super(nombre, vidaMax);
    this.multiplicadorCritico = multiplicadorCritico;
  }

  override usarHabilidadEspecial(): void {
    console.log(`${this.nombre} ejecuta Pasos de Sombra, infligiendo un golpe crítico de x${this.multiplicadorCritico}.`);
  }
}

class Soporte extends HeroeMOBA {
  private poderCuracion: number;

  constructor(nombre: string, vidaMax: number, poderCuracion: number) {
    super(nombre, vidaMax);
    this.poderCuracion = poderCuracion;
  }

  curarAliado(objetivo: HeroeMOBA): void {
    objetivo["vidaActual"] = Math.min(objetivo["vidaActual"] + this.poderCuracion, objetivo["vidaMax"]);
    console.log(`${this.nombre} lanza Gracia Divina y cura ${this.poderCuracion} puntos de vida a ${objetivo["nombre"]}.`);
  }

  override usarHabilidadEspecial(): void {
    console.log(`${this.nombre} activa Bendición del Campo, aumentando la velocidad de todo el equipo.`);
  }
}

const unTanque = new Tanque("Malphite", 3000, 500);
const unAsesino = new Asesino("Zed", 1800, 2.5);
const unSoporte = new Soporte("Soraka", 1500, 300);

console.log("--- ESTADO INICIAL ---");
unTanque.mostrarEstado();
unAsesino.mostrarEstado();
unSoporte.mostrarEstado();

console.log("\n--- COMBATE Y HABILIDADES ---");
unTanque.usarHabilidadEspecial();
unAsesino.usarHabilidadEspecial();
unSoporte.usarHabilidadEspecial();

console.log("\n--- RETO EXTRA: ACCIÓN DE SOPORTE ---");
unTanque["vidaActual"] = 1000;
console.log("Malphite recibe daño crítico.");
unTanque.mostrarEstado();
unSoporte.curarAliado(unTanque);
unTanque.mostrarEstado();