export {};

// Ejercicio 11: Clases
// Contexto: Sistema de motocicletas

// TODO: crea la clase Motocicleta.

// Ejercicio 11: Clases - Sistema de motocicletas

class Motocicleta {
    public marca: string;
    public readonly modelo: string;
    private encendida: boolean;
    private kilometraje: number;

    constructor(marca: string, modelo: string) {
        this.marca = marca;
        this.modelo = modelo;
        this.encendida = false;
        this.kilometraje = 0;
    }

    encender(): void {
        this.encendida = true;
    }

    public recorrer(km: number): void {
        if (this.encendida) {
            if (km > 0) {
                this.kilometraje += km;
                console.log(`Has recorrido ${km} km. Total: ${this.kilometraje} km.`);
            }
        } else {
            console.log("No puedes recorrer kilómetros. La moto está apagada.");
        }
    }
    get kilometrajeActual() {
        return this.kilometraje;
    }
}
const miMoto = new Motocicleta("Yamaha", "MT-07");
miMoto.encender();
miMoto.recorrer(50);
miMoto.recorrer(25);

console.log(`Kilometraje final registrado: ${miMoto.kilometrajeActual} km.`);
