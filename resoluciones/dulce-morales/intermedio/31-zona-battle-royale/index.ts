export {};

// Intermedio 31: Simulador de zona battle royale
// Tematica: videojuegos battle royale
// Resolucion: Dulce Morales
//
// Problema: en un battle royale la zona segura se cierra por fases. Quien queda fuera recibe dano
// cada segundo (mas dano en cada fase). Los jugadores corren hacia el centro a su velocidad.
// Hay que simular las fases, registrar los eventos (entrar a zona, recibir dano, curarse, ser
// eliminado) y mostrar en que lugar quedo cada jugador.

// ===================== TIPOS =====================

type Fase = 1 | 2 | 3 | 4;

interface Punto {
  readonly x: number;
  readonly y: number;
}

// Eventos de la partida: union discriminada por "tipo"
type Evento =
  | { readonly tipo: "dano"; readonly fase: Fase; readonly jugador: string; readonly cantidad: number; readonly vidaRestante: number }
  | { readonly tipo: "curacion"; readonly fase: Fase; readonly jugador: string; readonly cantidad: number }
  | { readonly tipo: "entra a zona"; readonly fase: Fase; readonly jugador: string }
  | { readonly tipo: "eliminado"; readonly fase: Fase; readonly jugador: string; readonly puesto: number };

// Type guard: permite filtrar solo las eliminaciones y que TypeScript sepa que tienen "puesto"
function esEliminacion(e: Evento): e is Extract<Evento, { tipo: "eliminado" }> {
  return e.tipo === "eliminado";
}

function esDano(e: Evento): e is Extract<Evento, { tipo: "dano" }> {
  return e.tipo === "dano";
}

// ===================== CLASES =====================

class Zona {
  constructor(
    public readonly centro: Punto,
    private radio: number,
  ) {}

  get radioActual(): number {
    return this.radio;
  }

  // El borde cuenta como dentro (distancia <= radio)
  contiene(p: Punto): boolean {
    return distancia(p, this.centro) <= this.radio;
  }

  cerrar(nuevoRadio: number): void {
    if (nuevoRadio <= 0 || nuevoRadio >= this.radio) throw new Error(`radio invalido: ${nuevoRadio}`);
    this.radio = nuevoRadio;
  }
}

class Jugador {
  private vida: number = 100;
  private botiquines: number;
  private posicion: Punto;

  constructor(
    public readonly nombre: string,
    posicion: Punto,
    public readonly velocidad: number, // metros por segundo
    botiquines: number,
  ) {
    this.posicion = posicion;
    this.botiquines = botiquines;
  }

  get vivo(): boolean {
    return this.vida > 0;
  }

  get vidaActual(): number {
    return this.vida;
  }

  get lugar(): Punto {
    return this.posicion;
  }

  // Avanza en linea recta hacia un destino, sin pasarse
  moverHacia(destino: Punto, segundos: number): void {
    const d: number = distancia(this.posicion, destino);
    const paso: number = Math.min(d, this.velocidad * segundos);
    if (d === 0) return;
    this.posicion = {
      x: this.posicion.x + ((destino.x - this.posicion.x) / d) * paso,
      y: this.posicion.y + ((destino.y - this.posicion.y) / d) * paso,
    };
  }

  recibirDano(cantidad: number): void {
    this.vida = Math.max(0, this.vida - cantidad);
  }

  // Usa un botiquin si la vida baja de 50
  intentarCurarse(): number {
    if (this.vida >= 50 || this.botiquines === 0 || !this.vivo) return 0;
    this.botiquines -= 1;
    const antes: number = this.vida;
    this.vida = Math.min(100, this.vida + 50);
    return this.vida - antes;
  }
}

// Ranking generico: sirve para ordenar cualquier cosa por un valor numerico
class Ranking<T> {
  private readonly entradas: { item: T; valor: number }[] = [];

  agregar(item: T, valor: number): void {
    this.entradas.push({ item, valor });
  }

  ordenado(): readonly { item: T; valor: number }[] {
    return [...this.entradas].sort((a, b): number => a.valor - b.valor);
  }
}

// ===================== SIMULACION =====================

function distancia(a: Punto, b: Punto): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

interface ConfigFase {
  readonly fase: Fase;
  readonly radio: number;
  readonly segundos: number;
  readonly danoPorSegundo: number;
}

const FASES: readonly ConfigFase[] = [
  { fase: 1, radio: 800, segundos: 60, danoPorSegundo: 1 },
  { fase: 2, radio: 400, segundos: 60, danoPorSegundo: 2 },
  { fase: 3, radio: 150, segundos: 45, danoPorSegundo: 5 },
  { fase: 4, radio: 40, segundos: 30, danoPorSegundo: 10 },
];

