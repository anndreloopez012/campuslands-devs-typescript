export {};

// Intermedio 54: Chat de equipo MOBA
// Tematica: videojuegos MOBA
// Resolucion: Dulce Morales
//
// Problema: el chat de equipo de un MOBA manda mensajes a traves de un servidor (simulado, con
// demora). Hay varios tipos de mensaje: texto, ping en el mapa, alerta de enemigo y comandos.
// El servidor modera: filtra palabras prohibidas, silencia a quien hace spam (3 mensajes en
// 2 segundos) y guarda los mensajes de los jugadores desconectados para entregarlos cuando
// vuelvan. Los errores son tipados y la entrega se avisa con eventos tipados.

// ===================== TIPOS =====================

type Linea = "top" | "jungla" | "mid" | "bot";

type Contenido =
  | { readonly tipo: "texto"; readonly texto: string }
  | { readonly tipo: "ping"; readonly x: number; readonly y: number; readonly intencion: "atacar" | "defender" | "cuidado" }
  | { readonly tipo: "alerta"; readonly linea: Linea; readonly enemigo: string }
  | { readonly tipo: "comando"; readonly nombre: "mute" | "unmute"; readonly objetivo: string };

interface Mensaje {
  readonly de: string;
  readonly segundo: number; // segundo de la partida
  readonly contenido: Contenido;
}

// ===================== ERRORES TIPADOS =====================

class ErrorSilenciado extends Error {
  constructor(public readonly jugador: string, public readonly hasta: number) {
    super(`${jugador} esta silenciado hasta el segundo ${hasta}`);
    this.name = "ErrorSilenciado";
  }
}

class ErrorMensajeInvalido extends Error {
  constructor(detalle: string) {
    super(detalle);
    this.name = "ErrorMensajeInvalido";
  }
}

class ErrorRemitente extends Error {
  constructor(public readonly jugador: string) {
    super(`${jugador} no esta en el equipo`);
    this.name = "ErrorRemitente";
  }
}

// ===================== EVENTOS TIPADOS =====================

interface EventosChat {
  entregado: { readonly a: string; readonly mensaje: Mensaje; readonly diferido: boolean };
  censurado: { readonly de: string; readonly palabras: number };
  silenciado: { readonly jugador: string; readonly hasta: number };
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

// ===================== SERVIDOR DE CHAT =====================

const PROHIBIDAS: ReadonlySet<string> = new Set(["noob", "manco", "basura"]);
const SPAM_MENSAJES: number = 3;
const SPAM_VENTANA_SEG: number = 2;
const SILENCIO_SEG: number = 10;

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

class ServidorChat {
  private readonly conectados: Set<string> = new Set();
  private readonly pendientes: Map<string, Mensaje[]> = new Map();
  private readonly historial: Map<string, number[]> = new Map(); // segundos de los ultimos mensajes
  private readonly silenciadoHasta: Map<string, number> = new Map();
  private readonly ignorados: Map<string, Set<string>> = new Map(); // quien -> a quienes silencio
  public readonly eventos: Emisor<EventosChat> = new Emisor<EventosChat>();

  constructor(private readonly equipo: readonly string[]) {
    equipo.forEach((j) => this.conectados.add(j));
  }

  desconectar(j: string): void {
    this.conectados.delete(j);
  }

  async reconectar(j: string): Promise<void> {
    await esperar(5);
    this.conectados.add(j);
    const cola: Mensaje[] = this.pendientes.get(j) ?? [];
    this.pendientes.delete(j);
    cola.forEach((m) => this.eventos.emit("entregado", { a: j, mensaje: m, diferido: true }));
  }

  private censurar(texto: string): { texto: string; cambios: number } {
    let cambios: number = 0;
    const limpio: string = texto
      .split(" ")
      .map((p) => (PROHIBIDAS.has(p.toLowerCase()) ? (cambios++, "*".repeat(p.length)) : p))
      .join(" ");
    return { texto: limpio, cambios };
  }

  private controlarSpam(de: string, segundo: number): void {
    const hasta: number | undefined = this.silenciadoHasta.get(de);
    if (hasta !== undefined && segundo < hasta) throw new ErrorSilenciado(de, hasta);
    const recientes: number[] = [...(this.historial.get(de) ?? []), segundo].filter((s) => segundo - s < SPAM_VENTANA_SEG);
    this.historial.set(de, recientes);
    if (recientes.length >= SPAM_MENSAJES) {
      this.silenciadoHasta.set(de, segundo + SILENCIO_SEG);
      this.historial.set(de, []);
      this.eventos.emit("silenciado", { jugador: de, hasta: segundo + SILENCIO_SEG });
      throw new ErrorSilenciado(de, segundo + SILENCIO_SEG);
    }
  }

