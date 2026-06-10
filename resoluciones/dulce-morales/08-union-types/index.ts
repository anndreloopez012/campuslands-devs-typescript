export {};

// Ejercicio 8: Union Types
// Contexto: Vehiculos deportivos e hiperdeportivos

interface Deportivo {
  tipo: "deportivo"; // Propiedad discriminante
  marca: string;
  modelo: string;
  esManual: boolean;
}

// Tipo para vehículos Hiperdeportivos
interface Hiperdeportivo {
  tipo: "hiperdeportivo"; // Propiedad discriminante
  marca: string;
  modelo: string;
  velocidadMaxima: number;
}

// Reto Extra: Variante para vehículo Eléctrico de Alto Rendimiento
interface ElectricoAltoRendimiento {
  tipo: "electrico_alto_rendimiento"; // Propiedad discriminante
  marca: string;
  modelo: string;
  capacidadBateriaKwh: number;
}

// Union Type que agrupa todas las variantes
type VehiculoDeportivo = Deportivo | Hiperdeportivo | ElectricoAltoRendimiento;

// Función que discrimina y describe cada tipo de vehículo
function describirVehiculo(vehiculo: VehiculoDeportivo): void {
  // TypeScript estrecha el tipo automáticamente usando la propiedad discriminante
  switch (vehiculo.tipo) {
    case "deportivo":
      console.log(
        `Deportivo: ${vehiculo.marca} ${vehiculo.modelo} | Transmisión Manual: ${vehiculo.esManual ? "Sí" : "No"}`,
      );
      break;
    case "hiperdeportivo":
      console.log(
        `Hiperdeportivo: ${vehiculo.marca} ${vehiculo.modelo} | Velocidad Máxima: ${vehiculo.velocidadMaxima} km/h`,
      );
      break;
    case "electrico_alto_rendimiento":
      console.log(
        `Eléctrico Rendimiento: ${vehiculo.marca} ${vehiculo.modelo} | Batería: ${vehiculo.capacidadBateriaKwh} kWh`,
      );
      break;
  }
}

// Pruebas de ejecución
const auto1: Deportivo = {
  tipo: "deportivo",
  marca: "Porsche",
  modelo: "911 GT3",
  esManual: true,
};
const auto2: Hiperdeportivo = {
  tipo: "hiperdeportivo",
  marca: "Bugatti",
  modelo: "Chiron",
  velocidadMaxima: 420,
};
const auto3: ElectricoAltoRendimiento = {
  tipo: "electrico_alto_rendimiento",
  marca: "Rimac",
  modelo: "Nevera",
  capacidadBateriaKwh: 120,
};

describirVehiculo(auto1);
describirVehiculo(auto2);
describirVehiculo(auto3);
