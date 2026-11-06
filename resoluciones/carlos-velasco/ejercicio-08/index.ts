export {};

// Ejercicio 8: Union Types
// Contexto: Vehiculos deportivos e hiperdeportivos

// TODO: crea una union discriminada para vehiculos.

type Deportivo = {
    marca: string;
    modelo: string;
    tipo: 'deportivo';
    cilindrada: string;
}

type Hiperdeportivo = {
    marca: string;
    modelo: string;
    tipo: 'hiperdeportivo';
    velocidadMax: number; 
}
 
type Electrico = {
    marca: string;
    modelo: string;
    tipo: 'electrico';
    autonomia: number; 
}

type Vehiculos = Deportivo | Hiperdeportivo | Electrico;

function informacion_vehiculo(vehiculo: Vehiculos): string {
    switch (vehiculo.tipo) {
        case 'deportivo':
            return `Deportivo: ${vehiculo.marca} ${vehiculo.modelo} con motor de ${vehiculo.cilindrada}.`;
        
        case 'hiperdeportivo':
            return `Hiperdeportivo: ${vehiculo.marca} ${vehiculo.modelo}, capaz de alcanzar ${vehiculo.velocidadMax} km/h.`;
        
        case 'electrico':
            return `Vehículo Eléctrico: ${vehiculo.marca} ${vehiculo.modelo} con una autonomía de ${vehiculo.autonomia} km.`;
            
        default:
            return "Tipo de vehículo desconocido.";
    }
}

const miDeportivo: Deportivo = { tipo: 'deportivo', marca: 'Porsche', modelo: '911', cilindrada: '3.0L' };
const miHiper: Hiperdeportivo = { tipo: 'hiperdeportivo', marca: 'Bugatti', modelo: 'Chiron', velocidadMax: 440 };
const miElectrico: Electrico = { tipo: 'electrico', marca: 'Tesla', modelo: 'Model S', autonomia: 650 };

console.log(informacion_vehiculo(miDeportivo));
console.log(informacion_vehiculo(miHiper));
console.log(informacion_vehiculo(miElectrico));
