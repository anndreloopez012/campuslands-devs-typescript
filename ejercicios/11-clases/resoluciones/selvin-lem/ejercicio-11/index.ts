export {};

// Ejercicio 11: Clases
// Contexto: Sistema de motocicletas

// TODO: crea la clase Motocicleta.

class VehículoDosRuedas {
    public deptoMarca: string;
    public motorCilindrada: number;
    public marchaActiva: boolean;
    // nadie fuera de esta clase puede cambiarla o leerla directamente
    private _odometroKilometraje: number; 

    constructor(marca: string, cilindrada: number) {
        this.deptoMarca = marca;
        this.motorCilindrada = cilindrada;
        this.marchaActiva = false; 
        this._odometroKilometraje = 0; 
    }

    public get obtenerKilometraje(): number {
        return this._odometroKilometraje;
    }

    public arrancarMotor(): void {
        if (this.marchaActiva) {
            console.log(`Sistema: El motor de la ${this.deptoMarca} ya se encuentra encendido.`);
        } else {
            this.marchaActiva = true;
            console.log(`Sistema: Motor encendido con éxito para la ${this.deptoMarca}.`);
        }
    }

    public ejecutarViaje(distanciaKm: number): void {
        if (!this.marchaActiva) {
            console.log(`Error de Operación: No se pueden registrar kilómetros. El motor está apagado.`);
            return;
        }

        if (distanciaKm <= 0) {
            console.log(`Sistema: La distancia ingresada debe ser mayor a cero.`);
            return;
        }
        this._odometroKilometraje += distanciaKm;
        console.log(`Viaje completado: Se sumaron +${distanciaKm} km al odómetro.`);
    }

    public mostrarFichaEstado(): void {
        console.log("-----------------------------------------");
        console.log(` REGISTRO DE UNIDAD: ${this.deptoMarca.toUpperCase()}`);
        console.log("-----------------------------------------");
        console.log(`• Cilindrada:   ${this.motorCilindrada} cc`);
        console.log(`• Estado Motor: ${this.marchaActiva ? "ENCENDIDO 🟢" : "APAGADO 🔴"}`);
        console.log(`• Odómetro:     ${this._odometroKilometraje} km totales`);
        console.log("-----------------------------------------\n");
    }
}
console.log("=======INICIALIZACIÓN DE MOTOCICLETA=======");

const miMoto = new VehículoDosRuedas("Suzuki Gixxer", 250);
miMoto.mostrarFichaEstado();
miMoto.ejecutarViaje(50); 
miMoto.arrancarMotor();
miMoto.ejecutarViaje(120);
miMoto.ejecutarViaje(85);
miMoto.mostrarFichaEstado();
console.log(` Auditoría externa rápida: Lectura segura del kilometraje mediante Getter -> [${miMoto.obtenerKilometraje} km]`);
console.log("=========================================");