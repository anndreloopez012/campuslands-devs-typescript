export {};

class Motocicleta {
  private marca: string;
  private modelo: string;
  private kilometraje: number;
  private estaEncendida: boolean;

  constructor(marca: string, modelo: string) {
    this.marca = marca;
    this.modelo = modelo;
    this.kilometraje = 0;
    this.estaEncendida = false;
  }

  get obtenerKilometraje(): number {
    return this.kilometraje;
  }

  encender(): void {
    this.estaEncendida = true;
    console.log("La motocicleta se ha encendido.");
  }

  apagar(): void {
    this.estaEncendida = false;
    console.log("La motocicleta se ha apagado.");
  }

  recorrerKilometros(km: number): void {
    if (!this.estaEncendida) {
      console.log("No se pueden recorrer kilómetros, la motocicleta está apagada.");
      return;
    }
    if (km < 0) {
      console.log("No se pueden recorrer kilómetros negativos.");
      return;
    }
    this.kilometraje += km;
    console.log(`Se han recorrido ${km} kilómetros con éxito.`);
  }

  mostrarEstado(): void {
    console.log(`--- ESTADO DE LA MOTOCICLETA ---`);
    console.log(`Marca: ${this.marca}`);
    console.log(`Modelo: ${this.modelo}`);
    console.log(`Kilometraje total: ${this.obtenerKilometraje} km`);
    console.log(`¿Está encendida?: ${this.estaEncendida ? "Sí" : "No"}`);
  }
}

const miMoto = new Motocicleta("Honda", "CB 190R");

miMoto.mostrarEstado();
miMoto.recorrerKilometros(50);

miMoto.encender();
miMoto.recorrerKilometros(120);
miMoto.mostrarEstado();