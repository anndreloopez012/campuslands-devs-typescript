export {};

// Ejercicio 11: Clases
// Contexto: Sistema de motocicletas

// TODO: crea la clase Motocicleta.

class Motocicleta {
  marca: string;
  modelo: string;
  readonly kilometraje: number;
  readonly anioFabricacion: number;

  constructor(
    marca: string,
    modelo: string,
    kilometraje: number,
    anioFabricacion: number,
  ) {
    this.marca = marca;
    this.modelo = modelo;
    this.kilometraje = kilometraje;
    this.anioFabricacion = anioFabricacion;
  }

  describir(): string {
    return `Moto marca ${this.marca} con el modelo ${this.modelo} y con ${this.kilometraje} KM recorridos`;
  }
}

const registrosMotos: Motocicleta[] = [];

registrosMotos.push(new Motocicleta("Honda", "CB500", 12000, 2018));
registrosMotos.push(new Motocicleta("Yamaha", "MT-07", 8000, 2020));

console.log(registrosMotos[1].describir());
console.log(registrosMotos[0].describir());
