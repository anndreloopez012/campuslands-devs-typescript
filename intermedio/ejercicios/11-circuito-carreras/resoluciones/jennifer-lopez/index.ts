export {};

type CompuestoNeumatico = 'Blando' | 'Medio' | 'Duro' | 'Intermedio';
type EstadoMonoplaza = 'EnPista' | 'AbandonoMecanico' | 'Descalificado';

interface RegistroVuelta {
  readonly numeroVuelta: number;
  readonly tiempoSegundos: number;
  readonly compuestoUsado: CompuestoNeumatico;
  readonly penalizacionSegundos: number;
}

interface TelemetriaPiloto {
  readonly pilotoId: string;
  readonly nombrePiloto: string;
  readonly escuderia: string;
  readonly vueltasRegistradas: readonly RegistroVuelta[];
  readonly estadoActual: EstadoMonoplaza;
}

interface ClasificacionCarrera {
  readonly posicion: number;
  readonly piloto: string;
  readonly escuderia: string;
  readonly tiempoTotalAcumulado: number;
  readonly vueltaMasRapida: number;
  readonly ritmoPromedio: string;
}

const granPremioMonza: readonly TelemetriaPiloto[] = [
  {
    pilotoId: "CAR-111",
    nombrePiloto: "Aurelio Castellanos",
    escuderia: "Veloce Scuderia",
    vueltasRegistradas: [
      { numeroVuelta: 1, tiempoSegundos: 82.45, compuestoUsado: "Blando", penalizacionSegundos: 0 },
      { numeroVuelta: 2, tiempoSegundos: 81.12, compuestoUsado: "Blando", penalizacionSegundos: 0 },
      { numeroVuelta: 3, tiempoSegundos: 81.89, compuestoUsado: "Blando", penalizacionSegundos: 0 },
      { numeroVuelta: 4, tiempoSegundos: 83.40, compuestoUsado: "Medio", penalizacionSegundos: 0 }
    ],
    estadoActual: "EnPista",
  },
  {
    pilotoId: "CAR-112",
    nombrePiloto: "Bastian Lindqvist",
    escuderia: "Nordic Apex GP",
    vueltasRegistradas: [
      { numeroVuelta: 1, tiempoSegundos: 82.90, compuestoUsado: "Medio", penalizacionSegundos: 0 },
      { numeroVuelta: 2, tiempoSegundos: 81.75, compuestoUsado: "Medio", penalizacionSegundos: 0 },
      { numeroVuelta: 3, tiempoSegundos: 81.50, compuestoUsado: "Medio", penalizacionSegundos: 0 },
      { numeroVuelta: 4, tiempoSegundos: 81.30, compuestoUsado: "Blando", penalizacionSegundos: 0 }
    ],
    estadoActual: "EnPista",
  },
  {
    pilotoId: "CAR-113",
    nombrePiloto: "Soren Vestergaard",
    escuderia: "Baltic Racing Team",
    vueltasRegistradas: [
      { numeroVuelta: 1, tiempoSegundos: 83.10, compuestoUsado: "Duro", penalizacionSegundos: 0 },
      { numeroVuelta: 2, tiempoSegundos: 82.05, compuestoUsado: "Duro", penalizacionSegundos: 5 },
      { numeroVuelta: 3, tiempoSegundos: 81.95, compuestoUsado: "Duro", penalizacionSegundos: 0 },
      { numeroVuelta: 4, tiempoSegundos: 81.40, compuestoUsado: "Blando", penalizacionSegundos: 0 }
    ],
    estadoActual: "EnPista",
  },
  {
    pilotoId: "CAR-114",
    nombrePiloto: "Matteo Corsi",
    escuderia: "Adriatic Motorsport",
    vueltasRegistradas: [
      { numeroVuelta: 1, tiempoSegundos: 82.00, compuestoUsado: "Blando", penalizacionSegundos: 0 },
      { numeroVuelta: 2, tiempoSegundos: 81.05, compuestoUsado: "Blando", penalizacionSegundos: 0 }
    ],
    estadoActual: "AbandonoMecanico",
  }
];

function validarPilotoEnCompetencia(piloto: TelemetriaPiloto): boolean {
  return piloto.estadoActual === "EnPista" && piloto.vueltasRegistradas.length > 0;
}

