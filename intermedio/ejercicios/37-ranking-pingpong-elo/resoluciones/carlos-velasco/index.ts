export {};

// tipos
interface JugadorElo {
  readonly nombre: string;
  elo: number;
}

// clases
class RankingElo {
  private readonly jugadores = new Map<string, JugadorElo>();

  constructor(jugadores: JugadorElo[]) {
    jugadores.forEach((jugador) => this.jugadores.set(jugador.nombre, { ...jugador }));
  }

  private esperanza(eloA: number, eloB: number): number {
    return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
  }

  registrarResultado(ganador: string, perdedor: string): boolean {
    const jugadorGanador = this.jugadores.get(ganador);
    const jugadorPerdedor = this.jugadores.get(perdedor);
    if (!jugadorGanador || !jugadorPerdedor) return false;

    const factorK = 32;
    const esperanzaGanador = this.esperanza(jugadorGanador.elo, jugadorPerdedor.elo);
    const esperanzaPerdedor = this.esperanza(jugadorPerdedor.elo, jugadorGanador.elo);

    jugadorGanador.elo = Math.round(jugadorGanador.elo + factorK * (1 - esperanzaGanador));
    jugadorPerdedor.elo = Math.round(jugadorPerdedor.elo + factorK * (0 - esperanzaPerdedor));
    return true;
  }

  tabla(): JugadorElo[] {
    return [...this.jugadores.values()].sort((a, b) => b.elo - a.elo);
  }
}

// generics
function resumir<T>(items: T[], formatear: (item: T) => string): string {
  return items.map((item) => formatear(item)).join(' | ');
}

// datos
const jugadores: JugadorElo[] = [
  { nombre: 'Velas', elo: 1500 },
  { nombre: 'Rios', elo: 1580 },
  { nombre: 'Mena', elo: 1420 },
];

const resultados: [string, string][] = [
  ['Velas', 'Rios'],
  ['Velas', 'Mena'],
  ['Rios', 'Mena'],
];

// salida
function mostrarResumen(jugadores: JugadorElo[], resultados: [string, string][]): void {
  console.log('=== Ranking ELO pingpong ===');
  const ranking = new RankingElo(jugadores);

  resultados.forEach(([ganador, perdedor]) => {
    const registrado = ranking.registrarResultado(ganador, perdedor);
    console.log(`${ganador} gano a ${perdedor}: ${registrado ? 'registrado' : 'rechazado'}`);
  });

  console.log('Tabla final:');
  ranking.tabla().forEach((jugador, indice) => {
    console.log(`${indice + 1}. ${jugador.nombre} | ELO: ${jugador.elo}`);
  });
  console.log(resumir(ranking.tabla().slice(0, 2), (jugador) => `${jugador.nombre} (${jugador.elo})`));
}

mostrarResumen(jugadores, resultados);
