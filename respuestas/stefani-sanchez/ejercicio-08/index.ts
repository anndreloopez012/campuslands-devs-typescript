export {};

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

type VehiculoRendimiento = Deportivo | Hiperdeportivo | ElectricoAltoRendimiento;

function describirVehiculo(vehiculo: VehiculoRendimiento): string {
  if (vehiculo.tipo === "hiperdeportivo") {
    return `${vehiculo.marca} ${vehiculo.modelo}: ${vehiculo.potenciaHp} HP y ${vehiculo.velocidadMaximaKmh} km/h.`;
  }

  if (vehiculo.tipo === "electrico") {
    return `${vehiculo.marca} ${vehiculo.modelo}: ${vehiculo.autonomiaKm} km de autonomia y 0-100 en ${vehiculo.aceleracion0a100}s.`;
  }

  return `${vehiculo.marca} ${vehiculo.modelo}: deportivo de ${vehiculo.potenciaHp} HP.`;
}

console.log(describirVehiculo({ tipo: "hiperdeportivo", marca: "Koenigsegg", modelo: "Jesko", potenciaHp: 1600, velocidadMaximaKmh: 480 }));
