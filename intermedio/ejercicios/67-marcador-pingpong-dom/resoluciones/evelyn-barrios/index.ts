export {};

type JugadorPingPong = "Jugador 1" | "Jugador 2";

type AccionMarcador =
  | { readonly tipo: "PUNTO_PARA"; readonly jugador: JugadorPingPong }
  | { readonly tipo: "REINICIAR_PARTIDO" };

interface EstadoMarcadorPingPong {
  readonly puntosJ1: number;
  readonly puntosJ2: number;
  readonly setsJ1: number;
  readonly setsJ2: number;
  readonly enDeuce: boolean;
  readonly servidorActual: JugadorPingPong;
  readonly partidoFinalizado: boolean;
}

function reductorPingPong(
  estado: EstadoMarcadorPingPong,
  accion: AccionMarcador
): EstadoMarcadorPingPong {
  if (accion.tipo === "REINICIAR_PARTIDO") {
    return {
      puntosJ1: 0,
      puntosJ2: 0,
      setsJ1: 0,
      setsJ2: 0,
      enDeuce: false,
      servidorActual: "Jugador 1",
      partidoFinalizado: false,
    };
  }

  if (estado.partidoFinalizado) return estado;

  const puntos1 = accion.jugador === "Jugador 1" ? estado.puntosJ1 + 1 : estado.puntosJ1;
  const puntos2 = accion.jugador === "Jugador 2" ? estado.puntosJ2 + 1 : estado.puntosJ2;
  const deuce = puntos1 >= 10 && puntos2 >= 10;

  // Ganar set: al menos 11 pts y diferencia de 2
  const ganaJ1 = puntos1 >= 11 && puntos1 - puntos2 >= 2;
  const ganaJ2 = puntos2 >= 11 && puntos2 - puntos1 >= 2;

  if (ganaJ1 || ganaJ2) {
    const nuevosSets1 = ganaJ1 ? estado.setsJ1 + 1 : estado.setsJ1;
    const nuevosSets2 = ganaJ2 ? estado.setsJ2 + 1 : estado.setsJ2;
    const fin = nuevosSets1 >= 3 || nuevosSets2 >= 3;

    return {
      puntosJ1: 0,
      puntosJ2: 0,
      setsJ1: nuevosSets1,
      setsJ2: nuevosSets2,
      enDeuce: false,
      servidorActual: estado.servidorActual === "Jugador 1" ? "Jugador 2" : "Jugador 1",
      partidoFinalizado: fin,
    };
  }

  const sumaPuntos = puntos1 + puntos2;
  const cambiaSaque = deuce ? true : sumaPuntos % 2 === 0;
  const nuevoServidor = cambiaSaque
    ? estado.servidorActual === "Jugador 1" ? "Jugador 2" : "Jugador 1"
    : estado.servidorActual;

  return {
    ...estado,
    puntosJ1: puntos1,
    puntosJ2: puntos2,
    enDeuce: deuce,
    servidorActual: nuevoServidor,
  };
}

function main() {
  console.log("=== MARCADOR PING PONG DOM (REDUCER OFICIAL ITTF) ===");
  let marcador: EstadoMarcadorPingPong = {
    puntosJ1: 9,
    puntosJ2: 10,
    setsJ1: 1,
    setsJ2: 1,
    enDeuce: false,
    servidorActual: "Jugador 1",
    partidoFinalizado: false,
  };

  marcador = reductorPingPong(marcador, { tipo: "PUNTO_PARA", jugador: "Jugador 1" });
  console.log(`[DEUCE] Pts: J1 ${marcador.puntosJ1} - ${marcador.puntosJ2} J2 | Deuce: ${marcador.enDeuce}`);

  marcador = reductorPingPong(marcador, { tipo: "PUNTO_PARA", jugador: "Jugador 1" });
  marcador = reductorPingPong(marcador, { tipo: "PUNTO_PARA", jugador: "Jugador 1" });
  console.log(`[FIN SET] Sets: J1 ${marcador.setsJ1} - ${marcador.setsJ2} J2 | Servidor: ${marcador.servidorActual}`);
}

main();
