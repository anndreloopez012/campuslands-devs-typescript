export {};

type RondaTorneo = "Cuartos de Final" | "Semifinal" | "Final";
type MetodoVictoria = "KO" | "TKO" | "Decision Unanime" | "Decision Dividida";

interface PeleadorTorneo {
  readonly id: string;
  readonly nombre: string;
  readonly pais: string;
  readonly victoriasPrevias: number;
}

interface PeleaBracket {
  readonly idPelea: string;
  readonly ronda: RondaTorneo;
  readonly peleadorRojo: PeleadorTorneo;
  readonly peleadorAzul: PeleadorTorneo;
  readonly ganador?: PeleadorTorneo;
  readonly metodo?: MetodoVictoria;
}

interface EstadoBracket {
  readonly torneoNombre: string;
  readonly peleas: readonly PeleaBracket[];
  readonly campeon?: PeleadorTorneo;
}

function registrarGanador(pelea: PeleaBracket, ganador: PeleadorTorneo, metodo: MetodoVictoria): PeleaBracket {
  return {
    ...pelea,
    ganador,
    metodo,
  };
}

function obtenerFinalistas(peleasSemifinal: readonly PeleaBracket[]): PeleadorTorneo[] {
  return peleasSemifinal
    .filter((p) => p.ganador !== undefined)
    .map((p) => p.ganador as PeleadorTorneo);
}

const p1: PeleadorTorneo = { id: "p-01", nombre: "Gabriel Varga", pais: "Canada", victoriasPrevias: 18 };
const p2: PeleadorTorneo = { id: "p-02", nombre: "Petpanomrung Kiatmuu9", pais: "Tailandia", victoriasPrevias: 25 };

const semi1: PeleaBracket = {
  idPelea: "SF-01",
  ronda: "Semifinal",
  peleadorRojo: p1,
  peleadorAzul: p2,
};

const semi1Resuelta = registrarGanador(semi1, p2, "Decision Unanime");

console.log("=== BRACKET DE TORNEO KICKBOXING ===");
console.log(`Encuentro: ${semi1.peleadorRojo.nombre} vs ${semi1.peleadorAzul.nombre} (${semi1.ronda})`);
console.log(`Vencedor: ${semi1Resuelta.ganador?.nombre} vía ${semi1Resuelta.metodo}`);