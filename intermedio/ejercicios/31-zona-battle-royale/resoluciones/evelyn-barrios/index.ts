export {};

type FaseTormenta = 1 | 2 | 3 | 4 | 5;
type EstadoJugador = "En Zona Segura" | "En Tormenta" | "Caido" | "Eliminado";

interface JugadorBR {
  readonly id: string;
  readonly nickname: string;
  salud: number;
  escudo: number;
  distanciaAlBordeMetros: number;
  estado: EstadoJugador;
}

interface ConfiguracionFase {
  readonly fase: FaseTormenta;
  readonly danioPorSegundo: number;
  readonly radioMetros: number;
  readonly tiempoCierreSegundos: number;
}

function aplicarTickTormenta(jugador: JugadorBR, config: ConfiguracionFase, segundosExposicion: number): JugadorBR {
  if (jugador.distanciaAlBordeMetros <= config.radioMetros) {
    return { ...jugador, estado: "En Zona Segura" };
  }

  const danioTotal = config.danioPorSegundo * segundosExposicion;
  const saludRestante = Math.max(0, jugador.salud - danioTotal);
  const nuevoEstado: EstadoJugador = saludRestante === 0 ? "Eliminado" : "En Tormenta";

  return {
    ...jugador,
    salud: saludRestante,
    estado: nuevoEstado,
  };
}

const confFase4: ConfiguracionFase = {
  fase: 4,
  danioPorSegundo: 7,
  radioMetros: 250,
  tiempoCierreSegundos: 45,
};

const sobrevivientes: JugadorBR[] = [
  { id: "p1", nickname: "GhostRider", salud: 100, escudo: 50, distanciaAlBordeMetros: 180, estado: "En Zona Segura" },
  { id: "p2", nickname: "StormRunner", salud: 80, escudo: 100, distanciaAlBordeMetros: 320, estado: "En Tormenta" },
  { id: "p3", nickname: "NoobMaster", salud: 25, escudo: 0, distanciaAlBordeMetros: 400, estado: "En Tormenta" },
];

console.log("=== SIMULADOR DE ZONA BATTLE ROYALE ===");
console.log(`Fase actual: ${confFase4.fase} | Danio por seg: ${confFase4.danioPorSegundo} HP`);
sobrevivientes.forEach((p) => {
  const trasTick = aplicarTickTormenta(p, confFase4, 5);
  console.log(`${trasTick.nickname} -> Salud: ${trasTick.salud} HP | Estado: ${trasTick.estado}`);
});