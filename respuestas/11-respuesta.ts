export {};

class Motocicleta {
  private kilometraje: number;
  private encendida: boolean;

  constructor(
    public readonly marca: string,
    public readonly modelo: string,
    kilometrajeInicial: number,
  ) {
    this.kilometraje = kilometrajeInicial;
    this.encendida = false;
  }

  encender(): void {
    this.encendida = true;
  }

  recorrer(kilometros: number): void {
    if (!this.encendida) {
      throw new Error("La motocicleta debe estar encendida para recorrer kilometros.");
    }
    this.kilometraje += kilometros;
  }

  obtenerKilometraje(): number {
    return this.kilometraje;
  }

  obtenerEstado(): string {
    return `${this.marca} ${this.modelo} - ${this.kilometraje} km - ${this.encendida ? "encendida" : "apagada"}`;
  }
}

const moto = new Motocicleta("Kawasaki", "Ninja 400", 1200);
moto.encender();
moto.recorrer(35);
console.log(moto.obtenerEstado());
console.log("Kilometraje consultado:", moto.obtenerKilometraje());
