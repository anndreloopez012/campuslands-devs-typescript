export {};

type DisciplinaDeporte = "Futbol" | "Baloncesto" | "Kickboxing";

type EventoDeportivo =
  | { readonly deporte: "Futbol"; readonly minuto: number; readonly autor: string; readonly tipoAccion: "Gol" | "TarjetaAmarilla" | "Falta" }
  | { readonly deporte: "Baloncesto"; readonly cuarto: number; readonly jugador: string; readonly puntosAnotados: 1 | 2 | 3 }
  | { readonly deporte: "Kickboxing"; readonly round: number; readonly peleador: string; readonly golpeEfectivo: "Jab" | "LowKick" | "Knockdown" };

interface ResumenEstadisticasMultiDeporte {
  readonly golesFutbol: number;
  readonly puntosBaloncesto: number;
  readonly golpesEfectivosKickboxing: number;
  readonly faltasTotales: number;
}

function reductorEventosDeporte(
  acumulado: ResumenEstadisticasMultiDeporte,
  evento: EventoDeportivo
): ResumenEstadisticasMultiDeporte {
  switch (evento.deporte) {
    case "Futbol":
      return {
        ...acumulado,
        golesFutbol: evento.tipoAccion === "Gol" ? acumulado.golesFutbol + 1 : acumulado.golesFutbol,
        faltasTotales: evento.tipoAccion === "Falta" ? acumulado.faltasTotales + 1 : acumulado.faltasTotales,
      };
    case "Baloncesto":
      return {
        ...acumulado,
        puntosBaloncesto: acumulado.puntosBaloncesto + evento.puntosAnotados,
      };
    case "Kickboxing":
      return {
        ...acumulado,
        golpesEfectivosKickboxing: acumulado.golpesEfectivosKickboxing + 1,
      };
  }
}

function main() {
  console.log("=== DASHBOARD MULTI-DEPORTE (DISCRIMINATED UNIONS) ===");
  const eventos: EventoDeportivo[] = [
    { deporte: "Futbol", minuto: 23, autor: "Luis Diaz", tipoAccion: "Gol" },
    { deporte: "Baloncesto", cuarto: 1, jugador: "Stephen Curry", puntosAnotados: 3 },
    { deporte: "Kickboxing", round: 2, peleador: "Rico Verhoeven", golpeEfectivo: "LowKick" },
    { deporte: "Baloncesto", cuarto: 2, jugador: "LeBron James", puntosAnotados: 2 },
    { deporte: "Futbol", minuto: 67, autor: "Casemiro", tipoAccion: "Falta" },
    { deporte: "Kickboxing", round: 3, peleador: "Badr Hari", golpeEfectivo: "Knockdown" },
  ];

  const estadoInicial: ResumenEstadisticasMultiDeporte = {
    golesFutbol: 0,
    puntosBaloncesto: 0,
    golpesEfectivosKickboxing: 0,
    faltasTotales: 0,
  };

  const resumen = eventos.reduce(reductorEventosDeporte, estadoInicial);
  console.log(`- Goles en Futbol: ${resumen.golesFutbol}`);
  console.log(`- Puntos en Baloncesto: ${resumen.puntosBaloncesto}`);
  console.log(`- Golpes conectados en Kickboxing: ${resumen.golpesEfectivosKickboxing}`);
  console.log(`- Faltas registradas en campo: ${resumen.faltasTotales}`);
}

main();
