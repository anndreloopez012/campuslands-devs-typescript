export {};

type VehiculoDeportivo = {
    tipo: "deportivo";
    modelo: string;
    velocidadMaxima: number;
};

type VehiculoHiperdeportivo = {
    tipo: "hiperdeportivo";
    modelo: string;
    caballosFuerza: number;
};

type VehiculoElectrico = {
    tipo: "electrico";
    modelo: string;
    autonomia: number;
};

type Vehiculo =
    | VehiculoDeportivo
    | VehiculoHiperdeportivo
    | VehiculoElectrico;

function describirVehiculo(vehiculo: Vehiculo): string {
    if (vehiculo.tipo === "deportivo") {
        return `Deportivo: ${vehiculo.modelo}, velocidad maxima de ${vehiculo.velocidadMaxima} km/h`;
    }
    if (vehiculo.tipo === "hiperdeportivo") {
        return `Hiperdeportivo: ${vehiculo.modelo}, ${vehiculo.caballosFuerza} HP`;
    }
    if (vehiculo.tipo === "electrico") {
        return `Electrico de alto rendimiento: ${vehiculo.modelo}, autonomia de ${vehiculo.autonomia} km`;
    }
    return "Vehiculo desconocido";
}

const deportivo: VehiculoDeportivo = {
    tipo: "deportivo",
    modelo: "Porsche 911 GT3",
    velocidadMaxima: 318
};

const hiperdeportivo: VehiculoHiperdeportivo = {
    tipo: "hiperdeportivo",
    modelo: "Bugatti Chiron",
    caballosFuerza: 1500
};

const electrico: VehiculoElectrico = {
    tipo: "electrico",
    modelo: "Rimac Nevera",
    autonomia: 490
};

console.log(describirVehiculo(deportivo));
console.log(describirVehiculo(hiperdeportivo));
console.log(describirVehiculo(electrico));