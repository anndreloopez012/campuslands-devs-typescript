export {};

type CompuestoNeumatico = "Blando" | "Medio" | "Duro" | "Intermedio" | "Lluvia Extrema";

interface VentanaParada {
  readonly vueltaInicio: number;
  readonly vueltaFin: number;
  readonly compuestoObjetivo: CompuestoNeumatico;
}

interface EstrategiaBoxes {
  readonly piloto: string;
  readonly vueltaActual: number;
  readonly compuestoActual: CompuestoNeumatico;
  readonly perdidaDeltaPitStopSegundos: number;
  readonly ventanaRecomendada: VentanaParada;
}

interface EvaluacionParada {
  readonly piloto: string;
  readonly debePararEnEstaVuelta: boolean;
  readonly mensajeEstrategia: string;
}

function auditarEntradaBoxes(estrategia: EstrategiaBoxes): EvaluacionParada {
  const enVentana =
    estrategia.vueltaActual >= estrategia.ventanaRecomendada.vueltaInicio &&
    estrategia.vueltaActual <= estrategia.ventanaRecomendada.vueltaFin;

  if (enVentana) {
    return {
      piloto: estrategia.piloto,
      debePararEnEstaVuelta: true,
      mensajeEstrategia: `BOX BOX BOX: Colocar compuesto ${estrategia.ventanaRecomendada.compuestoObjetivo}. Delta esperado: ${estrategia.perdidaDeltaPitStopSegundos}s.`,
    };
  }

  return {
    piloto: estrategia.piloto,
    debePararEnEstaVuelta: false,
    mensajeEstrategia: `Continuar en pista. Proxima parada estimada entre vueltas ${estrategia.ventanaRecomendada.vueltaInicio} y ${estrategia.ventanaRecomendada.vueltaFin}.`,
  };
}

const estrategiaMax: EstrategiaBoxes = {
  piloto: "Max Verstappen",
  vueltaActual: 24,
  compuestoActual: "Medio",
  perdidaDeltaPitStopSegundos: 21.4,
  ventanaRecomendada: {
    vueltaInicio: 23,
    vueltaFin: 26,
    compuestoObjetivo: "Duro",
  },
};

console.log("=== ESTRATEGIA DE PIT STOP FORMULA ===");
const radioPits = auditarEntradaBoxes(estrategiaMax);
console.log(`Piloto: ${radioPits.piloto} (Vuelta ${estrategiaMax.vueltaActual})`);
console.log(`Decision de Muro: ${radioPits.debePararEnEstaVuelta ? "LLAMADO A BOXES" : "MANTENERSE EN PISTA"}`);
console.log(`Radio: "${radioPits.mensajeEstrategia}"`);