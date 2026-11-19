export {};

// Intermedio 62: Dashboard multi-deporte
// Tematica: deportes
// Resolucion: Dulce Morales
//
// Problema: un dashboard en vivo sigue partidos de futbol, basquetbol y tenis al mismo tiempo.
// Llegan eventos de los tres deportes mezclados; un reducer puro los aplica al partido que
// corresponde. Cada deporte tiene sus reglas: en futbol dos amarillas son roja; en basquet una
// canasta vale 1, 2 o 3; en tenis el marcador es una maquina de estados (0-15-30-40, iguales,
// ventaja, game). Los eventos que no tienen sentido se rechazan.

// ===================== ESTADO DE CADA PARTIDO (union discriminada) =====================

type Lado = "local" | "visita";
type PuntoTenis = "0" | "15" | "30" | "40" | "AD";

type Partido =
  | { readonly deporte: "futbol"; readonly id: string; readonly equipos: Readonly<Record<Lado, string>>; readonly goles: Readonly<Record<Lado, number>>; readonly amarillas: ReadonlyMap<string, number>; readonly expulsados: readonly string[]; readonly terminado: boolean }
  | { readonly deporte: "basquet"; readonly id: string; readonly equipos: Readonly<Record<Lado, string>>; readonly puntos: Readonly<Record<Lado, number>>; readonly cuarto: number; readonly terminado: boolean }
  | { readonly deporte: "tenis"; readonly id: string; readonly equipos: Readonly<Record<Lado, string>>; readonly juego: Readonly<Record<Lado, PuntoTenis>>; readonly games: Readonly<Record<Lado, number>>; readonly terminado: boolean };

// ===================== EVENTOS (union discriminada) =====================

type Evento =
  | { readonly tipo: "GOL"; readonly partido: string; readonly lado: Lado; readonly jugador: string }
  | { readonly tipo: "AMARILLA"; readonly partido: string; readonly jugador: string }
  | { readonly tipo: "CANASTA"; readonly partido: string; readonly lado: Lado; readonly valor: 1 | 2 | 3 }
  | { readonly tipo: "FIN_CUARTO"; readonly partido: string }
  | { readonly tipo: "PUNTO"; readonly partido: string; readonly lado: Lado }
  | { readonly tipo: "FINAL"; readonly partido: string };

type Dashboard = { readonly partidos: ReadonlyMap<string, Partido>; readonly log: readonly string[] };

// ===================== TENIS: MAQUINA DE ESTADOS DEL GAME =====================

const otro = (l: Lado): Lado => (l === "local" ? "visita" : "local");

// Devuelve el nuevo marcador del game y si alguien gano el game
function puntoTenis(j: Readonly<Record<Lado, PuntoTenis>>, gana: Lado): { juego: Record<Lado, PuntoTenis>; ganoGame: boolean } {
  const pierde: Lado = otro(gana);
  const a: PuntoTenis = j[gana];
  const b: PuntoTenis = j[pierde];
  // Cambia el valor de un lado y deja el otro igual (sin casteos)
  const con = (lado: Lado, valor: PuntoTenis): Record<Lado, PuntoTenis> =>
    lado === "local" ? { local: valor, visita: j.visita } : { local: j.local, visita: valor };
  const siguiente: Readonly<Record<"0" | "15" | "30", PuntoTenis>> = { "0": "15", "15": "30", "30": "40" };
  if (a === "40" && b !== "40" && b !== "AD") return { juego: { local: "0", visita: "0" }, ganoGame: true }; // gana el game
  if (a === "AD") return { juego: { local: "0", visita: "0" }, ganoGame: true }; // con ventaja, gana
  if (a === "40" && b === "AD") return { juego: con(pierde, "40"), ganoGame: false }; // vuelve a iguales
  if (a === "40" && b === "40") return { juego: con(gana, "AD"), ganoGame: false }; // ventaja
  return { juego: con(gana, a === "0" || a === "15" || a === "30" ? siguiente[a] : a), ganoGame: false };
}

// ===================== REDUCER PURO =====================

function reducer(d: Dashboard, e: Evento): Dashboard {
  const p: Partido | undefined = d.partidos.get(e.partido);
  const rechazar = (motivo: string): Dashboard => ({ ...d, log: [...d.log, `X ${e.tipo} en ${e.partido}: ${motivo}`] });
  const guardar = (nuevo: Partido, texto: string): Dashboard => ({ partidos: new Map(d.partidos).set(nuevo.id, nuevo), log: [...d.log, texto] });

  if (p === undefined) return rechazar("partido inexistente");
  if (p.terminado) return rechazar("el partido ya termino");
  if (e.tipo === "FINAL") return guardar({ ...p, terminado: true }, `${p.id}: FINAL`);

  switch (p.deporte) {
    case "futbol":
      if (e.tipo === "GOL") {
        if (p.expulsados.includes(e.jugador)) return rechazar(`${e.jugador} esta expulsado`);
        return guardar({ ...p, goles: { ...p.goles, [e.lado]: p.goles[e.lado] + 1 } }, `${p.id}: GOL de ${e.jugador} (${p.equipos[e.lado]})`);
      }
      if (e.tipo === "AMARILLA") {
        const n: number = (p.amarillas.get(e.jugador) ?? 0) + 1;
        const amarillas: Map<string, number> = new Map(p.amarillas).set(e.jugador, n);
        if (n === 2) return guardar({ ...p, amarillas, expulsados: [...p.expulsados, e.jugador] }, `${p.id}: segunda amarilla a ${e.jugador} -> ROJA`);
        return guardar({ ...p, amarillas }, `${p.id}: amarilla a ${e.jugador}`);
      }
      return rechazar("evento que no es de futbol");
    case "basquet":
      if (e.tipo === "CANASTA") return guardar({ ...p, puntos: { ...p.puntos, [e.lado]: p.puntos[e.lado] + e.valor } }, `${p.id}: canasta de ${e.valor} para ${p.equipos[e.lado]}`);
      if (e.tipo === "FIN_CUARTO") {
        if (p.cuarto === 4) return rechazar("ya se jugaron los 4 cuartos, usar FINAL");
        return guardar({ ...p, cuarto: p.cuarto + 1 }, `${p.id}: termina el cuarto ${p.cuarto}`);
      }
      return rechazar("evento que no es de basquet");
    case "tenis": {
      if (e.tipo !== "PUNTO") return rechazar("evento que no es de tenis");
      const { juego, ganoGame } = puntoTenis(p.juego, e.lado);
      const games = ganoGame ? { ...p.games, [e.lado]: p.games[e.lado] + 1 } : p.games;
      const texto: string = ganoGame ? `${p.id}: GAME para ${p.equipos[e.lado]}` : `${p.id}: punto ${p.equipos[e.lado]} (${juego.local}-${juego.visita})`;
      return guardar({ ...p, juego, games }, texto);
    }
  }
}

