export {};

type DivisionPeso = 'Peso Pluma' | 'Peso Ligero' | 'Peso Welter' | 'Peso Pesado';
type ResolucionCombate = 'Decision Unanime' | 'KO Tecnico' | 'Nocaut' | 'Descalificacion';

interface TarjetaAsalto {
  readonly numeroAsalto: number;
  readonly puntosEsquinaRoja: number;
  readonly puntosEsquinaAzul: number;
  readonly caidasEsquinaRoja: number;
  readonly caidasEsquinaAzul: number;
}

interface CombateKickboxing {
  readonly peleaId: string;
  readonly division: DivisionPeso;
  readonly peleadorRojo: string;
  readonly peleadorAzul: string;
  readonly asaltos: readonly TarjetaAsalto[];
  readonly resolucion: ResolucionCombate;
  readonly combateValido: boolean;
}

interface VeredictoMarcador {
  readonly encuentro: string;
  readonly division: DivisionPeso;
  readonly marcadorGlobal: string;
  readonly ganadorOficial: string;
  readonly metodoVictoria: ResolucionCombate;
  readonly indiceIntensidad: number;
}

const carteleraNocheDeCampeones: readonly CombateKickboxing[] = [
  {
    peleaId: "KBX-101",
    division: "Peso Welter",
    peleadorRojo: "Rico Verhoeven",
    peleadorAzul: "Badr Hari",
    asaltos: [
      { numeroAsalto: 1, puntosEsquinaRoja: 10, puntosEsquinaAzul: 9, caidasEsquinaRoja: 0, caidasEsquinaAzul: 0 },
      { numeroAsalto: 2, puntosEsquinaRoja: 9, puntosEsquinaAzul: 10, caidasEsquinaRoja: 0, caidasEsquinaAzul: 0 },
      { numeroAsalto: 3, puntosEsquinaRoja: 10, puntosEsquinaAzul: 8, caidasEsquinaRoja: 0, caidasEsquinaAzul: 1 }
    ],
    resolucion: "Decision Unanime",
    combateValido: true,
  },
  {
    peleaId: "KBX-102",
    division: "Peso Ligero",
    peleadorRojo: "Takeru Segawa",
    peleadorAzul: "Superlek Kiatmuu9",
    asaltos: [
      { numeroAsalto: 1, puntosEsquinaRoja: 9, puntosEsquinaAzul: 10, caidasEsquinaRoja: 0, caidasEsquinaAzul: 0 },
      { numeroAsalto: 2, puntosEsquinaRoja: 9, puntosEsquinaAzul: 10, caidasEsquinaRoja: 0, caidasEsquinaAzul: 0 },
      { numeroAsalto: 3, puntosEsquinaRoja: 10, puntosEsquinaAzul: 9, caidasEsquinaRoja: 0, caidasEsquinaAzul: 0 }
    ],
    resolucion: "Decision Unanime",
    combateValido: true,
  },
  {
    peleaId: "KBX-103",
    division: "Peso Pesado",
    peleadorRojo: "Levi Rigters",
    peleadorAzul: "Tariq Osaro",
    asaltos: [
      { numeroAsalto: 1, puntosEsquinaRoja: 10, puntosEsquinaAzul: 8, caidasEsquinaRoja: 0, caidasEsquinaAzul: 1 },
      { numeroAsalto: 2, puntosEsquinaRoja: 10, puntosEsquinaAzul: 7, caidasEsquinaRoja: 0, caidasEsquinaAzul: 2 }
    ],
    resolucion: "KO Tecnico",
    combateValido: true,
  },
  {
    peleaId: "KBX-104",
    division: "Peso Pluma",
    peleadorRojo: "Chingiz Allazov",
    peleadorAzul: "Marat Grigorian",
    asaltos: [],
    resolucion: "Descalificacion",
    combateValido: false,
  }
];

function validarCombateOficial(combate: CombateKickboxing): boolean {
  return combate.combateValido && combate.asaltos.length > 0;
}

