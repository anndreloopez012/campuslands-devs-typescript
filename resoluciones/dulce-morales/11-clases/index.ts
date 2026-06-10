export {};

// Ejercicio 11: Clases
// Contexto: Sistema de motocicletas

class Motocicleta {
  // Propiedades encapsuladas
  public marca: string;
  public modelo: string;
  private _kilometraje: number; // Restricción: No accesible directamente desde fuera
  private estaEncendida: boolean;

  // Constructor para inicializar el estado
  constructor(marca: string, modelo: string) {
    this.marca = marca;
    this.modelo = modelo;
    this._kilometraje = 0;
    this.estaEncendida = false;
  }

  // Reto Extra: Getter para consultar el kilometraje de forma segura
  public get kilometraje(): number {
    return this._kilometraje;
  }

  // Método para encender el vehículo
  public encender(): void {
    this.estaEncendida = true;
    console.log(`${this.marca} ${this.modelo} ha sido encendida.`);
  }

  // Método para recorrer kilómetros cambiando el estado interno
  public recorrer(distancia: number): void {
    if (this.estaEncendida) {
      this._kilometraje += distancia;
      console.log(`Recorriste ${distancia} km.`);
    } else {
      console.log("No puedes avanzar, la motocicleta está apagada.");
    }
  }
}

// Ejecución y pruebas
const miMoto = new Motocicleta("Yamaha", "MT-07");

miMoto.encender();
miMoto.recorrer(45);
miMoto.recorrer(20);

// Impresión del estado usando el getter
console.log(`Kilometraje total actual: ${miMoto.kilometraje} km.`);
