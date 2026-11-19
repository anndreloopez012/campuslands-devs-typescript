export {};

// Ejercicio 8: Union Types
// Contexto: Vehiculos deportivos e hiperdeportivos
// Resolucion: Dulce Morales

// Datos comunes a todos los vehiculos
type VehiculoBase = {
  marca: string;
  modelo: string;
  velocidadMaximaKmh: number;
};

// Cada variante tiene la propiedad discriminante `tipo` y sus propias propiedades
type Deportivo = VehiculoBase & {
  tipo: "deportivo";
  traccion: "trasera" | "integral";
  usoDiario: boolean;
};

type Hiperdeportivo = VehiculoBase & {
  tipo: "hiperdeportivo";
  unidadesFabricadas: number;
  materialChasis: "fibra de carbono" | "aluminio";
};

// Reto extra: variante electrica de alto rendimiento
type ElectricoAltoRendimiento = VehiculoBase & {
  tipo: "electrico";
  autonomiaKm: number;
  ceroACienSegundos: number;
};

// Union discriminada: un vehiculo es exactamente una de estas variantes
type Vehiculo = Deportivo | Hiperdeportivo | ElectricoAltoRendimiento;

// La funcion acepta la union. Dentro de cada `case`, TypeScript ya sabe
// que variante es y deja usar solo sus propiedades (sin casteos).
function describirVehiculo(vehiculo: Vehiculo): string {
  const nombre: string = `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.velocidadMaximaKmh} km/h)`;

  switch (vehiculo.tipo) {
    case "deportivo": {
      const uso: string = vehiculo.usoDiario ? "apto para uso diario" : "pensado para pista";
      return `DEPORTIVO      | ${nombre} - traccion ${vehiculo.traccion}, ${uso}.`;
    }
    case "hiperdeportivo":
      return `HIPERDEPORTIVO | ${nombre} - solo ${vehiculo.unidadesFabricadas} unidades, chasis de ${vehiculo.materialChasis}.`;
    case "electrico":
      return `ELECTRICO      | ${nombre} - ${vehiculo.autonomiaKm} km de autonomia, 0-100 en ${vehiculo.ceroACienSegundos} s.`;
    default: {
      // Si se agrega una variante nueva y no se maneja, aqui aparece un error de compilacion
      const sinManejar: never = vehiculo;
      return sinManejar;
    }
  }
}

const garaje: Vehiculo[] = [
  {
    tipo: "deportivo",
    marca: "Porsche",
    modelo: "911 Carrera",
    velocidadMaximaKmh: 293,
    traccion: "trasera",
    usoDiario: true,
  },
  {
    tipo: "hiperdeportivo",
    marca: "Bugatti",
    modelo: "Chiron",
    velocidadMaximaKmh: 420,
    unidadesFabricadas: 500,
    materialChasis: "fibra de carbono",
  },
  {
    tipo: "electrico",
    marca: "Rimac",
    modelo: "Nevera",
    velocidadMaximaKmh: 412,
    autonomiaKm: 490,
    ceroACienSegundos: 1.85,
  },
  {
    tipo: "deportivo",
    marca: "Nissan",
    modelo: "GT-R",
    velocidadMaximaKmh: 315,
    traccion: "integral",
    usoDiario: false,
  },
];

console.log("==================== GARAJE ====================");
garaje.forEach((vehiculo: Vehiculo): void => {
  console.log(describirVehiculo(vehiculo));
});
console.log("================================================");
