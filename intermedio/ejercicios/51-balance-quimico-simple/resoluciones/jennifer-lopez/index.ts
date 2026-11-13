export {};

type TipoReaccion = 'Combustion' | 'Sintesis' | 'Descomposicion' | 'Neutralizacion' | 'Oxidacion';
type EstadoMateria = 'Gas' | 'Acuoso' | 'Solido' | 'Liquido';
type NivelBalance = 'Perfecto' | 'Desbalanceado' | 'Critico';

interface ElementoComponente {
  readonly simbolo: string;
  readonly cantidadAtomosReactivo: number;
  readonly cantidadAtomosProducto: number;
}

interface EcuacionQuimica {
  readonly reaccionId: string;
  readonly nombreReaccion: string;
  readonly tipo: TipoReaccion;
  readonly formulaReactivos: string;
  readonly formulaProductos: string;
  readonly estadoMateria: EstadoMateria;
  readonly elementos: readonly ElementoComponente[];
}

interface ReporteBalanceQuimico {
  readonly reaccion: string;
  readonly tipoReaccion: TipoReaccion;
  readonly totalElementosValidados: number;
  readonly desviacionTotal: number;
  readonly estadoBalance: NivelBalance;
}

const registroReaccionesQuimicas: readonly EcuacionQuimica[] = [
  {
    reaccionId: "CHEM-5101",
    nombreReaccion: "Combustion del Metano",
    tipo: "Combustion",
    formulaReactivos: "CH4 + 2O2",
    formulaProductos: "CO2 + 2H2O",
    estadoMateria: "Gas",
    elementos: [
      { simbolo: "C", cantidadAtomosReactivo: 1, cantidadAtomosProducto: 1 },
      { simbolo: "H", cantidadAtomosReactivo: 4, cantidadAtomosProducto: 4 },
      { simbolo: "O", cantidadAtomosReactivo: 4, cantidadAtomosProducto: 4 }
    ]
  },
  {
    reaccionId: "CHEM-5102",
    nombreReaccion: "Sintesis de Agua",
    tipo: "Sintesis",
    formulaReactivos: "2H2 + O2",
    formulaProductos: "2H2O",
    estadoMateria: "Liquido",
    elementos: [
      { simbolo: "H", cantidadAtomosReactivo: 4, cantidadAtomosProducto: 4 },
      { simbolo: "O", cantidadAtomosReactivo: 2, cantidadAtomosProducto: 2 }
    ]
  },
  {
    reaccionId: "CHEM-5103",
    nombreReaccion: "Neutralizacion de Acido Clorhidrico",
    tipo: "Neutralizacion",
    formulaReactivos: "HCl + NaOH",
    formulaProductos: "NaCl + H2O",
    estadoMateria: "Acuoso",
    elementos: [
      { simbolo: "H", cantidadAtomosReactivo: 2, cantidadAtomosProducto: 2 },
      { simbolo: "Cl", cantidadAtomosReactivo: 1, cantidadAtomosProducto: 1 },
      { simbolo: "Na", cantidadAtomosReactivo: 1, cantidadAtomosProducto: 1 },
      { simbolo: "O", cantidadAtomosReactivo: 1, cantidadAtomosProducto: 1 }
    ]
  },
  {
    reaccionId: "CHEM-5104",
    nombreReaccion: "Descomposicion del Peroxido de Hidrogeno",
    tipo: "Descomposicion",
    formulaReactivos: "2H2O2",
    formulaProductos: "2H2O + O2",
    estadoMateria: "Acuoso",
    elementos: [
      { simbolo: "H", cantidadAtomosReactivo: 4, cantidadAtomosProducto: 4 },
      { simbolo: "O", cantidadAtomosReactivo: 4, cantidadAtomosProducto: 4 }
    ]
  }
];

class SimuladorBalanceQuimico<T extends EcuacionQuimica> {
  private readonly ecuaciones: readonly T[];

  constructor(ecuaciones: readonly T[]) {
    this.ecuaciones = ecuaciones;
  }

  public async validarEcuacionAsync(ecuacion: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!ecuacion.reaccionId || ecuacion.elementos.length === 0) {
          reject(new Error(`Ecuación química inválida: ${ecuacion.nombreReaccion}`));
        } else {
          resolve(true);
        }
      }, 15);
    });
  }

  public calcularDesviacion(elementos: readonly ElementoComponente[]): number {
    return elementos.reduce((acc, elem) => {
      const diferencia = Math.abs(elem.cantidadAtomosReactivo - elem.cantidadAtomosProducto);
      return acc + diferencia;
    }, 0);
  }

  public async procesarAnalisisBalancesAsync(): Promise<readonly ReporteBalanceQuimico[]> {
    const reportes: ReporteBalanceQuimico[] = [];

    for (const ec of this.ecuaciones) {
      try {
        await this.validarEcuacionAsync(ec);
        const desviacion = this.calcularDesviacion(ec.elementos);

        let nivel: NivelBalance = 'Perfecto';
        if (desviacion > 3) {
          nivel = 'Critico';
        } else if (desviacion > 0) {
          nivel = 'Desbalanceado';
        }

        reportes.push({
          reaccion: `${ec.nombreReaccion} [${ec.reaccionId}]`,
          tipoReaccion: ec.tipo,
          totalElementosValidados: ec.elementos.length,
          desviacionTotal: desviacion,
          estadoBalance: nivel,
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[Error Asíncrono]: ${error.message}`);
        }
      }
    }

    return reportes.sort((a, b) => a.desviacionTotal - b.desviacionTotal);
  }
}

function imprimirReporteBalances(titulo: string, reportes: readonly ReporteBalanceQuimico[]): void {
  console.log(`=== [BALANCE QUIMICO SIMPLE - FORMULAS QUIMICAS] ${titulo} ===`);
  reportes.forEach((item, indice) => {
    console.log(
      `${indice + 1}. Reacción: ${item.reaccion} | Tipo: ${item.tipoReaccion} | Elementos: ${item.totalElementosValidados} | Desviación: ${item.desviacionTotal} | Estado: ${item.estadoBalance}`
    );
  });
  console.log("========================================================================================================================\n");
}

async function ejecutarSimulacionPrincipal(): Promise<void> {
  const simuladorOficial = new SimuladorBalanceQuimico(registroReaccionesQuimicas);
  const reporteOficial = await simuladorOficial.procesarAnalisisBalancesAsync();
  imprimirReporteBalances("Control Oficial de Balance Estequiométrico", reporteOficial);

  // caso: Ecuacion quimica con desajuste severo en atomos y violacion de conservacion de masa
  const ecuacionCasoLimite: readonly EcuacionQuimica[] = [
    {
      reaccionId: "CHEM-9999",
      nombreReaccion: "Desajuste Estequiometrico Extremo",
      tipo: "Oxidacion",
      formulaReactivos: "Fe + O2",
      formulaProductos: "Fe2O3",
      estadoMateria: "Solido",
      elementos: [
        { simbolo: "Fe", cantidadAtomosReactivo: 1, cantidadAtomosProducto: 2 },
        { simbolo: "O", cantidadAtomosReactivo: 2, cantidadAtomosProducto: 3 }
      ]
    }
  ];

  const simuladorLimite = new SimuladorBalanceQuimico(ecuacionCasoLimite);
  const reporteLimite = await simuladorLimite.procesarAnalisisBalancesAsync();
  imprimirReporteBalances("caso: Ecuacion quimica con desajuste severo en atomos y violacion de conservacion de masa", reporteLimite);
}

ejecutarSimulacionPrincipal();