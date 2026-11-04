export {};

type CategoriaGasto = "hospedaje" | "comida" | "transporte" | "actividades";

interface Gasto {
  readonly fecha: string;
  readonly pais: string;
  readonly categoria: CategoriaGasto;
  readonly monto: number;
}

const PRESUPUESTO_DIARIO = 45;

const gastos: readonly Gasto[] = [
  { fecha: "2026-07-01", pais: "Peru", categoria: "hospedaje", monto: 15 },
  { fecha: "2026-07-01", pais: "Peru", categoria: "comida", monto: 12 },
  { fecha: "2026-07-01", pais: "Peru", categoria: "transporte", monto: 6 },
  { fecha: "2026-07-02", pais: "Peru", categoria: "actividades", monto: 40 },
  { fecha: "2026-07-02", pais: "Peru", categoria: "comida", monto: 14 },
  { fecha: "2026-07-03", pais: "Bolivia", categoria: "hospedaje", monto: 10 },
  { fecha: "2026-07-03", pais: "Bolivia", categoria: "comida", monto: 8 },
  { fecha: "2026-07-03", pais: "Bolivia", categoria: "transporte", monto: 18 },
  { fecha: "2026-13-01", pais: "Bolivia", categoria: "comida", monto: 5 },
  { fecha: "2026-07-04", pais: "Bolivia", categoria: "comida", monto: -9 },
];

const esGastoValido = (g: Gasto): boolean => {
  const d = new Date(`${g.fecha}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && g.monto > 0 && g.pais.trim().length > 0;
};

const sumarPor = <K extends string>(items: readonly Gasto[], clave: (g: Gasto) => K): Map<K, number> =>
  items.reduce((mapa, g) => mapa.set(clave(g), (mapa.get(clave(g)) ?? 0) + g.monto), new Map<K, number>());

const validos = gastos.filter(esGastoValido);
const invalidos = gastos.filter((g) => !esGastoValido(g));
const porDia = sumarPor(validos, (g) => g.fecha);
const porCategoria = sumarPor(validos, (g) => g.categoria);
const porPais = sumarPor(validos, (g) => g.pais);
const total = validos.reduce((acc, g) => acc + g.monto, 0);
const diasExcedidos = [...porDia].filter(([, monto]) => monto > PRESUPUESTO_DIARIO);

console.log("Ejercicio 43: Presupuesto backpacking");
console.log(`Gastos validos: ${validos.length} | invalidos: ${invalidos.length}`);
invalidos.forEach((g) => console.log(`  - ${g.fecha} ${g.categoria} $${g.monto} es invalido`));
console.log(`Presupuesto diario: $${PRESUPUESTO_DIARIO}`);
porDia.forEach((monto, fecha) => console.log(`  ${fecha}: $${monto}${monto > PRESUPUESTO_DIARIO ? ` (excede por $${monto - PRESUPUESTO_DIARIO})` : ""}`));
console.log("Por categoria:");
[...porCategoria].sort((a, b) => b[1] - a[1]).forEach(([c, m]) => console.log(`  ${c}: $${m}`));
console.log(`Por pais: ${[...porPais].map(([p, m]) => `${p} $${m}`).join(" | ")}`);
console.log(`Total: $${total} | promedio diario: $${Math.round((total / porDia.size) * 100) / 100} | dias excedidos: ${diasExcedidos.length}`);