  async enviar(m: Mensaje): Promise<number> {
    await esperar(3); // latencia de red
    if (!this.equipo.includes(m.de)) throw new ErrorRemitente(m.de);
    let contenido: Contenido = m.contenido;

    if (contenido.tipo === "texto") {
      if (contenido.texto.trim() === "") throw new ErrorMensajeInvalido("mensaje vacio");
      if (contenido.texto.length > 80) throw new ErrorMensajeInvalido(`mensaje de ${contenido.texto.length} caracteres (maximo 80)`);
    }
    if (contenido.tipo === "ping" && (contenido.x < 0 || contenido.x > 100 || contenido.y < 0 || contenido.y > 100)) {
      throw new ErrorMensajeInvalido(`ping fuera del mapa (${contenido.x}, ${contenido.y})`);
    }
    if (contenido.tipo === "comando") {
      const lista: Set<string> = this.ignorados.get(m.de) ?? new Set();
      if (contenido.nombre === "mute") lista.add(contenido.objetivo);
      else lista.delete(contenido.objetivo);
      this.ignorados.set(m.de, lista);
      return 0; // los comandos no se reparten
    }

    this.controlarSpam(m.de, m.segundo);
    if (contenido.tipo === "texto") {
      const { texto, cambios } = this.censurar(contenido.texto);
      if (cambios > 0) {
        contenido = { tipo: "texto", texto };
        this.eventos.emit("censurado", { de: m.de, palabras: cambios });
      }
    }

    const final: Mensaje = { ...m, contenido };
    let entregas: number = 0;
    for (const destino of this.equipo.filter((j) => j !== m.de)) {
      if (this.ignorados.get(destino)?.has(m.de)) continue;
      if (this.conectados.has(destino)) {
        this.eventos.emit("entregado", { a: destino, mensaje: final, diferido: false });
      } else {
        this.pendientes.set(destino, [...(this.pendientes.get(destino) ?? []), final]);
      }
      entregas++;
    }
    return entregas;
  }
}

// ===================== SALIDA =====================

function mostrar(c: Contenido): string {
  switch (c.tipo) {
    case "texto":
      return `"${c.texto}"`;
    case "ping":
      return `[PING ${c.intencion.toUpperCase()} en (${c.x}, ${c.y})]`;
    case "alerta":
      return `[ALERTA: ${c.enemigo} no esta en ${c.linea}]`;
    case "comando":
      return `/${c.nombre} ${c.objetivo}`;
  }
}

async function main(): Promise<void> {
  const servidor: ServidorChat = new ServidorChat(["Kai", "Lyra", "Rex", "Mia", "Zed"]);
  const recibidos: Map<string, string[]> = new Map();
  servidor.eventos.on("entregado", ({ a, mensaje, diferido }) => {
    recibidos.set(a, [...(recibidos.get(a) ?? []), `${diferido ? "(al volver) " : ""}${mensaje.de}: ${mostrar(mensaje.contenido)}`]);
  });
  servidor.eventos.on("censurado", ({ de, palabras }) => console.log(`   ! ${palabras} palabra(s) censurada(s) a ${de}`));
  servidor.eventos.on("silenciado", ({ jugador, hasta }) => console.log(`   ! ${jugador} silenciado por spam hasta el segundo ${hasta}`));

  servidor.desconectar("Zed");
  const envios: Mensaje[] = [
    { de: "Kai", segundo: 60, contenido: { tipo: "ping", x: 50, y: 50, intencion: "atacar" } },
    { de: "Lyra", segundo: 61, contenido: { tipo: "alerta", linea: "mid", enemigo: "Vex" } },
    { de: "Mia", segundo: 62, contenido: { tipo: "comando", nombre: "mute", objetivo: "Rex" } },
    { de: "Rex", segundo: 63, contenido: { tipo: "texto", texto: "que noob ese tirador" } },
    { de: "Rex", segundo: 64, contenido: { tipo: "texto", texto: "vamos dragon" } },
    { de: "Rex", segundo: 64, contenido: { tipo: "texto", texto: "YA" } }, // 3er mensaje en 2 s -> silenciado hasta el 74
    { de: "Rex", segundo: 65, contenido: { tipo: "texto", texto: "YAAA" } },
    { de: "Rex", segundo: 70, contenido: { tipo: "texto", texto: "perdon" } }, // sigue silenciado
    { de: "Kai", segundo: 75, contenido: { tipo: "texto", texto: "" } },
    { de: "Lyra", segundo: 76, contenido: { tipo: "ping", x: 130, y: 20, intencion: "cuidado" } },
    { de: "Bot", segundo: 77, contenido: { tipo: "texto", texto: "hola" } },
    { de: "Rex", segundo: 74, contenido: { tipo: "texto", texto: "limite: justo cuando termina el silencio" } }, // 64 + 10 = 74 -> ya puede
    { de: "Lyra", segundo: 80, contenido: { tipo: "texto", texto: "Zed vuelve pronto?" } },
  ];

  console.log("==================== ENVIOS ====================");
  for (const m of envios) {
    try {
      const n: number = await servidor.enviar(m);
      console.log(`s${m.segundo} ${m.de.padEnd(4)} ${mostrar(m.contenido).padEnd(42)} -> ${m.contenido.tipo === "comando" ? "aplicado" : `entregado a ${n}`}`);
    } catch (e: unknown) {
      if (e instanceof ErrorSilenciado || e instanceof ErrorMensajeInvalido || e instanceof ErrorRemitente) {
        console.log(`s${m.segundo} ${m.de.padEnd(4)} ${mostrar(m.contenido).padEnd(42)} -> X [${e.name}] ${e.message}`);
      } else throw e;
    }
  }

  await servidor.reconectar("Zed");

  console.log("\n==================== LO QUE VIO CADA JUGADOR ====================");
  for (const j of ["Kai", "Lyra", "Rex", "Mia", "Zed"]) {
    console.log(`${j}:`);
    (recibidos.get(j) ?? ["(nada)"]).forEach((l) => console.log(`   ${l}`));
  }
}

main();
