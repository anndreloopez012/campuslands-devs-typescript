export {};

type BloqueConcierto = 'Apertura' | 'Acto Principal' | 'Acustico' | 'Encore' | 'Cierre';
type EstadoPistaSetlist = 'Confirmada' | 'EnsayoPendiente' | 'Opcional' | 'Descartada';

interface FichaCancionSetlist {
  readonly pistaId: string;
  readonly tituloCancion: string;
  readonly albumOrigen: string;
  readonly bloque: BloqueConcierto;
  readonly duracionSegundos: number;
  readonly tempoBpm: number;
  readonly tonalidad: string;
  estado: EstadoPistaSetlist;
}

interface ResumenSetlistConcierto {
  readonly ordenEjecucion: number;
  readonly identificador: string;
  readonly cancion: string;
  readonly bloque: BloqueConcierto;
  readonly duracionFormateada: string;
  readonly energiaEscenario: string;
}

const setlistGiraEstadiosGlobal: readonly FichaCancionSetlist[] = [
  {
    pistaId: "SET-101",
    tituloCancion: "Horizonte de Neón",
    albumOrigen: "Crónicas Eléctricas",
    bloque: "Apertura",
    duracionSegundos: 245,
    tempoBpm: 138,
    tonalidad: "Mi Menor",
    estado: "Confirmada",
  },
  {
    pistaId: "SET-102",
    tituloCancion: "Latidos en la Arena",
    albumOrigen: "Frecuencia Nocturna",
    bloque: "Acto Principal",
    duracionSegundos: 218,
    tempoBpm: 126,
    tonalidad: "La Mayor",
    estado: "Confirmada",
  },
  {
    pistaId: "SET-103",
    tituloCancion: "Cuerdas al Amanecer",
    albumOrigen: "Sesiones Desconectadas",
    bloque: "Acustico",
    duracionSegundos: 290,
    tempoBpm: 84,
    tonalidad: "Do Mayor",
    estado: "Confirmada",
  },
  {
    pistaId: "SET-104",
    tituloCancion: "Tormenta Estelar",
    albumOrigen: "Crónicas Eléctricas",
    bloque: "Encore",
    duracionSegundos: 312,
    tempoBpm: 148,
    tonalidad: "Re Menor",
    estado: "EnsayoPendiente",
  },
  {
    pistaId: "SET-105",
    tituloCancion: "Eco Infinito",
    albumOrigen: "Frecuencia Nocturna",
    bloque: "Cierre",
    duracionSegundos: 274,
    tempoBpm: 132,
    tonalidad: "Sol Mayor",
    estado: "Confirmada",
  },
  {
    pistaId: "SET-106",
    tituloCancion: "Interludio Sintético",
    albumOrigen: "Lados B",
    bloque: "Acto Principal",
    duracionSegundos: 140,
    tempoBpm: 110,
    tonalidad: "Fa Sostenido Menor",
    estado: "Descartada",
  }
];

function validarPistaActivaSetlist(pista: FichaCancionSetlist): boolean {
  return pista.estado !== "Descartada" && pista.duracionSegundos > 0 && pista.tempoBpm > 0;
}

function formatearDuracionMinutosSegundos(segundosTotales: number): string {
  const minutos = Math.floor(segundosTotales / 60);
  const segundosRestantes = segundosTotales % 60;
  const segundosTexto = segundosRestantes < 10 ? `0${segundosRestantes}` : `${segundosRestantes}`;
  return `${minutos}:${segundosTexto} min`;
}

function clasificarEnergiaEscenario(bpm: number, bloque: BloqueConcierto): string {
  if (bloque === "Acustico") return "Atmósfera Íntima";
  if (bpm >= 140) return "Explosión Pirotécnica Máxima";
  if (bpm >= 120) return "Alta Intensidad de Estadio";
  return "Ritmo Moderado Envolvente";
}

function calcularDuracionTotalSetlist(pistas: readonly FichaCancionSetlist[]): string {
  const totalSegundos = pistas
    .filter(validarPistaActivaSetlist)
    .reduce((acumulado, pista) => acumulado + pista.duracionSegundos, 0);
  return formatearDuracionMinutosSegundos(totalSegundos);
}

function procesarSetlistConcierto(pistas: readonly FichaCancionSetlist[]): readonly ResumenSetlistConcierto[] {
  const prioridadBloque: Record<BloqueConcierto, number> = {
    'Apertura': 1,
    'Acto Principal': 2,
    'Acustico': 3,
    'Encore': 4,
    'Cierre': 5,
  };

  return pistas
    .filter(validarPistaActivaSetlist)
    .slice()
    .sort((a, b) => prioridadBloque[a.bloque] - prioridadBloque[b.bloque])
    .map((pista, indice) => ({
      ordenEjecucion: indice + 1,
      identificador: pista.pistaId,
      cancion: `${pista.tituloCancion} [${pista.albumOrigen}]`,
      bloque: pista.bloque,
      duracionFormateada: formatearDuracionMinutosSegundos(pista.duracionSegundos),
      energiaEscenario: clasificarEnergiaEscenario(pista.tempoBpm, pista.bloque),
    }));
}

function imprimirReporteSetlist(
  titulo: string,
  resumen: readonly ResumenSetlistConcierto[],
  duracionTotal: string
): void {
  console.log(`=== [SETLIST DE CONCIERTO] ${titulo} ===`);
  resumen.forEach((item) => {
    console.log(
      `${item.ordenEjecucion}. [${item.identificador}] ${item.cancion} | Bloque: ${item.bloque} | Duración: ${item.duracionFormateada} | Energía: ${item.energiaEscenario}`
    );
  });
  console.log(`Duración Total Estimada del Show: ${duracionTotal}`);
  console.log("=================================================================================\n");
}

const resultadoSetlistOficial = procesarSetlistConcierto(setlistGiraEstadiosGlobal);
const duracionShowOficial = calcularDuracionTotalSetlist(setlistGiraEstadiosGlobal);
imprimirReporteSetlist("Programa Oficial de Gira Mundial", resultadoSetlistOficial, duracionShowOficial);

// Caso: Medley sinfónico extendido de cierre de festival con duración épica superior a 14 minutos
const pistaCasoLimite: readonly FichaCancionSetlist[] = [
  {
    pistaId: "SET-9999",
    tituloCancion: "Sinfonía Final del Festival (Medley Extendido)",
    albumOrigen: "Edición Especial en Vivo",
    bloque: "Cierre",
    duracionSegundos: 875,
    tempoBpm: 152,
    tonalidad: "Do Menor",
    estado: "Confirmada",
  }
];

const resultadoLimite = procesarSetlistConcierto(pistaCasoLimite);
const duracionLimite = calcularDuracionTotalSetlist(pistaCasoLimite);
imprimirReporteSetlist("Caso: Medley Extendido de Cierre de Festival", resultadoLimite, duracionLimite);