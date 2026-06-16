type Deportivo = { tipo: "deportivo"; tieneModoPista: boolean };
type Hiperdeportivo = { tipo: "hiperdeportivo"; velocidadMaxima: number };
type Electrico = { tipo: "electrico"; tiempoCeroCien: number }; 

type Vehiculo = Deportivo | Hiperdeportivo | Electrico;


function describirVehiculo(auto: Vehiculo): string {
  switch (auto.tipo) {
    case "deportivo":
      return `Deportivo - Tiene modo pista?: ${auto.tieneModoPista}`;
    case "hiperdeportivo":
      return `Hiperdeportivo - Vel. Máxima: ${auto.velocidadMaxima} km/h`;
    case "electrico":
      return `Eléctrico - 0 a 100 en: ${auto.tiempoCeroCien} seg`;
  }
}

const auto1: Vehiculo = { tipo: "deportivo", tieneModoPista: true };
const auto2: Vehiculo = { tipo: "hiperdeportivo", velocidadMaxima: 420 };
const auto3: Vehiculo = { tipo: "electrico", tiempoCeroCien: 2.1 };

console.log(describirVehiculo(auto1));
console.log(describirVehiculo(auto2));
console.log(describirVehiculo(auto3));