export {};

type Proceso = "MIG" | "TIG" | "ARCO";
type Resultado = "conforme" | "retrabajo" | "rechazado";
type RangoAmperaje = readonly [minimo: number, maximo: number];

interface Soldadura {
  readonly id: number;
  readonly soldador: string;
  readonly proceso: Proceso;
  readonly espesorMm: number;
  readonly amperaje: number;
  readonly resultado: Resultado;
}

const rangoPorProceso: Record<Proceso, RangoAmperaje> = {
  MIG: [80, 250],
  TIG: [30, 200],
  ARCO: [60, 300],
};

const ordenes: readonly Soldadura[] = [
  { id: 1, soldador: "Rene", proceso: "MIG", espesorMm: 4, amperaje: 150, resultado: "conforme" },
  { id: 2, soldador: "Rene", proceso: "TIG", espesorMm: 2, amperaje: 90, resultado: "conforme" },
  { id: 3, soldador: "Gaby", proceso: "ARCO", espesorMm: 8, amperaje: 220, resultado: "retrabajo" },
  { id: 4, soldador: "Gaby", proceso: "MIG", espesorMm: 3, amperaje: 40, resultado: "rechazado" },
  { id: 5, soldador: "Tono", proceso: "TIG", espesorMm: 1, amperaje: 35, resultado: "conforme" },
  { id: 6, soldador: "Tono", proceso: "ARCO", espesorMm: -2, amperaje: 100, resultado: "conforme" },
  { id: 7, soldador: "", proceso: "MIG", espesorMm: 5, amperaje: 180, resultado: "conforme" },
];

const estaEnRango = (soldadura: Soldadura): boolean => {
  const [minimo, maximo] = rangoPorProceso[soldadura.proceso];
  return soldadura.amperaje >= minimo && soldadura.amperaje <= maximo;
};

const esOrdenValida = (soldadura: Soldadura): boolean =>
  soldadura.soldador.trim().length > 0 && soldadura.espesorMm > 0;

const validas = ordenes.filter(esOrdenValida);
const invalidas = ordenes.filter((soldadura) => !esOrdenValida(soldadura));
const fueraDeRango = validas.filter((soldadura) => !estaEnRango(soldadura));
const conformesPorProceso = validas
  .filter((s) => s.resultado === "conforme")
  .reduce((mapa, s) => mapa.set(s.proceso, (mapa.get(s.proceso) ?? 0) + 1), new Map<Proceso, number>());
const tasaConformidad = Math.round(
  (validas.filter((s) => s.resultado === "conforme").length / validas.length) * 100,
);

console.log("Ejercicio 26: Control de soldadura");
console.log(`Ordenes validas: ${validas.length} | invalidas: ${invalidas.length}`);
invalidas.forEach((s) => console.log(`  - #${s.id} tiene datos invalidos`));
fueraDeRango.forEach((s) => {
  const [min, max] = rangoPorProceso[s.proceso];
  console.log(`  ! #${s.id} ${s.proceso} a ${s.amperaje}A fuera de rango (${min}-${max}A)`);
});
conformesPorProceso.forEach((cantidad, proceso) => console.log(`  Conformes ${proceso}: ${cantidad}`));
console.log(`Tasa de conformidad: ${tasaConformidad}%`);