function calcularTotalesTarjeta(asaltos: readonly TarjetaAsalto[]): { readonly totalRojo: number; readonly totalAzul: number; readonly totalCaidas: number } {
  return asaltos.reduce(
    (acumulado, asalto) => ({
      totalRojo: acumulado.totalRojo + asalto.puntosEsquinaRoja,
      totalAzul: acumulado.totalAzul + asalto.puntosEsquinaAzul,
      totalCaidas: acumulado.totalCaidas + asalto.caidasEsquinaRoja + asalto.caidasEsquinaAzul,
    }),
    { totalRojo: 0, totalAzul: 0, totalCaidas: 0 }
  );
}

function calcularIndiceIntensidad(asaltos: readonly TarjetaAsalto[], caidas: number, resolucion: ResolucionCombate): number {
  const bonoFinalizacion = resolucion === "Nocaut" || resolucion === "KO Tecnico" ? 35 : 10;
  return asaltos.length * 15 + caidas * 20 + bonoFinalizacion;
}

function determinarGanadorCombate(combate: CombateKickboxing, totalRojo: number, totalAzul: number): string {
  if (totalRojo > totalAzul) return combate.peleadorRojo;
  if (totalAzul > totalRojo) return combate.peleadorAzul;
  return "Empate Tecnico (Asalto Extra)";
}

function procesarMarcadorKickboxing(combates: readonly CombateKickboxing[]): readonly VeredictoMarcador[] {
  return combates
    .filter(validarCombateOficial)
    .map(combate => {
      const totales = calcularTotalesTarjeta(combate.asaltos);
      const intensidad = calcularIndiceIntensidad(combate.asaltos, totales.totalCaidas, combate.resolucion);
      return {
        encuentro: `${combate.peleadorRojo} vs ${combate.peleadorAzul} [${combate.peleaId}]`,
        division: combate.division,
        marcadorGlobal: `${totales.totalRojo} - ${totales.totalAzul}`,
        ganadorOficial: determinarGanadorCombate(combate, totales.totalRojo, totales.totalAzul),
        metodoVictoria: combate.resolucion,
        indiceIntensidad: intensidad,
      };
    })
    .sort((a, b) => b.indiceIntensidad - a.indiceIntensidad);
}

function imprimirResultadosVelada(titulo: string, veredictos: readonly VeredictoMarcador[]): void {
  console.log(`=== [MARCADOR OFICIAL KICKBOXING] ${titulo} ===`);
  veredictos.forEach((item, indice) => {
    console.log(
      `${indice + 1}. ${item.encuentro} (${item.division}) | Tarjeta: ${item.marcadorGlobal} | Ganador: ${item.ganadorOficial} (${item.metodoVictoria}) | Intensidad: ${item.indiceIntensidad}`
    );
  });
  console.log("===================================================================\n");
}

const resultadosVeladaPrincipal = procesarMarcadorKickboxing(carteleraNocheDeCampeones);
imprimirResultadosVelada("Resultados Oficiales de la Cartelera", resultadosVeladaPrincipal);

// Caso: Combate de campeonato a cinco asaltos con empate exacto en las tarjetas
const combateCasoEmpate: readonly CombateKickboxing[] = [
  {
    peleaId: "KBX-999",
    division: "Peso Welter",
    peleadorRojo: "Cedric Doumbe",
    peleadorAzul: "Nieky Holzken",
    asaltos: [
      { numeroAsalto: 1, puntosEsquinaRoja: 10, puntosEsquinaAzul: 9, caidasEsquinaRoja: 0, caidasEsquinaAzul: 0 },
      { numeroAsalto: 2, puntosEsquinaRoja: 9, puntosEsquinaAzul: 10, caidasEsquinaRoja: 0, caidasEsquinaAzul: 0 },
      { numeroAsalto: 3, puntosEsquinaRoja: 10, puntosEsquinaAzul: 10, caidasEsquinaRoja: 0, caidasEsquinaAzul: 0 },
      { numeroAsalto: 4, puntosEsquinaRoja: 8, puntosEsquinaAzul: 10, caidasEsquinaRoja: 1, caidasEsquinaAzul: 0 },
      { numeroAsalto: 5, puntosEsquinaRoja: 10, puntosEsquinaAzul: 8, caidasEsquinaRoja: 0, caidasEsquinaAzul: 1 }
    ],
    resolucion: "Decision Unanime",
    combateValido: true,
  }
];

const resultadoEmpate = procesarMarcadorKickboxing(combateCasoEmpate);
imprimirResultadosVelada("Caso: Empate en Tarjetas de Campeonato", resultadoEmpate);
