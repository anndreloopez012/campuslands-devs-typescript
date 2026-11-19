export {};

// Intermedio 37: Ranking ELO pingpong
// Tematica: pingpong
// Resolucion: Dulce Morales
//
// Problema: un club de pingpong usa el sistema ELO para su ranking. Antes de cada partido se calcula
// la probabilidad de que gane cada jugador segun sus puntos; al terminar, el ganador sube y el
// perdedor baja. Ganarle a alguien mucho mejor da muchos puntos; ganarle a alguien peor, pocos.
// El factor K (cuanto se mueve el puntaje) depende de la experiencia del jugador.

// ===================== TIPOS =====================

type Categoria = "novato" | "intermedio" | "avanzado" | "experto";
type Partido = { readonly fecha: number; readonly jugadorA: string; readonly jugadorB: string; readonly setsA: number; readonly setsB: number };

type Procesado =
  | { readonly valido: true; readonly partido: Partido; readonly ganador: string; readonly perdedor: string; readonly cambio: number; readonly probGanador: number }
  | { readonly valido: false; readonly partido: Partido; readonly motivo: string };

function esValido(p: Procesado): p is Extract<Procesado, { valido: true }> {
  return p.valido;
}

// ===================== REGLAS =====================

const ELO_INICIAL: number = 1200;
const PARTIDOS_PROVISIONAL: number = 10; // menos de 10 partidos: ranking provisional

function categoriaDe(elo: number): Categoria {
  if (elo >= 1600) return "experto";
  if (elo >= 1400) return "avanzado";
  if (elo >= 1200) return "intermedio";
  return "novato";
}

// ===================== CLASES =====================

class Jugador {
  private elo: number;
  private jugados: number = 0;
  private readonly historialElo: number[];

  constructor(
    public readonly nombre: string,
    eloInicial: number = ELO_INICIAL,
    jugadosPrevios: number = 0,
  ) {
    this.elo = eloInicial;
    this.jugados = jugadosPrevios;
    this.historialElo = [eloInicial];
  }

  get puntos(): number {
    return this.elo;
  }

  get partidos(): number {
    return this.jugados;
  }

  get evolucion(): readonly number[] {
    return this.historialElo;
  }

  // Factor K: provisional se mueve mucho, experto poco
  get factorK(): number {
    if (this.jugados < PARTIDOS_PROVISIONAL) return 40;
    if (this.elo >= 1600) return 16;
    return 24;
  }

  aplicar(cambio: number): void {
    this.elo += cambio;
    this.jugados += 1;
    this.historialElo.push(this.elo);
  }
}

class RankingElo {
  private readonly jugadores: Map<string, Jugador> = new Map<string, Jugador>();

  inscribir(j: Jugador): void {
    if (this.jugadores.has(j.nombre)) throw new Error(`${j.nombre} ya esta inscrito`);
    this.jugadores.set(j.nombre, j);
  }

  // Probabilidad de que A le gane a B segun la formula ELO
  static probabilidad(eloA: number, eloB: number): number {
    return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
  }

  registrar(p: Partido): Procesado {
    const a: Jugador | undefined = this.jugadores.get(p.jugadorA);
    const b: Jugador | undefined = this.jugadores.get(p.jugadorB);
    if (a === undefined || b === undefined) return { valido: false, partido: p, motivo: "jugador no inscrito" };
    if (a === b) return { valido: false, partido: p, motivo: "no puede jugar contra si mismo" };
    const ganoA: boolean = p.setsA === 3 && p.setsB < 3;
    const ganoB: boolean = p.setsB === 3 && p.setsA < 3;
    if (!ganoA && !ganoB) return { valido: false, partido: p, motivo: `marcador ${p.setsA}-${p.setsB} no es al mejor de 5` };

    const [g, pe] = ganoA ? [a, b] : [b, a];
    const prob: number = RankingElo.probabilidad(g.puntos, pe.puntos);
    // Cada uno se mueve segun SU propio K
    const sube: number = Math.round(g.factorK * (1 - prob));
    const baja: number = Math.round(pe.factorK * (0 - (1 - prob)));
    g.aplicar(sube);
    pe.aplicar(baja);
    return { valido: true, partido: p, ganador: g.nombre, perdedor: pe.nombre, cambio: sube, probGanador: prob };
  }

  tabla(): Jugador[] {
    return [...this.jugadores.values()].sort((x, y): number => y.puntos - x.puntos || x.nombre.localeCompare(y.nombre));
  }
}

