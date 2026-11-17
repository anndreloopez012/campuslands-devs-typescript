export {};

// Intermedio 55: Mapa de loot battle royale
// Tematica: videojuegos battle royale
// Resolucion: Dulce Morales
//
// Problema: antes de saltar del avion, una app descarga del servidor (simulado) la informacion de
// cada zona del mapa: que loot hay y cuantos jugadores suelen caer ahi. Las zonas se piden en
// paralelo; algunas tardan demasiado (se cortan por tiempo limite) y otras llegan con datos
// rotos. Con lo que si llega, la app recomienda donde caer segun el valor del loot y el riesgo.

// ===================== TIPOS =====================

type Rareza = "comun" | "raro" | "epico" | "legendario";

interface Loot {
  readonly objeto: string;
  readonly rareza: Rareza;
  readonly cantidad: number;
}

interface Zona {
  readonly nombre: string;
  readonly loot: readonly Loot[];
  readonly jugadoresEsperados: number;
  readonly distanciaAvionKm: number;
}

// ===================== ERRORES TIPADOS =====================

class ErrorTiempoLimite extends Error {
  constructor(public readonly zona: string, public readonly ms: number) {
    super(`${zona}: no respondio en ${ms} ms`);
    this.name = "ErrorTiempoLimite";
  }
}

class ErrorDatosZona extends Error {
  constructor(public readonly zona: string, detalle: string) {
    super(`${zona}: ${detalle}`);
    this.name = "ErrorDatosZona";
  }
}

// ===================== EVENTOS TIPADOS =====================

interface EventosMapa {
  cargada: { readonly zona: string; readonly ms: number };
  fallida: { readonly zona: string; readonly error: ErrorTiempoLimite | ErrorDatosZona };
}

class Emisor<E> {
  private readonly oyentes: { [K in keyof E]?: ((d: E[K]) => void)[] } = {};
  on<K extends keyof E>(e: K, fn: (d: E[K]) => void): void {
    (this.oyentes[e] ??= []).push(fn);
  }
  emit<K extends keyof E>(e: K, d: E[K]): void {
    this.oyentes[e]?.forEach((fn) => fn(d));
  }
}

// ===================== SERVIDOR SIMULADO =====================

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

// Cada zona responde con cierta demora y un cuerpo sin tipo (como un JSON real)
const RESPUESTAS: ReadonlyMap<string, { readonly demoraMs: number; readonly cuerpo: unknown }> = new Map<string, { demoraMs: number; cuerpo: unknown }>([
  ["Puerto", { demoraMs: 20, cuerpo: { nombre: "Puerto", jugadoresEsperados: 9, distanciaAvionKm: 0.4, loot: [{ objeto: "Rifle", rareza: "epico", cantidad: 3 }, { objeto: "Botiquin", rareza: "raro", cantidad: 6 }, { objeto: "Municion", rareza: "comun", cantidad: 20 }] } }],
  ["Granja", { demoraMs: 35, cuerpo: { nombre: "Granja", jugadoresEsperados: 2, distanciaAvionKm: 1.2, loot: [{ objeto: "Escopeta", rareza: "raro", cantidad: 2 }, { objeto: "Vendas", rareza: "comun", cantidad: 10 }] } }],
  ["Torre", { demoraMs: 60, cuerpo: { nombre: "Torre", jugadoresEsperados: 4, distanciaAvionKm: 0.9, loot: [{ objeto: "Francotirador", rareza: "legendario", cantidad: 1 }, { objeto: "Mira 8x", rareza: "epico", cantidad: 1 }] } }],
  ["Base militar", { demoraMs: 150, cuerpo: { nombre: "Base militar", jugadoresEsperados: 14, distanciaAvionKm: 0.2, loot: [{ objeto: "Armadura", rareza: "legendario", cantidad: 4 }] } }], // tarda demasiado
  ["Pantano", { demoraMs: 25, cuerpo: { nombre: "Pantano", jugadoresEsperados: "muchos", loot: null } }], // datos rotos
  ["Aldea", { demoraMs: 100, cuerpo: { nombre: "Aldea", jugadoresEsperados: 3, distanciaAvionKm: 1.6, loot: [{ objeto: "Subfusil", rareza: "raro", cantidad: 3 }, { objeto: "Escudo", rareza: "epico", cantidad: 2 }] } }], // limite: llega 10 ms antes de que se corte
]);

async function pedirZona(nombre: string): Promise<unknown> {
  const r = RESPUESTAS.get(nombre);
  if (r === undefined) throw new ErrorDatosZona(nombre, "zona desconocida");
  await esperar(r.demoraMs);
  return r.cuerpo;
}

// ===================== VALIDACION =====================

const RAREZAS: readonly Rareza[] = ["comun", "raro", "epico", "legendario"];

