export {};

type CategoriaPesoKickboxing = 'Mosca (57kg)' | 'Ligero (70kg)' | 'Welter (79kg)' | 'Medio (85kg)' | 'Pesado (95kg+)' ;
type EstadoPeleaBracket = 'Programada' | 'EnCurso' | 'FinalizadaKO' | 'FinalizadaDecision' | 'Descalificado';

interface FichaPeleadorBracket {
  readonly peleadorId: string;
  readonly nombrePeleador: string;
  readonly categoriaPeso: CategoriaPesoKickboxing;
  readonly peleasGanadas: number;
  readonly nocautsPropios: number;
  readonly pesoActualKg: number;
}

interface FichaCombateBracket {
  readonly combateId: string;
  readonly categoria: CategoriaPesoKickboxing;
  readonly peleadorAzul: FichaPeleadorBracket;
  readonly peleadorRojo: FichaPeleadorBracket;
  readonly puntajeJuecesAzul: number;
  readonly puntajeJuecesRojo: number;
  estado: EstadoPeleaBracket;
}

interface ResumenResultadoBracket {
  readonly identificadorCombate: string;
  readonly categoria: CategoriaPesoKickboxing;
  readonly esquinaGanadora: string;
  readonly metodoVictoria: string;
  readonly puntajeFinal: string;
}

const bracketCampeonatoGlobal: readonly FichaCombateBracket[] = [
  {
    combateId: "KB-101",
    categoria: "Ligero (70kg)",
    peleadorAzul: {
      peleadorId: "PL-01",
      nombrePeleador: "Tazio Moretti",
      categoriaPeso: "Ligero (70kg)",
      peleasGanadas: 14,
      nocautsPropios: 8,
      pesoActualKg: 69.8,
    },
    peleadorRojo: {
      peleadorId: "PL-02",
      nombrePeleador: "Kaelen Vestergaard",
      categoriaPeso: "Ligero (70kg)",
      peleasGanadas: 16,
      nocautsPropios: 10,
      pesoActualKg: 70.0,
    },
    puntajeJuecesAzul: 28,
    puntajeJuecesRojo: 29,
    estado: "FinalizadaDecision",
  },
  {
    combateId: "KB-102",
    categoria: "Welter (79kg)",
    peleadorAzul: {
      peleadorId: "PL-03",
      nombrePeleador: "Soren Lindqvist",
      categoriaPeso: "Welter (79kg)",
      peleasGanadas: 19,
      nocautsPropios: 12,
      pesoActualKg: 78.5,
    },
    peleadorRojo: {
      peleadorId: "PL-04",
      nombrePeleador: "Aether Vance",
      categoriaPeso: "Welter (79kg)",
      peleasGanadas: 12,
      nocautsPropios: 9,
      pesoActualKg: 79.2,
    },
    puntajeJuecesAzul: 10,
    puntajeJuecesRojo: 7,
    estado: "FinalizadaKO",
  },
  {
    combateId: "KB-103",
    categoria: "Medio (85kg)",
    peleadorAzul: {
      peleadorId: "PL-05",
      nombrePeleador: "Gaelen Thorne",
      categoriaPeso: "Medio (85kg)",
      peleasGanadas: 22,
      nocautsPropios: 15,
      pesoActualKg: 84.9,
    },
    peleadorRojo: {
      peleadorId: "PL-06",
      nombrePeleador: "Marisol Hincapié",
      categoriaPeso: "Medio (85kg)",
      peleasGanadas: 11,
      nocautsPropios: 4,
      pesoActualKg: 85.0,
    },
    puntajeJuecesAzul: 30,
    puntajeJuecesRojo: 27,
    estado: "FinalizadaDecision",
  },
  {
    combateId: "KB-104",
    categoria: "Pesado (95kg+)",
    peleadorAzul: {
      peleadorId: "PL-07",
      nombrePeleador: "Dante Alighieri",
      categoriaPeso: "Pesado (95kg+)",
      peleasGanadas: 25,
      nocautsPropios: 20,
      pesoActualKg: 104.5,
    },
    peleadorRojo: {
      peleadorId: "PL-08",
      nombrePeleador: "Bastian Lindqvist",
      categoriaPeso: "Pesado (95kg+)",
      peleasGanadas: 18,
      nocautsPropios: 14,
      pesoActualKg: 98.2,
    },
    puntajeJuecesAzul: 0,
    puntajeJuecesRojo: 0,
    estado: "Programada",
  }
];

