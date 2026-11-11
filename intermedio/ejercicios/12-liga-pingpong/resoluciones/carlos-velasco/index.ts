export {};

// tipos
interface Encuentro {
  readonly local: string;
  readonly visitante: string;
  setsLocal: number;
  setsVisitante: number;
}

interface EstadisticaJugador {
  readonly jugador: string;
  encuentros: number;
  victorias: number;
  setsGanados: number;
  setsPerdidos: number;
}

// datos
const encuentros: Encuentro[] = [
  { local: 'Velas', visitante: 'Rivas', setsLocal: 3, setsVisitante: 1 },
  { local: 'Rivas', visitante: 'Mena', setsLocal: 2, setsVisitante: 3 },
  { local: 'Mena', visitante: 'Velas', setsLocal: 0, setsVisitante: 3 },
  { local: 'Rivas', visitante: 'Velas', setsLocal: 4, setsVisitante: 2 },
];

// reglas
const setsMinimos = 0;

// validacion
function validarEncuentro(encuentro: Encuentro): boolean {
  return (
    encuentro.setsLocal >= setsMinimos &&
    encuentro.setsVisitante >= setsMinimos &&
    encuentro.local !== encuentro.visitante
  );
}

// calculos
function iniciarEstadisticas(encuentros: Encuentro[]): EstadisticaJugador[] {
  const nombres = new Set<string>();
  encuentros.forEach((encuentro) => {
    nombres.add(encuentro.local);
    nombres.add(encuentro.visitante);
  });

  return [...nombres].map((jugador) => ({ jugador, encuentros: 0, victorias: 0, setsGanados: 0, setsPerdidos: 0 }));
}

function actualizarEstadisticas(estadisticas: EstadisticaJugador[], encuentro: Encuentro): void {
  if (!validarEncuentro(encuentro)) return;

  const local = estadisticas.find((estadistica) => estadistica.jugador === encuentro.local);
  const visitante = estadisticas.find((estadistica) => estadistica.jugador === encuentro.visitante);
  if (!local || !visitante) return;

  local.encuentros += 1;
  visitante.encuentros += 1;
  local.setsGanados += encuentro.setsLocal;
  local.setsPerdidos += encuentro.setsVisitante;
  visitante.setsGanados += encuentro.setsVisitante;
  visitante.setsPerdidos += encuentro.setsLocal;

  if (encuentro.setsLocal > encuentro.setsVisitante) local.victorias += 1;
  if (encuentro.setsVisitante > encuentro.setsLocal) visitante.victorias += 1;
}

function construirTabla(encuentros: Encuentro[]): EstadisticaJugador[] {
  const estadisticas = iniciarEstadisticas(encuentros);
  encuentros.forEach((encuentro) => actualizarEstadisticas(estadisticas, encuentro));
  return estadisticas.sort((a, b) => b.victorias - a.victorias || b.setsGanados - a.setsGanados);
}

// salida
function mostrarResumen(encuentros: Encuentro[]): void {
  console.log('=== Liga de pingpong ===');
  console.log('Tabla de la liga:');
  construirTabla(encuentros).forEach((estadistica, indice) => {
    console.log(`${indice + 1}. ${estadistica.jugador} | V: ${estadistica.victorias} | Sets: ${estadistica.setsGanados}-${estadistica.setsPerdidos}`);
  });
}

mostrarResumen(encuentros);
