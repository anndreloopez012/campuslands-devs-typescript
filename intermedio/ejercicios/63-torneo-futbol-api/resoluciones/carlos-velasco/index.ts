export {};

// tipos
type EstadoTorneo =
  | { tipo: 'inscripcion' }
  | { tipo: 'en_juego'; fechaActual: number }
  | { tipo: 'finalizado'; campeon: string };

type EventoTorneo =
  | { tipo: 'iniciar' }
  | { tipo: 'resultado'; local: string; visitante: string; golesLocal: number; golesVisitante: number }
  | { tipo: 'cerrar' };

interface Partida {
  readonly local: string;
  readonly visitante: string;
  golesLocal: number;
  golesVisitante: number;
  disputado: boolean;
}

// state machine
function reducirTorneo(estado: EstadoTorneo, evento: EventoTorneo, partidas: Partida[]): EstadoTorneo {
  switch (evento.tipo) {
    case 'iniciar':
      return estado.tipo === 'inscripcion' ? { tipo: 'en_juego', fechaActual: 1 } : estado;

    case 'resultado': {
      if (estado.tipo !== 'en_juego') return estado;
      return { ...estado, fechaActual: estado.fechaActual + 1 };
    }

    case 'cerrar': {
      if (estado.tipo !== 'en_juego') return estado;
      return { tipo: 'finalizado', campeon: calcularCampeon(partidas) };
    }
  }
}

// calculos
function aplicarResultado(partidas: Partida[], evento: Extract<EventoTorneo, { tipo: 'resultado' }>): void {
  const partida = partidas.find((item) => item.local === evento.local && item.visitante === evento.visitante && !item.disputado);
  if (!partida) return;
  partida.golesLocal = evento.golesLocal;
  partida.golesVisitante = evento.golesVisitante;
  partida.disputado = true;
}

function calcularCampeon(partidas: Partida[]): string {
  const puntos = new Map<string, number>();

  partidas
    .filter((partida) => partida.disputado)
    .forEach((partida) => {
      if (partida.golesLocal > partida.golesVisitante) puntos.set(partida.local, (puntos.get(partida.local) ?? 0) + 3);
      else if (partida.golesLocal < partida.golesVisitante) puntos.set(partida.visitante, (puntos.get(partida.visitante) ?? 0) + 3);
      else {
        puntos.set(partida.local, (puntos.get(partida.local) ?? 0) + 1);
        puntos.set(partida.visitante, (puntos.get(partida.visitante) ?? 0) + 1);
      }
    });

  const tabla = [...puntos.entries()].sort((a, b) => b[1] - a[1]);
  return tabla.length > 0 ? tabla[0][0] : 'sin campeon';
}

// datos remotos simulados
async function disputarFecha(partida: Partida): Promise<Partida> {
  await new Promise((resolver) => setTimeout(resolver, 5));
  partida.golesLocal = Math.floor(Math.random() * 4);
  partida.golesVisitante = Math.floor(Math.random() * 4);
  partida.disputado = true;
  return partida;
}

// datos
const partidas: Partida[] = [
  { local: 'Lobos Sala', visitante: 'Rayo Futsal', golesLocal: 0, golesVisitante: 0, disputado: false },
  { local: 'Rayo Futsal', visitante: 'Arena FC', golesLocal: 0, golesVisitante: 0, disputado: false },
  { local: 'Arena FC', visitante: 'Lobos Sala', golesLocal: 0, golesVisitante: 0, disputado: false },
];

// salida
function mostrarResumen(): void {
  console.log('=== Torneo futbol asincrono ===');
  let estado: EstadoTorneo = { tipo: 'inscripcion' };

  void (async () => {
    estado = reducirTorneo(estado, { tipo: 'iniciar' }, partidas);

    for (const partida of partidas) {
      const disputada = await disputarFecha(partida);
      aplicarResultado(partidas, { tipo: 'resultado', local: disputada.local, visitante: disputada.visitante, golesLocal: disputada.golesLocal, golesVisitante: disputada.golesVisitante });
      estado = reducirTorneo(estado, { tipo: 'resultado', local: disputada.local, visitante: disputada.visitante, golesLocal: disputada.golesLocal, golesVisitante: disputada.golesVisitante }, partidas);
      console.log(`${disputada.local} ${disputada.golesLocal}-${disputada.golesVisitante} ${disputada.visitante}`);
    }

    estado = reducirTorneo(estado, { tipo: 'cerrar' }, partidas);
    console.log(`Estado final: ${estado.tipo}${estado.tipo === 'finalizado' ? ` | Campeon: ${estado.campeon}` : ''}`);
  })();
}

mostrarResumen();