function validarCombateBracketActivo(combate: FichaCombateBracket): boolean {
  return combate.estado !== "Programada" && combate.estado !== "Descalificado";
}

function determinarGanadorCombate(combate: FichaCombateBracket): { ganador: string; metodo: string; puntaje: string } {
  if (combate.estado === "FinalizadaKO") {
    const esAzulGanador = combate.puntajeJuecesAzul > combate.puntajeJuecesRojo;
    const nombreGanador = esAzulGanador ? combate.peleadorAzul.nombrePeleador : combate.peleadorRojo.nombrePeleador;
    const esquina = esAzulGanador ? "Esquina Azul" : "Esquina Roja";
    return {
      ganador: `${nombreGanador} (${esquina})`,
      metodo: "Nocaut Técnico / KO",
      puntaje: "Finalización por Asalto",
    };
  }

  const esAzulDecision = combate.puntajeJuecesAzul >= combate.puntajeJuecesRojo;
  const nombreGanadorDecision = esAzulDecision ? combate.peleadorAzul.nombrePeleador : combate.peleadorRojo.nombrePeleador;
  const esquinaDecision = esAzulDecision ? "Esquina Azul" : "Esquina Roja";
  return {
    ganador: `${nombreGanadorDecision} (${esquinaDecision})`,
    metodo: "Decisión Unánime de Jueces",
    puntaje: `${combate.puntajeJuecesAzul} - ${combate.puntajeJuecesRojo}`,
  };
}

function procesarBracketKickboxing(combates: readonly FichaCombateBracket[]): readonly ResumenResultadoBracket[] {
  return combates
    .filter(validarCombateBracketActivo)
    .map(combate => {
      const resultado = determinarGanadorCombate(combate);
      return {
        identificadorCombate: combate.combateId,
        categoria: combate.categoria,
        esquinaGanadora: resultado.ganador,
        metodoVictoria: resultado.metodo,
        puntajeFinal: resultado.puntaje,
      };
    })
    .sort((a, b) => a.identificadorCombate.localeCompare(b.identificadorCombate));
}

function imprimirReporteBracket(titulo: string, resumen: readonly ResumenResultadoBracket[]): void {
  console.log(`=== [BRACKET DE KICKBOXING] ${titulo} ===`);
  resumen.forEach((item, indice) => {
    console.log(
      `${indice + 1}. [${item.identificadorCombate}] ${item.categoria} | Ganador: ${item.esquinaGanadora} | Método: ${item.metodoVictoria} | Puntuación: ${item.puntajeFinal}`
    );
  });
  console.log("=================================================================================\n");
}

const resultadoBracketOficial = procesarBracketKickboxing(bracketCampeonatoGlobal);
imprimirReporteBracket("Resultados Oficiales del Torneo de Combates", resultadoBracketOficial);

// Caso: Pelea de campeonato mundial con desenlace por nocaut fulminante en el primer asalto
const combateCasoLimite: readonly FichaCombateBracket[] = [
  {
    combateId: "KB-9999",
    categoria: "Welter (79kg)",
    peleadorAzul: {
      peleadorId: "PL-99",
      nombrePeleador: "Aether Vance",
      categoriaPeso: "Welter (79kg)",
      peleasGanadas: 30,
      nocautsPropios: 26,
      pesoActualKg: 78.9,
    },
    peleadorRojo: {
      peleadorId: "PL-98",
      nombrePeleador: "Kaelen Vestergaard",
      categoriaPeso: "Welter (79kg)",
      peleasGanadas: 28,
      nocautsPropios: 22,
      pesoActualKg: 79.0,
    },
    puntajeJuecesAzul: 10,
    puntajeJuecesRojo: 2,
    estado: "FinalizadaKO",
  }
];

const resultadoLimite = procesarBracketKickboxing(combateCasoLimite);
imprimirReporteBracket("Caso: Pelea Estelar de Campeonato con Nocaut Relámpago", resultadoLimite);