export {};

type Elemento = "H" | "C" | "N" | "O" | "Na" | "Cl" | "S" | "Ca";
type ConteoAtomos = Partial<Record<Elemento, number>>;

const masaAtomica: Record<Elemento, number> = {
  H: 1.008,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  Na: 22.99,
  Cl: 35.45,
  S: 32.06,
  Ca: 40.078,
};

const esElemento = (simbolo: string): simbolo is Elemento => simbolo in masaAtomica;

const FORMULA_VALIDA = /^([A-Z][a-z]?\d*)+$/;

const formulas: readonly string[] = ["H2O", "CO2", "NaCl", "C6H12O6", "CaCO3", "H2SO4", "Xx2", "h2o", "NaCl)", ""];

const parsearFormula = (formula: string): ConteoAtomos | null => {
  if (!FORMULA_VALIDA.test(formula)) return null;

  const conteo: ConteoAtomos = {};
  for (const [, simbolo, cantidad] of formula.matchAll(/([A-Z][a-z]?)(\d*)/g)) {
    if (!esElemento(simbolo)) return null;
    conteo[simbolo] = (conteo[simbolo] ?? 0) + (cantidad === "" ? 1 : Number(cantidad));
  }
  return conteo;
};

const masaMolar = (conteo: ConteoAtomos): number => {
  const total = (Object.entries(conteo) as [Elemento, number][]).reduce(
    (acc, [elemento, cantidad]) => acc + masaAtomica[elemento] * cantidad,
    0,
  );
  return Math.round(total * 1000) / 1000;
};

const elementosUsados = new Set<Elemento>();
const rechazadas: string[] = [];

console.log("Ejercicio 27: Validador de formulas quimicas");
formulas.forEach((formula) => {
  const conteo = parsearFormula(formula);
  if (conteo === null) {
    rechazadas.push(formula);
    return;
  }
  (Object.keys(conteo) as Elemento[]).forEach((e) => elementosUsados.add(e));
  const detalle = Object.entries(conteo).map(([e, n]) => `${e}x${n}`).join(" ");
  console.log(`  ${formula}: ${detalle} -> ${masaMolar(conteo)} g/mol`);
});
console.log(`Formulas rechazadas: ${rechazadas.map((f) => `"${f}"`).join(", ")}`);
console.log(`Elementos distintos usados: ${Array.from(elementosUsados).sort().join(", ")}`);
