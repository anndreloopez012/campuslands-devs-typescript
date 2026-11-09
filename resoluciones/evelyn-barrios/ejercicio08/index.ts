export {};

// Ejercicio 8: Union Types
// Contexto: Vehiculos deportivos e hiperdeportivos

// TODO: crea una union discriminada para vehiculos.
type Deportivo = { tipo: "deportivo"; hp: number };
type Hiperdeportivo = { tipo: "hiperdeportivo"; topSpeed: number };
type Electrico = { tipo: "electrico"; autonomia: number }; // Reto Extra


type Vehiculo = Deportivo | Hiperdeportivo | Electrico;


function detallesAuto(auto: Vehiculo): void {
 console.log(`Tipo: ${auto.tipo}`);


 if (auto.tipo === "deportivo") {
   console.log(`Caballos de fuerza: ${auto.hp}`);
 } else if (auto.tipo === "hiperdeportivo") {
   console.log(`Velocidad punta: ${auto.topSpeed} km/h`);
 } else {
   console.log(`Autonomía: ${auto.autonomia} km`);
 }
}


const miFerrari: Deportivo = { tipo: "deportivo", hp: 600 };
const miTesla: Electrico = { tipo: "electrico", autonomia: 500 };


detallesAuto(miFerrari);
detallesAuto(miTesla);
