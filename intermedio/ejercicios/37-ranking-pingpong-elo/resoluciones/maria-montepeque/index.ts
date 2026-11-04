export {};

interface Partido {
  readonly ganador: string;
  readonly perdedor: string;
}

class RankingElo {
  private readonly puntos = new Map<string, number>();
  private readonly partidos = new Map<string, number>();

  constructor(
    jugadores: readonly string[],
    private readonly k = 32,
    private readonly inicial = 1000,
  ) {
    jugadores.forEach((nombre) => {
      this.puntos.set(nombre, inicial);
      this.partidos.set(nombre, 0);
    });
  }

  private esperado(a: number, b: number): number {
    return 1 / (1 + 10 ** ((b - a) / 400));
  }

  registrar({ ganador, perdedor }: Partido): void {
    const rg = this.puntos.get(ganador);
    const rp = this.puntos.get(perdedor);
    if (rg === undefined || rp === undefined) throw new Error(`Jugador desconocido en ${ganador} vs ${perdedor}`);
    if (ganador === perdedor) throw new Error(`${ganador} no puede jugar contra si mismo`);

    const delta = this.k * (1 - this.esperado(rg, rp));
    this.puntos.set(ganador, rg + delta);
    this.puntos.set(perdedor, rp - delta);
    this.partidos.set(ganador, (this.partidos.get(ganador) ?? 0) + 1);
    this.partidos.set(perdedor, (this.partidos.get(perdedor) ?? 0) + 1);
  }

  tabla(): { nombre: string; elo: number; partidos: number }[] {
    return [...this.puntos]
      .map(([nombre, elo]) => ({ nombre, elo: Math.round(elo), partidos: this.partidos.get(nombre) ?? 0 }))
      .sort((a, b) => b.elo - a.elo);
  }
}

const ranking = new RankingElo(["Lucia", "Marco", "Nora", "Pedro"]);
const partidos: readonly Partido[] = [
  { ganador: "Lucia", perdedor: "Marco" },
  { ganador: "Lucia", perdedor: "Nora" },
  { ganador: "Marco", perdedor: "Pedro" },
  { ganador: "Nora", perdedor: "Lucia" },
  { ganador: "Pedro", perdedor: "Marco" },
  { ganador: "Lucia", perdedor: "Lucia" },
  { ganador: "Zoe", perdedor: "Nora" },
  { ganador: "Lucia", perdedor: "Pedro" },
];

console.log("Ejercicio 37: Ranking ELO de pingpong");
partidos.forEach((partido) => {
  try {
    ranking.registrar(partido);
  } catch (error) {
    console.log(`  ! ${error instanceof Error ? error.message : "Error desconocido"}`);
  }
});
ranking.tabla().forEach((j, i) => console.log(`${i + 1}. ${j.nombre} - ${j.elo} ELO (${j.partidos} partidos)`));
