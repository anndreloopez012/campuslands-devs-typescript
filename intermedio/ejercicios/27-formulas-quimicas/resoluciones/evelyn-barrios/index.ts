export {};

type CategoriaCompuesto = "Oxido" | "Acido" | "Sal" | "Organico";

interface ComponenteAtomico {
  readonly simbolo: string;
  readonly cantidad: number;
}

interface CompuestoQuimico {
  readonly nombreComun: string;
  readonly formulaMolecular: string;
  readonly categoria: CategoriaCompuesto;
  readonly componentes: readonly ComponenteAtomico[];
}

interface AnalisisQuimico {
  readonly formula: string;
  readonly masaMolarGramosMol: number;
  readonly totalAtomos: number;
  readonly composicionPorcentual: Record<string, number>;
}

const TABLA_PESOS_ATOMICOS: Record<string, number> = {
  H: 1.008,
  C: 12.011,
  O: 15.999,
  Na: 22.99,
  Cl: 35.45,
  S: 32.06,
};

function calcularMasaMolar(compuesto: CompuestoQuimico): AnalisisQuimico {
  const masaTotal = compuesto.componentes.reduce((acc, c) => {
    const pesoUnitario = TABLA_PESOS_ATOMICOS[c.simbolo] ?? 0;
    return acc + pesoUnitario * c.cantidad;
  }, 0);

  const totalAtomos = compuesto.componentes.reduce((acc, c) => acc + c.cantidad, 0);
  const composicionPorcentual: Record<string, number> = {};

  for (const c of compuesto.componentes) {
    const pesoAporte = (TABLA_PESOS_ATOMICOS[c.simbolo] ?? 0) * c.cantidad;
    composicionPorcentual[c.simbolo] = Number(((pesoAporte / (masaTotal || 1)) * 100).toFixed(2));
  }

  return {
    formula: compuesto.formulaMolecular,
    masaMolarGramosMol: Number(masaTotal.toFixed(3)),
    totalAtomos,
    composicionPorcentual,
  };
}

const acidoSulfurico: CompuestoQuimico = {
  nombreComun: "Acido Sulfurico",
  formulaMolecular: "H2SO4",
  categoria: "Acido",
  componentes: [
    { simbolo: "H", cantidad: 2 },
    { simbolo: "S", cantidad: 1 },
    { simbolo: "O", cantidad: 4 },
  ],
};

console.log("=== VALIDADOR DE FORMULAS QUIMICAS ===");
const analisis = calcularMasaMolar(acidoSulfurico);
console.log(`Compuesto: ${acidoSulfurico.nombreComun} (${analisis.formula})`);
console.log(`Masa Molar: ${analisis.masaMolarGramosMol} g/mol | Atomos en molecula: ${analisis.totalAtomos}`);
console.log(`Aporte de Oxigeno: ${analisis.composicionPorcentual.O}%`);