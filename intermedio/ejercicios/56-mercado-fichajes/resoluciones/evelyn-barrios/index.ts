export {};

type PosicionJugador = "Delantero" | "Mediocampista" | "Defensa" | "Portero";
type EstadoFichaje = "En Negociacion" | "Firmado" | "Cancelado";

interface JugadorTransferible {
  readonly id: string;
  readonly nombre: string;
  readonly edad: number;
  readonly posicion: PosicionJugador;
  readonly clubOrigen: string;
  readonly valorMercadoEur: number;
}

interface OperacionFichaje {
  readonly jugador: JugadorTransferible;
  readonly clubComprador: string;
  readonly ofertaEur: number;
  readonly clausulaRescisionEur: number;
  readonly estado: EstadoFichaje;
}

async function procesarNegociacionFichaje(
  jugador: JugadorTransferible,
  clubComprador: string,
  ofertaEur: number
): Promise<OperacionFichaje> {
  await new Promise((resolve) => setTimeout(resolve, 15));

  const clausula = jugador.valorMercadoEur * 1.25;
  const aprobado = ofertaEur >= jugador.valorMercadoEur;

  return {
    jugador,
    clubComprador,
    ofertaEur,
    clausulaRescisionEur: clausula,
    estado: aprobado ? "Firmado" : "Cancelado",
  };
}

async function main() {
  const jugador1: JugadorTransferible = {
    id: "jug-01",
    nombre: "Julian Alvarez",
    edad: 24,
    posicion: "Delantero",
    clubOrigen: "Manchester City",
    valorMercadoEur: 90000000,
  };

  const jugador2: JugadorTransferible = {
    id: "jug-02",
    nombre: "Federico Valverde",
    edad: 26,
    posicion: "Mediocampista",
    clubOrigen: "Real Madrid",
    valorMercadoEur: 120000000,
  };

  console.log("=== MERCADO DE FICHAJES FUTBOL ASINCRONO ===");
  const res1 = await procesarNegociacionFichaje(jugador1, "Atletico de Madrid", 95000000);
  console.log(`[${res1.estado}] ${res1.jugador.nombre} traspasado a ${res1.clubComprador} por €${res1.ofertaEur.toLocaleString()}`);

  const res2 = await procesarNegociacionFichaje(jugador2, "Chelsea FC", 80000000);
  console.log(`[${res2.estado}] Oferta por ${res2.jugador.nombre} de ${res2.clubComprador} fue rechazada (Oferta: €${res2.ofertaEur.toLocaleString()} vs Valor: €${res2.jugador.valorMercadoEur.toLocaleString()})`);
}

main();
