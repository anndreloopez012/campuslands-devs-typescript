export {};

type DivisionElo = "Principiante" | "Intermedio" | "Avanzado" | "Maestro";

interface JugadorElo {
  readonly id: string;
  readonly nombre: string;
  puntosElo: number;
  partidosJugados: number;
}

interface ResultadoEncuentro {
  readonly idGanador: string;
  readonly idPerdedor: string;
}

function calcularDivision(elo: number): DivisionElo {
  if (elo >= 2000) return "Maestro";
  if (elo >= 1600) return "Avanzado";
  if (elo >= 1200) return "Intermedio";
  return "Principiante";
}

function actualizarElo(ganador: JugadorElo, perdedor: JugadorElo, kFactor: number = 32): void {
  const probGanador = 1 / (1 + Math.pow(10, (perdedor.puntosElo - ganador.puntosElo) / 400));
  const cambio = Math.round(kFactor * (1 - probGanador));

  ganador.puntosElo += cambio;
  perdedor.puntosElo = Math.max(0, perdedor.puntosElo - cambio);
  ganador.partidosJugados += 1;
  perdedor.partidosJugados += 1;
}

const j1: JugadorElo = { id: "tt-01", nombre: "Timo Boll", puntosElo: 1850, partidosJugados: 40 };
const j2: JugadorElo = { id: "tt-02", nombre: "Dimitrij Ovtcharov", puntosElo: 1820, partidosJugados: 38 };

console.log("=== RANKING ELO PINGPONG ===");
console.log(`Previo: ${j1.nombre} (${j1.puntosElo} ELO) vs ${j2.nombre} (${j2.puntosElo} ELO)`);
actualizarElo(j1, j2);
console.log(`Posterior victoria ${j1.nombre}: ${j1.nombre} (${j1.puntosElo} ELO - ${calcularDivision(j1.puntosElo)}) | ${j2.nombre} (${j2.puntosElo} ELO - ${calcularDivision(j2.puntosElo)})`);