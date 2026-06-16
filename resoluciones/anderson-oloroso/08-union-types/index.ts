export {};

// Ejercicio 8: Union Types
// Contexto: Vehiculos deportivos e hiperdeportivos

// TODO: crea una union discriminada para vehiculos.

type autoDeportivo = {
  tipo: "deportivo";
  marca: string;
  modelo: string;
  caballosFuerza: number;
  tipoTraccion: "trasera" | "delantera" | "integral";
};

type superDeportivo = {
  tipo: "hiperdeportivo";
  marca: string;
  modelo: string;
  caballosFuerza: number; 
  velocidadMaxima: number; 
  unidadesProducidas: number;
};

type autosAura = autoDeportivo | superDeportivo;
const porsche911: autosAura = {
  tipo: "deportivo",
  marca: "Porsche",
  modelo: "911 Carrera S",
  caballosFuerza: 450,
  tipoTraccion: "trasera",
};

const bugattiChiron: autosAura = {
  tipo: "hiperdeportivo",
  marca: "Bugatti",
  modelo: "Chiron",
  caballosFuerza: 1500,
  velocidadMaxima: 420,
  unidadesProducidas: 500,
};

console.log(porsche911);
console.log(bugattiChiron);
