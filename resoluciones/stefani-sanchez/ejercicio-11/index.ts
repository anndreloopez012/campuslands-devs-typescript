export {};

// Ejercicio 11: Clases y Encapsulamiento
// Contexto: Sistema de Motocicletas

class Motocicleta {
  private _velocidadActual: number = 0;
  private _encendida: boolean = false;
  readonly marca: string;
  readonly modelo: string;
  readonly velocidadMaxima: number;

  constructor(marca: string, modelo: string, velocidadMaxima: number) {
    this.marca = marca;
    this.modelo = modelo;
    this.velocidadMaxima = velocidadMaxima;
  }

  get encendida(): boolean {
    return this._encendida;
  }

  get velocidadActual(): number {
    return this._velocidadActual;
  }

  arrancar(): void {
    if (this._encendida) {
      console.log(`La ${this.marca} ${this.modelo} ya está encendida.`);
      return;
    }
    this._encendida = true;
    console.log(`🔥 Motor de la ${this.marca} ${this.modelo} iniciado.`);
  }

  apagar(): void {
    if (this._velocidadActual > 0) {
      console.log("No puedes apagar la moto mientras esté en movimiento.");
      return;
    }
    this._encendida = false;
    console.log(`🛑 Motor de la ${this.marca} ${this.modelo} apagado.`);
  }

  acelerar(kmh: number): void {
    if (!this._encendida) {
      console.log("Enciende la motocicleta antes de acelerar.");
      return;
    }
    this._velocidadActual = Math.min(this._velocidadActual + kmh, this.velocidadMaxima);
    console.log(`💨 Acelerando -> Velocidad actual: ${this._velocidadActual} km/h (Máx: ${this.velocidadMaxima} km/h)`);
  }

  frenar(kmh: number): void {
    this._velocidadActual = Math.max(this._velocidadActual - kmh, 0);
    console.log(`🛑 Frenando -> Velocidad actual: ${this._velocidadActual} km/h`);
  }
}

const motoStefani = new Motocicleta("Yamaha", "YZF-R7", 220);
motoStefani.arrancar();
motoStefani.acelerar(60);
motoStefani.acelerar(80);
motoStefani.frenar(50);
motoStefani.frenar(90);
motoStefani.apagar();
