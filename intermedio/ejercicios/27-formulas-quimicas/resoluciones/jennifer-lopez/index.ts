export {};

type CategoriaQuimica = 'Acido' | 'Base' | 'Sal Binaria' | 'Oxido' | 'Compuesto Organico';
type EstadoValidacionFormula = 'EstructuraValida' | 'BalanceEstequiometricoPendiente' | 'Inestable' | 'ErrorComposicion';

interface ElementoConstituyente {
  readonly simbolo: string;
  readonly cantidadAtomos: number;
}

interface FichaFormulaQuimica {
  readonly formulaId: string;
  readonly nombreCompuesto: string;
  readonly formulaEmpirica: string;
  readonly categoria: CategoriaQuimica;
  readonly pesoMolecularUma: number;
  readonly elementos: readonly ElementoConstituyente[];
  readonly estadoValidacion: EstadoValidacionFormula;
}

interface ResumenAgrupadoCategoriaQuimica {
  readonly categoria: CategoriaQuimica;
  readonly totalFormulas: number;
  readonly pesoMolecularPromedioUma: number;
  readonly sumaPesosMoleculares: number;
  readonly compuestosRegistrados: readonly string[];
}

const inventarioLaboratorioQuimico: readonly FichaFormulaQuimica[] = [
  {
    formulaId: "CHEM-301",
    nombreCompuesto: "Ácido Sulfúrico",
    formulaEmpirica: "H2SO4",
    categoria: "Acido",
    pesoMolecularUma: 98.08,
    elementos: [
      { simbolo: "H", cantidadAtomos: 2 },
      { simbolo: "S", cantidadAtomos: 1 },
      { simbolo: "O", cantidadAtomos: 4 }
    ],
    estadoValidacion: "EstructuraValida",
  },
  {
    formulaId: "CHEM-302",
    nombreCompuesto: "Hidróxido de Sodio",
    formulaEmpirica: "NaOH",
    categoria: "Base",
    pesoMolecularUma: 40.00,
    elementos: [
      { simbolo: "Na", cantidadAtomos: 1 },
      { simbolo: "O", cantidadAtomos: 1 },
      { simbolo: "H", cantidadAtomos: 1 }
    ],
    estadoValidacion: "EstructuraValida",
  },
  {
    formulaId: "CHEM-303",
    nombreCompuesto: "Cloruro de Sodio",
    formulaEmpirica: "NaCl",
    categoria: "Sal Binaria",
    pesoMolecularUma: 58.44,
    elementos: [
      { simbolo: "Na", cantidadAtomos: 1 },
      { simbolo: "Cl", cantidadAtomos: 1 }
    ],
    estadoValidacion: "EstructuraValida",
  },
  {
    formulaId: "CHEM-304",
    nombreCompuesto: "Dióxido de Carbono",
    formulaEmpirica: "CO2",
    categoria: "Oxido",
    pesoMolecularUma: 44.01,
    elementos: [
      { simbolo: "C", cantidadAtomos: 1 },
      { simbolo: "O", cantidadAtomos: 2 }
    ],
    estadoValidacion: "EstructuraValida",
  },
  {
    formulaId: "CHEM-305",
    nombreCompuesto: "Glucosa",
    formulaEmpirica: "C6H12O6",
    categoria: "Compuesto Organico",
    pesoMolecularUma: 180.16,
    elementos: [
      { simbolo: "C", cantidadAtomos: 6 },
      { simbolo: "H", cantidadAtomos: 12 },
      { simbolo: "O", cantidadAtomos: 6 }
    ],
    estadoValidacion: "BalanceEstequiometricoPendiente",
  },
  {
    formulaId: "CHEM-306",
    nombreCompuesto: "Radical Hipotético Inestable",
    formulaEmpirica: "Xx9Yz",
    categoria: "Oxido",
    pesoMolecularUma: 250.50,
    elementos: [
      { simbolo: "Xx", cantidadAtomos: 9 }
    ],
    estadoValidacion: "ErrorComposicion",
  }
];