function simular(jugadores: readonly Jugador[], zona: Zona): Evento[] {
  const eventos: Evento[] = [];
  let quedan: number = jugadores.length;
  const fuera: Set<string> = new Set(jugadores.filter((j) => !zona.contiene(j.lugar)).map((j) => j.nombre));

  for (const cfg of FASES) {
    zona.cerrar(cfg.radio);
    for (let s = 1; s <= cfg.segundos; s++) {
      for (const j of jugadores) {
        if (!j.vivo) continue;
        j.moverHacia(zona.centro, 1);
        if (zona.contiene(j.lugar)) {
          if (fuera.has(j.nombre)) {
            fuera.delete(j.nombre);
            eventos.push({ tipo: "entra a zona", fase: cfg.fase, jugador: j.nombre });
          }
          continue;
        }
        fuera.add(j.nombre);
        j.recibirDano(cfg.danoPorSegundo);
        const curado: number = j.intentarCurarse();
        if (curado > 0) eventos.push({ tipo: "curacion", fase: cfg.fase, jugador: j.nombre, cantidad: curado });
        if (!j.vivo) {
          eventos.push({ tipo: "eliminado", fase: cfg.fase, jugador: j.nombre, puesto: quedan });
          quedan -= 1;
        }
      }
    }
    // Resumen de dano de la fase
    for (const j of jugadores) {
      if (j.vivo && fuera.has(j.nombre)) {
        eventos.push({ tipo: "dano", fase: cfg.fase, jugador: j.nombre, cantidad: cfg.danoPorSegundo, vidaRestante: j.vidaActual });
      }
    }
  }
  return eventos;
}

// ===================== DATOS Y SALIDA =====================

function crearJugadores(): Jugador[] {
  return [
    new Jugador("Nova", { x: 100, y: 50 }, 6, 1),
    new Jugador("Ghost", { x: 900, y: 0 }, 5, 2),
    new Jugador("Raven", { x: 0, y: 1100 }, 4, 1),
    new Jugador("Bolt", { x: 1500, y: 1500 }, 7, 0),
    new Jugador("Tank", { x: -1300, y: 0 }, 3, 3),
    // Limite: empieza EXACTO en el borde de la primera zona (radio 800) -> cuenta como dentro
    new Jugador("Edge", { x: 0, y: -800 }, 2, 0),
  ];
}

function main(): void {
  const jugadores: Jugador[] = crearJugadores();
  const zona: Zona = new Zona({ x: 0, y: 0 }, 1000);

  // Validacion de la configuracion: cada fase debe cerrar la zona
  try {
    new Zona({ x: 0, y: 0 }, 100).cerrar(200);
  } catch (e: unknown) {
    console.log(`Validacion de zona: ${e instanceof Error ? e.message : "error"} (no se puede agrandar)\n`);
  }

  const eventos: Evento[] = simular(jugadores, zona);

  console.log("==================== FASES DE LA ZONA ====================");
  for (const cfg of FASES) {
    const deLaFase: Evento[] = eventos.filter((e: Evento): boolean => e.fase === cfg.fase);
    console.log(`\nFase ${cfg.fase}: radio ${cfg.radio} m, ${cfg.segundos} s, ${cfg.danoPorSegundo} de dano/s fuera`);
    deLaFase.forEach((e: Evento): void => {
      switch (e.tipo) {
        case "entra a zona":
          console.log(`  ${e.jugador} entra a la zona`);
          break;
        case "curacion":
          console.log(`  ${e.jugador} usa un botiquin (+${e.cantidad})`);
          break;
        case "dano":
          console.log(`  ${e.jugador} termina la fase fuera de la zona con ${e.vidaRestante} de vida`);
          break;
        case "eliminado":
          console.log(`  ${e.jugador} ELIMINADO por la zona (puesto ${e.puesto})`);
          break;
      }
    });
    if (deLaFase.length === 0) console.log("  sin eventos");
  }

  console.log("\n==================== RESULTADO FINAL ====================");
  const ranking: Ranking<string> = new Ranking<string>();
  const eliminaciones = eventos.filter(esEliminacion);
  eliminaciones.forEach((e): void => ranking.agregar(e.jugador, e.puesto));
  const vivos: Jugador[] = jugadores.filter((j: Jugador): boolean => j.vivo);
  vivos.forEach((j: Jugador, i: number): void => ranking.agregar(j.nombre, i + 1));
  ranking.ordenado().forEach(({ item, valor }): void => {
    const j: Jugador | undefined = jugadores.find((x) => x.nombre === item);
    console.log(`#${valor} ${item.padEnd(6)} ${j?.vivo ? `vivo con ${j.vidaActual} de vida` : "eliminado por la zona"}`);
  });
  const danoTotal: number = eventos.filter(esDano).length;
  console.log(`Fases terminadas fuera de zona: ${danoTotal} | eliminados: ${eliminaciones.length} | sobreviven: ${vivos.length}`);
}

main();