// ===================== DATOS Y SALIDA =====================

const inicial: Dashboard = {
  log: [],
  partidos: new Map<string, Partido>([
    ["F1", { deporte: "futbol", id: "F1", equipos: { local: "Leones", visita: "Halcones" }, goles: { local: 0, visita: 0 }, amarillas: new Map(), expulsados: [], terminado: false }],
    ["B1", { deporte: "basquet", id: "B1", equipos: { local: "Toros", visita: "Lobos" }, puntos: { local: 0, visita: 0 }, cuarto: 1, terminado: false }],
    ["T1", { deporte: "tenis", id: "T1", equipos: { local: "Paz", visita: "Rios" }, juego: { local: "0", visita: "0" }, games: { local: 0, visita: 0 }, terminado: false }],
  ]),
};

const P = (lado: Lado): Evento => ({ tipo: "PUNTO", partido: "T1", lado });

const eventos: readonly Evento[] = [
  { tipo: "GOL", partido: "F1", lado: "local", jugador: "Mora" },
  { tipo: "CANASTA", partido: "B1", lado: "local", valor: 3 },
  P("local"), P("local"), P("local"), P("local"), // game en blanco para Paz
  { tipo: "AMARILLA", partido: "F1", jugador: "Rojas" },
  { tipo: "CANASTA", partido: "B1", lado: "visita", valor: 2 },
  // Game con iguales y ventaja
  P("visita"), P("visita"), P("visita"), P("local"), P("local"), P("local"), // 40-40 (iguales)
  P("local"), // ventaja Paz
  P("visita"), // vuelve a iguales
  P("visita"), P("visita"), // ventaja y game para Rios
  { tipo: "AMARILLA", partido: "F1", jugador: "Rojas" }, // segunda amarilla -> roja
  { tipo: "GOL", partido: "F1", lado: "visita", jugador: "Rojas" }, // expulsado: rechazado
  { tipo: "GOL", partido: "F1", lado: "visita", jugador: "Vega" },
  { tipo: "CANASTA", partido: "F1", lado: "local", valor: 2 }, // evento de basquet en partido de futbol
  { tipo: "FIN_CUARTO", partido: "B1" }, { tipo: "FIN_CUARTO", partido: "B1" }, { tipo: "FIN_CUARTO", partido: "B1" },
  { tipo: "FIN_CUARTO", partido: "B1" }, // ya van 4: rechazado
  { tipo: "FINAL", partido: "B1" },
  { tipo: "CANASTA", partido: "B1", lado: "visita", valor: 3 }, // partido terminado
  { tipo: "GOL", partido: "F9", lado: "local", jugador: "X" }, // partido inexistente
];

function marcador(p: Partido): string {
  const [l, v] = [p.equipos.local, p.equipos.visita];
  const fin: string = p.terminado ? " (final)" : "";
  switch (p.deporte) {
    case "futbol":
      return `FUTBOL  ${l} ${p.goles.local} - ${p.goles.visita} ${v}${p.expulsados.length > 0 ? ` | expulsados: ${p.expulsados.join(", ")}` : ""}${fin}`;
    case "basquet":
      return `BASQUET ${l} ${p.puntos.local} - ${p.puntos.visita} ${v} | cuarto ${p.cuarto}${fin}`;
    case "tenis":
      return `TENIS   ${l} ${p.games.local} - ${p.games.visita} ${v} (games) | game actual ${p.juego.local}-${p.juego.visita}${fin}`;
  }
}

function main(): void {
  const final: Dashboard = eventos.reduce(reducer, inicial);
  console.log("==================== EVENTOS PROCESADOS ====================");
  final.log.forEach((l) => console.log(l));
  console.log("\n==================== DASHBOARD ====================");
  for (const p of final.partidos.values()) console.log(marcador(p));
  const f1: Partido | undefined = inicial.partidos.get("F1");
  const marcadorInicial: string = f1?.deporte === "futbol" ? `${f1.goles.local}-${f1.goles.visita}` : "?";
  console.log(`\nEl estado inicial no cambio (reducer puro): F1 sigue ${marcadorInicial} en el estado inicial`);
}

main();
