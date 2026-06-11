export {};

// Ejercicio 8: Union Types

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
type Electrico = {
  tipo: "electrico";
  marca: string;
  modelo: string;
  autonomiaKm: number;
  aceleracion0a100: number;
};

type Vehiculo = Deportivo | Hiperdeportivo | Electrico;

const describir = (v: Vehiculo): string =>
  v.tipo === "hiperdeportivo"
    ? `${v.marca} ${v.modelo}: ${v.potenciaHp} HP y ${v.velocidadMaximaKmh} km/h.`
    : v.tipo === "electrico"
      ? `${v.marca} ${v.modelo}: ${v.autonomiaKm} km de autonomia y 0-100 en ${v.aceleracion0a100}s.`
      : `${v.marca} ${v.modelo}: deportivo de ${v.potenciaHp} HP.`;

console.log(
  describir({
    tipo: "hiperdeportivo",
    marca: "Koenigsegg",
    modelo: "Jesko",
    potenciaHp: 1600,
    velocidadMaximaKmh: 480,
  }),
);
console.log(
  describir({
    tipo: "deportivo",
    marca: "Porsche",
    modelo: "911 GT3",
    potenciaHp: 510,
  }),
);
console.log(
  describir({
    tipo: "electrico",
    marca: "Rimac",
    modelo: "Nevera",
    autonomiaKm: 490,
    aceleracion0a100: 1.85,
  }),
);