function validarFormulaAceptada(ficha: FichaFormulaQuimica): boolean {
  return ficha.estadoValidacion !== "ErrorComposicion" && ficha.pesoMolecularUma > 0 && ficha.elementos.length > 0;
}

function agruparPorCategoriaQuimica(fichas: readonly FichaFormulaQuimica[]): Record<CategoriaQuimica, readonly FichaFormulaQuimica[]> {
  const estadoInicial: Record<CategoriaQuimica, readonly FichaFormulaQuimica[]> = {
    'Acido': [],
    'Base': [],
    'Sal Binaria': [],
    'Oxido': [],
    'Compuesto Organico': [],
  };

  return fichas.reduce(
    (acumulado, ficha) => ({
      ...acumulado,
      [ficha.categoria]: [...acumulado[ficha.categoria], ficha],
    }),
    estadoInicial
  );
}

function calcularEstadisticasCategoria(
  categoria: CategoriaQuimica,
  fichas: readonly FichaFormulaQuimica[]
): ResumenAgrupadoCategoriaQuimica {
  const sumaPesos = fichas.reduce((acc, f) => acc + f.pesoMolecularUma, 0);
  const nombresCompuestos = fichas.map(f => `${f.nombreCompuesto} (${f.formulaEmpirica})`);

  return {
    categoria,
    totalFormulas: fichas.length,
    pesoMolecularPromedioUma: Number((sumaPesos / fichas.length).toFixed(2)),
    sumaPesosMoleculares: Number(sumaPesos.toFixed(2)),
    compuestosRegistrados: nombresCompuestos,
  };
}

function procesarValidadorFormulas(fichas: readonly FichaFormulaQuimica[]): readonly ResumenAgrupadoCategoriaQuimica[] {
  const fichasValidas = fichas.filter(validarFormulaAceptada);
  const agrupadas = agruparPorCategoriaQuimica(fichasValidas);
  const categorias = Object.keys(agrupadas) as CategoriaQuimica[];

  return categorias
    .filter(cat => agrupadas[cat].length > 0)
    .map(cat => calcularEstadisticasCategoria(cat, agrupadas[cat]))
    .sort((a, b) => b.sumaPesosMoleculares - a.sumaPesosMoleculares);
}

function imprimirReporteFormulas(titulo: string, resumen: readonly ResumenAgrupadoCategoriaQuimica[]): void {
  console.log(`=== [VALIDADOR DE FÓRMULAS QUÍMICAS] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Categoría: ${item.categoria} | Fórmulas: ${item.totalFormulas} | Promedio UMA: ${item.pesoMolecularPromedioUma} | Suma Total: ${item.sumaPesosMoleculares} UMA | Compuestos: ${item.compuestosRegistrados.join(', ')}`
    );
  });
  console.log("=================================================================================\n");
}

const reporteFormulasOficial = procesarValidadorFormulas(inventarioLaboratorioQuimico);
imprimirReporteFormulas("Resumen Agrupado por Categoría Química", reporteFormulasOficial);

// Caso: Molécula orgánica compleja de alta masa molar con múltiples átomos constituyentes
const formulaCasoMacromolecula: readonly FichaFormulaQuimica[] = [
  {
    formulaId: "CHEM-999",
    nombreCompuesto: "Sacarosa",
    formulaEmpirica: "C12H22O11",
    categoria: "Compuesto Organico",
    pesoMolecularUma: 342.30,
    elementos: [
      { simbolo: "C", cantidadAtomos: 12 },
      { simbolo: "H", cantidadAtomos: 22 },
      { simbolo: "O", cantidadAtomos: 11 }
    ],
    estadoValidacion: "EstructuraValida",
  }
];

const resultadoMacromolecula = procesarValidadorFormulas(formulaCasoMacromolecula);
imprimirReporteFormulas("Caso: Macromolécula Orgánica de Alta Masa Molar", resultadoMacromolecula);