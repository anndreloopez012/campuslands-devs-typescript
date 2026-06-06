export {};

// Ejercicio 11: Clases

class Motocicleta {
  private _kilometraje: number;
  private encendida: boolean = false;

  // El constructor inicializa el estado.
  constructor(
    public readonly marca: string,
    public readonly modelo: string,
    kilometrajeInicial: number,
  ) {
    this._kilometraje = kilometrajeInicial;
  }

  // Reto extra
  get kilometraje(): number {
    return this._kilometraje;
  }

  // Comportamiento: encender la moto.
  encender(): void {
    this.encendida = true;
  }

  // Comportamiento: apagar la moto.
  apagar(): void {
    this.encendida = false;
  }

  // Comportamiento: recorrer kilometros.
  recorrer(kilometros: number): void {
    if (!this.encendida) {
      throw new Error(
        "La motocicleta debe estar encendida para recorrer kilometros.",
      );
    }
    if (kilometros <= 0) {
      throw new Error(
        "Los kilometros a recorrer deben ser un numero positivo.",
      );
    }
    this._kilometraje += kilometros;
  }

  obtenerEstado(): string {
    const estado = this.encendida ? "encendida" : "apagada";
    return `${this.marca} ${this.modelo} - ${this._kilometraje} km - ${estado}`;
  }
}

const moto = new Motocicleta("Kawasaki", "Ninja 400", 1200);
moto.encender();
moto.recorrer(35);

console.log(moto.obtenerEstado());
console.log("Kilometraje consultado:", moto.kilometraje);
