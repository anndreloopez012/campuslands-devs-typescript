export {};


// 1. DEFINICIÓN DE LA CLASE

class Motocicleta {
    // Propiedades de la clase
    public marca: string;
    public modelo: string;
    public estaEncendida: boolean;
    
    // RESTRICCIÓN: El kilometraje es privado para evitar modificaciones externas directas
    private _kilometraje: number;

    // CONSTRUCTOR: Inicializa el estado del objeto al crearlo
    constructor(marca: string, modelo: string) {
        this.marca = marca;
        this.modelo = modelo;
        this.estaEncendida = false; // Por defecto inicia apagada
        this._kilometraje = 0;       // Por defecto inicia en 0 km
    }

    // RETO EXTRA: Getter para consultar el kilometraje de forma segura
    public get kilometraje(): number {
        return this._kilometraje;
    }

    // MÉTODO: Cambia el estado interno a encendido
    public encender(): void {
        if (this.estaEncendida) {
            console.log(`La moto ${this.marca} ya estaba encendida.`);
            return;
        }
        this.estaEncendida = true;
        console.log(`¡Run!! La ${this.marca} ${this.modelo} se ha encendido.`);
    }

    // MÉTODO: Modifica el comportamiento y suma kilómetros bajo ciertas reglas
    public recorrerKilometros(distancia: number): void {
        // Validación de comportamiento interno
        if (!this.estaEncendida) {
            console.log(`No puedes recorrer kilómetros si la moto está apagada. ¡Enciéndela primero!`);
            return;
        }

        if (distancia <= 0) {
            console.log(`La distancia a recorrer debe ser mayor a 0 km.`);
            return;
        }

        this._kilometraje += distancia;
        console.log(`Has recorrido ${distancia} km con éxito.`);
    }

    // MÉTODO AUXILIAR: Muestra el estado actual encapsulado
    public mostrarEstado(): void {
        console.log("----------------------------------------");
        console.log(`ESTADO DE LA MOTO:`);
        console.log(`- Vehículo   : ${this.marca} ${this.modelo}`);
        console.log(`- Motor      : ${this.estaEncendida ? "Encendido " : "Apagado "}`);
        // El método interno lee la propiedad privada directamente con this._kilometraje
        console.log(`- Odómetro   : ${this._kilometraje} km`);
        console.log("----------------------------------------");
    }
}

//2. CREACION DE OBJETO Y EJECUCION 

console.log("========================================");
console.log("       CONCESIONARIO DE MOTOS        ");
console.log("========================================");

// Creamos la instancia usando el Constructor
const miMoto = new Motocicleta("Yamaha", "MT-07");

// Intentamos recorrer kilómetros estando apagada (Falla por regla de negocio)
miMoto.recorrerKilometros(25);

// Encendemos y conducimos
miMoto.encender();
miMoto.recorrerKilometros(45.5);
miMoto.recorrerKilometros(100);

// Usamos el GETTER para leer el kilometraje (Notación de propiedad sin paréntesis)
console.log(`\n Alerta del sistema: Tu kilometraje actual es de ${miMoto.kilometraje} km.`);

// Mostramos el estado final
miMoto.mostrarEstado();