function esLoot(x: unknown): x is Loot {
  return typeof x === "object" && x !== null && "objeto" in x && typeof x.objeto === "string" && "rareza" in x && RAREZAS.some((r) => r === x.rareza) && "cantidad" in x && typeof x.cantidad === "number";
}

function validarZona(nombre: string, x: unknown): Zona {
  if (typeof x !== "object" || x === null) throw new ErrorDatosZona(nombre, "respuesta vacia");
  if (!("jugadoresEsperados" in x) || typeof x.jugadoresEsperados !== "number") throw new ErrorDatosZona(nombre, "jugadoresEsperados no es un numero");
  if (!("distanciaAvionKm" in x) || typeof x.distanciaAvionKm !== "number") throw new ErrorDatosZona(nombre, "falta distanciaAvionKm");
  if (!("loot" in x) || !Array.isArray(x.loot) || !x.loot.every(esLoot)) throw new ErrorDatosZona(nombre, "loot invalido");
  return { nombre, loot: x.loot, jugadoresEsperados: x.jugadoresEsperados, distanciaAvionKm: x.distanciaAvionKm };
}

// ===================== CARGA CON TIEMPO LIMITE =====================

const TIEMPO_LIMITE_MS: number = 110;

// Promise.race: gana la respuesta o el temporizador, lo que llegue primero
function conTiempoLimite<T>(promesa: Promise<T>, zona: string, ms: number): Promise<T> {
  let reloj: ReturnType<typeof setTimeout> | undefined;
  const limite: Promise<never> = new Promise((_, reject) => {
    reloj = setTimeout(() => reject(new ErrorTiempoLimite(zona, ms)), ms);
  });
  return Promise.race([promesa, limite]).finally(() => clearTimeout(reloj));
}

async function cargarMapa(zonas: readonly string[], eventos: Emisor<EventosMapa>): Promise<Zona[]> {
  const inicio: number = Date.now();
  const resultados = await Promise.allSettled(
    zonas.map(async (nombre: string): Promise<Zona> => {
      const zona: Zona = validarZona(nombre, await conTiempoLimite(pedirZona(nombre), nombre, TIEMPO_LIMITE_MS));
      eventos.emit("cargada", { zona: nombre, ms: Date.now() - inicio });
      return zona;
    }),
  );
  return resultados.flatMap((r, i): Zona[] => {
    if (r.status === "fulfilled") return [r.value];
    const error: unknown = r.reason;
    if (error instanceof ErrorTiempoLimite || error instanceof ErrorDatosZona) eventos.emit("fallida", { zona: zonas[i] ?? "?", error });
    return [];
  });
}

// ===================== RECOMENDACION =====================

const VALOR: Readonly<Record<Rareza, number>> = { comun: 1, raro: 4, epico: 10, legendario: 25 };

function valorLoot(z: Zona): number {
  return z.loot.reduce((s: number, l: Loot): number => s + VALOR[l.rareza] * l.cantidad, 0);
}

// Puntaje: valor del loot dividido entre el riesgo (jugadores que caen alli + 1)
function puntaje(z: Zona): number {
  return Math.round((valorLoot(z) / (z.jugadoresEsperados + 1)) * 10) / 10;
}

// ===================== SALIDA =====================

async function main(): Promise<void> {
  const eventos: Emisor<EventosMapa> = new Emisor<EventosMapa>();
  console.log(`================ CARGANDO EL MAPA (tiempo limite ${TIEMPO_LIMITE_MS} ms por zona) ================`);
  eventos.on("cargada", ({ zona }) => console.log(`OK ${zona}`));
  eventos.on("fallida", ({ zona, error }) => console.log(`X  ${zona}: [${error.name}] ${error.message}`));

  const zonas: Zona[] = await cargarMapa([...RESPUESTAS.keys()], eventos);

  console.log("\n================ DONDE CAER ================");
  [...zonas]
    .sort((a, b): number => puntaje(b) - puntaje(a))
    .forEach((z: Zona, i: number): void => {
      const mejores: string = [...z.loot].sort((a, b) => VALOR[b.rareza] - VALOR[a.rareza]).slice(0, 2).map((l) => `${l.objeto} (${l.rareza})`).join(", ");
      console.log(`${i + 1}. ${z.nombre.padEnd(8)} puntaje ${String(puntaje(z)).padStart(5)} | loot ${String(valorLoot(z)).padStart(3)} | ~${z.jugadoresEsperados} jugadores | ${z.distanciaAvionKm} km | ${mejores}`);
    });
  const [mejor] = [...zonas].sort((a, b): number => puntaje(b) - puntaje(a));
  if (mejor !== undefined) console.log(`\nRecomendacion: caer en ${mejor.nombre}.`);
  console.log(`Zonas cargadas: ${zonas.length} de ${RESPUESTAS.size}`);
}

main();
