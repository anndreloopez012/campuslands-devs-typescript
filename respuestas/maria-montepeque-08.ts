export {};

// Ejercicio 08: Union Types
type Deportivo = {
  tipo: "deportivo";
  marca: string;
  modelo: string;
  potenciaHp: number;
};

type Hiperdeportivo = {
  tipo: "hiperdeportivo";
  marca: string;
  modelo: string;
  potenciaHp: number;
  velocidadMaximaKmh: number;
};

type ElectricoAltoRendimiento = {
  tipo: "electrico";
  marca: string;
  modelo: string;
  autonomiaKm: number;
  aceleracion0a100: number;
};

// Union discriminada: el campo `tipo` permite a TypeScript estrechar el tipo.
type VehiculoRendimiento =
  | Deportivo
  | Hiperdeportivo
  | ElectricoAltoRendimiento;

// Garantiza que se manejen TODAS las variantes de la union.
function casoNoManejado(valor: never): never {
  throw new Error(`Variante de vehiculo no manejada: ${JSON.stringify(valor)}`);
}

function describirVehiculo(vehiculo: VehiculoRendimiento): string {
  switch (vehiculo.tipo) {
    case "deportivo":
      return `${vehiculo.marca} ${vehiculo.modelo}: deportivo de ${vehiculo.potenciaHp} HP.`;

    case "hiperdeportivo":
      return `${vehiculo.marca} ${vehiculo.modelo}: ${vehiculo.potenciaHp} HP y ${vehiculo.velocidadMaximaKmh} km/h.`;

    case "electrico":
      return `${vehiculo.marca} ${vehiculo.modelo}: ${vehiculo.autonomiaKm} km de autonomia y 0-100 en ${vehiculo.aceleracion0a100}s.`;

    default:
      return casoNoManejado(vehiculo);
  }
}

// Una prueba por variante para validar el resultado esperado.
console.log(
  describirVehiculo({
    tipo: "deportivo",
    marca: "Porsche",
    modelo: "911 Carrera",
    potenciaHp: 385,
  }),
);

console.log(
  describirVehiculo({
    tipo: "hiperdeportivo",
    marca: "Koenigsegg",
    modelo: "Jesko",
    potenciaHp: 1600,
    velocidadMaximaKmh: 480,
  }),
);

console.log(
  describirVehiculo({
    tipo: "electrico",
    marca: "Rimac",
    modelo: "Nevera",
    autonomiaKm: 490,
    aceleracion0a100: 1.85,
  }),
);
