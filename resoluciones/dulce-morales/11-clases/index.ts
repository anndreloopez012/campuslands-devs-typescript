export {};

// Ejercicio 11: Clases
// Contexto: Sistema de motocicletas
// Resolucion: Dulce Morales

class Motocicleta {
  // Datos fijos de la moto: se pueden leer, pero no cambiar despues de crearla
  public readonly marca: string;
  public readonly modelo: string;
  public readonly cilindrada: number;

  // Estado interno: solo la propia clase puede cambiarlo
  private encendida: boolean;
  private kilometraje: number;

  // El constructor inicializa todo el estado
  constructor(marca: string, modelo: string, cilindrada: number, kilometrajeInicial: number = 0) {
    this.marca = marca;
    this.modelo = modelo;
    this.cilindrada = cilindrada;
    this.encendida = false;
    this.kilometraje = kilometrajeInicial;
  }

  // Reto extra: getter para consultar el kilometraje (solo lectura, no hay setter)
  public get kilometrajeActual(): number {
    return this.kilometraje;
  }

  public get estaEncendida(): boolean {
    return this.encendida;
  }

  public encender(): string {
    if (this.encendida) {
      return `${this.modelo} ya estaba encendida.`;
    }
    this.encendida = true;
    return `${this.modelo} encendida. Brrrum!`;
  }

  public apagar(): string {
    if (!this.encendida) {
      return `${this.modelo} ya estaba apagada.`;
    }
    this.encendida = false;
    return `${this.modelo} apagada.`;
  }

  // Unica forma de aumentar el kilometraje: recorriendo con la moto encendida
  public recorrer(kilometros: number): string {
    if (!this.encendida) {
      return `No se puede recorrer: ${this.modelo} esta apagada.`;
    }
    if (kilometros <= 0) {
      return `Distancia invalida: ${kilometros} km.`;
    }
    this.kilometraje += kilometros;
    return `${this.modelo} recorrio ${kilometros} km.`;
  }

  public mostrarEstado(): string {
    const estado: string = this.encendida ? "Encendida" : "Apagada";
    return `${this.marca} ${this.modelo} (${this.cilindrada} cc) | ${estado} | ${this.kilometraje} km`;
  }
}

const moto: Motocicleta = new Motocicleta("Kawasaki", "Ninja 400", 399, 1200);

console.log("========= SISTEMA DE MOTOCICLETAS =========");
console.log(`Estado inicial: ${moto.mostrarEstado()}`);
console.log(moto.recorrer(50)); // falla: esta apagada
console.log(moto.encender());
console.log(moto.recorrer(85));
console.log(moto.recorrer(-10)); // falla: distancia invalida
console.log(moto.recorrer(42));
console.log(moto.apagar());
console.log(`Estado final:   ${moto.mostrarEstado()}`);
console.log(`Kilometraje (getter): ${moto.kilometrajeActual} km`);
console.log("===========================================");

// Estas lineas marcarian error porque el kilometraje no se puede cambiar desde fuera:
// moto.kilometraje = 0;
// moto.kilometrajeActual = 0;
