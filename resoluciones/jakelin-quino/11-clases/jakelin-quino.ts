export {};

// Ejercicio 11: Clases
// Contexto: Sistema de motocicletas

// TODO: crea la clase Motocicleta.

console.log("-------------- Ejercicio 11: Clases -----------------")

class Motocicleta {
  readonly marca: string;
  private estaEncendida: boolean;
  private kilometraje: number;
  constructor(marca: string) {
    this.marca = marca;
    this.estaEncendida = false; 
    this.kilometraje = 0; 
  }
  encender(): void {
    this.estaEncendida = true;
    console.log(`La moto ${this.marca} se ha encendido. ¡Rum rum!`);
  }
  recorrer(km: number): void {
    if (this.estaEncendida) {
      this.kilometraje += km;
      console.log(`Recorriste ${km} km correctamente.`);
    } else {
      console.log(`¡Error! No puedes avanzar, la moto está apagada.`);
    }
  }
  get consultarKilometraje(): number {
    return this.kilometraje;
  }
}

const miMoto = new Motocicleta("Yamaha");

miMoto.recorrer(50); 

miMoto.encender();
miMoto.recorrer(120);
miMoto.recorrer(30);

console.log(`Kilometraje total de la moto: ${miMoto.consultarKilometraje} km`);