function calcularTiempoTotalPiloto(vueltas: readonly RegistroVuelta[]): number {
  const total = vueltas.reduce(
    (acumulado, vuelta) => acumulado + vuelta.tiempoSegundos + vuelta.penalizacionSegundos,
    0
  );
  return Number(total.toFixed(3));
}

function obtenerVueltaRapida(vueltas: readonly RegistroVuelta[]): number {
  return vueltas.reduce(
    (mejorTiempo, vuelta) => (vuelta.tiempoSegundos < mejorTiempo ? vuelta.tiempoSegundos : mejorTiempo),
    Infinity
  );
}

function evaluarConsistenciaRitmo(tiempoTotal: number, cantidadVueltas: number): string {
  const promedio = tiempoTotal / cantidadVueltas;
  if (promedio <= 82.0) return "Ritmo de Clasificación (Élite)";
  if (promedio <= 83.5) return "Ritmo Constante de Carrera";
  return "Degradación Alta en Tanda";
}

function simularClasificacionCarrera(pilotos: readonly TelemetriaPiloto[]): readonly ClasificacionCarrera[] {
  const pilotosClasificados = pilotos
    .filter(validarPilotoEnCompetencia)
    .map(piloto => {
      const tiempoTotal = calcularTiempoTotalPiloto(piloto.vueltasRegistradas);
      const vueltaRapida = obtenerVueltaRapida(piloto.vueltasRegistradas);
      return {
        piloto: `${piloto.nombrePiloto} [${piloto.pilotoId}]`,
        escuderia: piloto.escuderia,
        tiempoTotalAcumulado: tiempoTotal,
        vueltaMasRapida: vueltaRapida,
        ritmoPromedio: evaluarConsistenciaRitmo(tiempoTotal, piloto.vueltasRegistradas.length),
      };
    })
    .sort((a, b) => a.tiempoTotalAcumulado - b.tiempoTotalAcumulado);

  return pilotosClasificados.map((registro, indice) => ({
    posicion: indice + 1,
    ...registro,
  }));
}

function imprimirTablaPosiciones(titulo: string, clasificacion: readonly ClasificacionCarrera[]): void {
  console.log(`=== [SIMULADOR DE CARRERA POR VUELTAS] ${titulo} ===`);
  clasificacion.forEach(item => {
    console.log(
      `P${item.posicion}. ${item.piloto} (${item.escuderia}) | Tiempo Total: ${item.tiempoTotalAcumulado}s | Vuelta Rápida: ${item.vueltaMasRapida}s | Análisis: ${item.ritmoPromedio}`
    );
  });
  console.log("======================================================================\n");
}

const clasificacionOficial = simularClasificacionCarrera(granPremioMonza);
imprimirTablaPosiciones("Resultados Oficiales Gran Premio", clasificacionOficial);

// Caso: Piloto con múltiples penalizaciones por límites de pista que alteran el podio
const simulacionCasoPenalizaciones: readonly TelemetriaPiloto[] = [
  {
    pilotoId: "CAR-998",
    nombrePiloto: "Gael Aramburu",
    escuderia: "Iberia Track GP",
    vueltasRegistradas: [
      { numeroVuelta: 1, tiempoSegundos: 80.50, compuestoUsado: "Blando", penalizacionSegundos: 10 },
      { numeroVuelta: 2, tiempoSegundos: 80.20, compuestoUsado: "Blando", penalizacionSegundos: 5 },
      { numeroVuelta: 3, tiempoSegundos: 80.10, compuestoUsado: "Blando", penalizacionSegundos: 5 }
    ],
    estadoActual: "EnPista",
  },
  {
    pilotoId: "CAR-999",
    nombrePiloto: "Tazio Moretti",
    escuderia: "Veloce Scuderia",
    vueltasRegistradas: [
      { numeroVuelta: 1, tiempoSegundos: 83.00, compuestoUsado: "Duro", penalizacionSegundos: 0 },
      { numeroVuelta: 2, tiempoSegundos: 82.80, compuestoUsado: "Duro", penalizacionSegundos: 0 },
      { numeroVuelta: 3, tiempoSegundos: 82.90, compuestoUsado: "Duro", penalizacionSegundos: 0 }
    ],
    estadoActual: "EnPista",
  }
];

const resultadoPenalizaciones = simularClasificacionCarrera(simulacionCasoPenalizaciones);
imprimirTablaPosiciones("Caso: Impacto de Penalizaciones en Podio", resultadoPenalizaciones);