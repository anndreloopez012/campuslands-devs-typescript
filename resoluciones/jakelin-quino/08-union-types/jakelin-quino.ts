export {};

// Ejercicio 8: Union Types
// Contexto: Vehiculos deportivos e hiperdeportivos

// TODO: crea una union discriminada para vehiculos.

console.log("-------- Ejercicio 8: Union Types --------")
type Deportivo = {
  tipo: "deportivo";
  nombre: string;
  velocidadMaxima: number;
};

type Hiperdeportivo = {
  tipo: "hiperdeportivo";
  nombre: string;
  precioMillones: number;
};

type ElectricoRendimiento = {
  tipo: "electrico";
  nombre: string;
  autonomiaKm: number;
};

type Vehiculo = Deportivo | Hiperdeportivo | ElectricoRendimiento;

function describirVehiculo(auto: Vehiculo): string {
  if (auto.tipo === "deportivo") {
    return `El ${auto.nombre} es un deportivo que corre a ${auto.velocidadMaxima} km/h.`;
  } 
  if (auto.tipo === "hiperdeportivo") {
    return `El ${auto.nombre} es un hiperdeportivo exclusivo que cuesta $${auto.precioMillones}M USD.`;
  }  
  return `El ${auto.nombre} es el mejor auto eléctrico con ${auto.autonomiaKm} km de autonomía.`;
}

const miCarro: Vehiculo = { 
  tipo: "electrico", 
  nombre: "Tesla Roadster", 
  autonomiaKm: 1000 
};

console.log(describirVehiculo(miCarro));