// ===================== DATOS =====================

const partidos: readonly Partido[] = [
  { fecha: 1, jugadorA: "Ana", jugadorB: "Beto", setsA: 3, setsB: 1 },
  { fecha: 1, jugadorA: "Carla", jugadorB: "Dario", setsA: 2, setsB: 3 },
  { fecha: 2, jugadorA: "Elsa", jugadorB: "Ana", setsA: 3, setsB: 2 }, // sorpresa: la novata le gana a la experta
  { fecha: 2, jugadorA: "Beto", jugadorB: "Dario", setsA: 3, setsB: 0 },
  { fecha: 3, jugadorA: "Ana", jugadorB: "Carla", setsA: 3, setsB: 0 },
  { fecha: 3, jugadorA: "Dario", jugadorB: "Elsa", setsA: 1, setsB: 3 },
  { fecha: 4, jugadorA: "Beto", jugadorB: "Elsa", setsA: 3, setsB: 2 },
  { fecha: 4, jugadorA: "Carla", jugadorB: "Ana", setsA: 0, setsB: 3 },
  { fecha: 5, jugadorA: "Elsa", jugadorB: "Carla", setsA: 3, setsB: 1 },
  { fecha: 5, jugadorA: "Dario", jugadorB: "Beto", setsA: 3, setsB: 2 },
  // Invalidos
  { fecha: 5, jugadorA: "Ana", jugadorB: "Ana", setsA: 3, setsB: 0 },
  { fecha: 5, jugadorA: "Beto", jugadorB: "Zoe", setsA: 3, setsB: 1 },
  { fecha: 5, jugadorA: "Carla", jugadorB: "Dario", setsA: 3, setsB: 3 },
];

// ===================== SALIDA =====================

function main(): void {
  const ranking: RankingElo = new RankingElo();
  ranking.inscribir(new Jugador("Ana", 1650, 40)); // experta, K = 16
  ranking.inscribir(new Jugador("Beto", 1420, 25));
  ranking.inscribir(new Jugador("Carla", 1300, 12));
  // Limite: Dario lleva 9 partidos (provisional, K = 40); despues de su primer partido llega a 10 y pasa a K = 24
  ranking.inscribir(new Jugador("Dario", 1250, 9));
  ranking.inscribir(new Jugador("Elsa")); // nueva, empieza en 1200 y K = 40

  try {
    ranking.inscribir(new Jugador("Ana"));
  } catch (e: unknown) {
    console.log(`Validacion: ${e instanceof Error ? e.message : "error"}\n`);
  }

  console.log("====================== PARTIDOS ======================");
  const procesados: Procesado[] = partidos.map((p: Partido): Procesado => ranking.registrar(p));
  procesados.forEach((r: Procesado): void => {
    const p: Partido = r.partido;
    const base: string = `F${p.fecha} ${p.jugadorA.padEnd(5)} ${p.setsA}-${p.setsB} ${p.jugadorB.padEnd(5)}`;
    if (esValido(r)) {
      console.log(`${base} | gana ${r.ganador.padEnd(5)} (tenia ${(r.probGanador * 100).toFixed(0).padStart(2)}% de probabilidad) +${r.cambio}`);
    } else {
      console.log(`${base} | X ${r.motivo}`);
    }
  });

  console.log("\n====================== RANKING ======================");
  ranking.tabla().forEach((j: Jugador, i: number): void => {
    const inicio: number = j.evolucion[0] ?? 0;
    const delta: number = j.puntos - inicio;
    const prov: string = j.partidos < PARTIDOS_PROVISIONAL ? " (provisional)" : "";
    console.log(`${i + 1}. ${j.nombre.padEnd(6)} ${j.puntos} (${delta >= 0 ? "+" : ""}${delta}) ${categoriaDe(j.puntos).padEnd(10)} K=${j.factorK} | ${j.partidos} partidos${prov} | ${j.evolucion.join(" > ")}`);
  });

  const validos = procesados.filter(esValido);
  const sorpresa = [...validos].sort((a, b): number => a.probGanador - b.probGanador)[0];
  if (sorpresa !== undefined) {
    console.log(`\nMayor sorpresa: ${sorpresa.ganador} le gano a ${sorpresa.perdedor} con solo ${(sorpresa.probGanador * 100).toFixed(0)}% de probabilidad (+${sorpresa.cambio})`);
  }
}

main();
