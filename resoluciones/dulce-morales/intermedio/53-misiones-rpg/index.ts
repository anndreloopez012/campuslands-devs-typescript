export {};

// Intermedio 53: Gestor de misiones RPG
// Tematica: videojuegos RPG
// Resolucion: Dulce Morales
//
// Problema: un grupo de aventureros tiene un tablero de misiones. Algunas misiones requieren haber
// completado otras antes, o un nivel minimo. Las misiones tardan en completarse (son asincronas),
// el grupo puede hacer como maximo 2 a la vez, y una mision puede fallar (se reintenta una vez).
// Al completar misiones se gana experiencia y el grupo sube de nivel. Todo se avisa con eventos
// tipados y los problemas con errores tipados.

// ===================== TIPOS =====================

type Dificultad = "facil" | "media" | "dificil" | "epica";

interface Mision {
  readonly id: string;
  readonly nombre: string;
  readonly dificultad: Dificultad;
  readonly duracionMs: number;
  readonly nivelMinimo: number;
  readonly requiere: readonly string[];
  readonly xp: number;
  readonly oro: number;
}

// ===================== ERRORES TIPADOS =====================

class ErrorCiclo extends Error {
  constructor(public readonly misiones: readonly string[]) {
    super(`dependencias en circulo: ${misiones.join(" -> ")}`);
    this.name = "ErrorCiclo";
  }
}

class ErrorRequisitoFaltante extends Error {
  constructor(public readonly mision: string, public readonly faltante: string) {
    super(`"${mision}" requiere "${faltante}", que no existe en el tablero`);
    this.name = "ErrorRequisitoFaltante";
  }
}

class ErrorMisionFallida extends Error {
  constructor(public readonly mision: string, public readonly intentos: number) {
    super(`"${mision}" fallo ${intentos} veces`);
    this.name = "ErrorMisionFallida";
  }
}

// ===================== EVENTOS TIPADOS =====================

interface EventosGremio {
  iniciada: { readonly mision: Mision; readonly intento: number };
  completada: { readonly mision: Mision; readonly xpTotal: number };
  fallo: { readonly mision: Mision; readonly intento: number };
  "sube de nivel": { readonly nivel: number };
  bloqueada: { readonly mision: Mision; readonly motivo: string };
}

class Emisor<E> {
  private readonly oyentes: { [K in keyof E]?: ((d: E[K]) => void)[] } = {};

  on<K extends keyof E>(evento: K, fn: (d: E[K]) => void): void {
    (this.oyentes[evento] ??= []).push(fn);
  }

  emit<K extends keyof E>(evento: K, dato: E[K]): void {
    this.oyentes[evento]?.forEach((fn) => fn(dato));
  }
}

// ===================== UTILIDADES =====================

const esperar = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const PROB_FALLA: Readonly<Record<Dificultad, number>> = { facil: 0.05, media: 0.2, dificil: 0.35, epica: 0.5 };
const XP_POR_NIVEL: number = 300;
const MAX_SIMULTANEAS: number = 2;

function crearAleatorio(semilla: number): () => number {
  let s: number = semilla >>> 0;
  return (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t: number = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ===================== GESTOR =====================

class GestorMisiones {
  private readonly completadas: Set<string> = new Set();
  private xp: number = 0;
  private oro: number = 0;
  public readonly eventos: Emisor<EventosGremio> = new Emisor<EventosGremio>();

  constructor(private readonly misiones: readonly Mision[], private readonly aleatorio: () => number) {}

  get nivel(): number {
    return 1 + Math.floor(this.xp / XP_POR_NIVEL);
  }

  get resumen(): { xp: number; oro: number; nivel: number; completadas: number } {
    return { xp: this.xp, oro: this.oro, nivel: this.nivel, completadas: this.completadas.size };
  }

  // Revisa que no falten requisitos y que no haya dependencias en circulo
  validarTablero(): void {
    const ids: Set<string> = new Set(this.misiones.map((m) => m.id));
    for (const m of this.misiones) {
      const falta: string | undefined = m.requiere.find((r) => !ids.has(r));
      if (falta !== undefined) throw new ErrorRequisitoFaltante(m.nombre, falta);
    }
    const visitando: Set<string> = new Set();
    const listas: Set<string> = new Set();
    const visitar = (id: string, camino: string[]): void => {
      if (listas.has(id)) return;
      if (visitando.has(id)) throw new ErrorCiclo([...camino, id]);
      visitando.add(id);
      this.misiones.find((x) => x.id === id)?.requiere.forEach((r) => visitar(r, [...camino, id]));
      visitando.delete(id);
      listas.add(id);
    };
    this.misiones.forEach((m) => visitar(m.id, []));
  }

  private async intentar(m: Mision): Promise<void> {
    for (let intento = 1; intento <= 2; intento++) {
      this.eventos.emit("iniciada", { mision: m, intento });
      await esperar(m.duracionMs);
      if (this.aleatorio() >= PROB_FALLA[m.dificultad]) {
        const nivelAntes: number = this.nivel;
        this.xp += m.xp;
        this.oro += m.oro;
        this.completadas.add(m.id);
        this.eventos.emit("completada", { mision: m, xpTotal: this.xp });
        if (this.nivel > nivelAntes) this.eventos.emit("sube de nivel", { nivel: this.nivel });
        return;
      }
      this.eventos.emit("fallo", { mision: m, intento });
    }
    throw new ErrorMisionFallida(m.nombre, 2);
  }

  // Ejecuta en tandas: en cada tanda, hasta 2 misiones disponibles a la vez (Promise.allSettled)
  async ejecutar(): Promise<string[]> {
    this.validarTablero();
    const fallidas: Set<string> = new Set();
    const errores: string[] = [];

    while (true) {
      const disponibles: Mision[] = this.misiones.filter(
        (m) => !this.completadas.has(m.id) && !fallidas.has(m.id) && m.requiere.every((r) => this.completadas.has(r)) && this.nivel >= m.nivelMinimo,
      );
      if (disponibles.length === 0) break;
      const tanda: Mision[] = disponibles.slice(0, MAX_SIMULTANEAS);
      const resultados = await Promise.allSettled(tanda.map((m) => this.intentar(m)));
      resultados.forEach((r, i) => {
        const m: Mision | undefined = tanda[i];
        if (r.status === "rejected" && m !== undefined) {
          fallidas.add(m.id);
          errores.push(r.reason instanceof ErrorMisionFallida ? `[${r.reason.name}] ${r.reason.message}` : String(r.reason));
        }
      });
    }

    // Las que no se pudieron hacer, con su motivo
    for (const m of this.misiones.filter((x) => !this.completadas.has(x.id) && !fallidas.has(x.id))) {
      const falta: string | undefined = m.requiere.find((r) => !this.completadas.has(r));
      const motivo: string = falta !== undefined ? `requiere "${this.misiones.find((x) => x.id === falta)?.nombre}"` : `requiere nivel ${m.nivelMinimo} (grupo nivel ${this.nivel})`;
      this.eventos.emit("bloqueada", { mision: m, motivo });
    }
    return errores;
  }
}

// ===================== DATOS Y SALIDA =====================

const tablero: readonly Mision[] = [
  { id: "M1", nombre: "Ratas en la bodega", dificultad: "facil", duracionMs: 20, nivelMinimo: 1, requiere: [], xp: 120, oro: 15 },
  { id: "M2", nombre: "Escoltar al mercader", dificultad: "facil", duracionMs: 30, nivelMinimo: 1, requiere: [], xp: 150, oro: 40 },
  { id: "M3", nombre: "Bandidos del puente", dificultad: "media", duracionMs: 30, nivelMinimo: 1, requiere: ["M2"], xp: 220, oro: 60 },
  { id: "M4", nombre: "Cueva de las aranas", dificultad: "dificil", duracionMs: 40, nivelMinimo: 2, requiere: ["M1"], xp: 300, oro: 90 },
  { id: "M5", nombre: "El lich del pantano", dificultad: "epica", duracionMs: 50, nivelMinimo: 3, requiere: ["M3", "M4"], xp: 600, oro: 300 },
  { id: "M6", nombre: "Dragon de la montana", dificultad: "epica", duracionMs: 60, nivelMinimo: 6, requiere: ["M5"], xp: 1000, oro: 800 },
];

async function main(): Promise<void> {
  // Validaciones del tablero
  const base: Mision = { id: "X", nombre: "Prueba", dificultad: "facil", duracionMs: 10, nivelMinimo: 1, requiere: [], xp: 10, oro: 1 };
  const tablerosMalos: readonly [string, readonly Mision[]][] = [
    ["ciclo", [{ ...base, id: "A", requiere: ["B"] }, { ...base, id: "B", requiere: ["C"] }, { ...base, id: "C", requiere: ["A"] }]],
    ["requisito inexistente", [{ ...base, nombre: "Ratas en la bodega", requiere: ["M99"] }]],
  ];
  for (const [nombre, misiones] of tablerosMalos) {
    try {
      new GestorMisiones(misiones, crearAleatorio(1)).validarTablero();
    } catch (e: unknown) {
      if (e instanceof ErrorCiclo || e instanceof ErrorRequisitoFaltante) console.log(`Validacion (${nombre}): [${e.name}] ${e.message}`);
    }
  }

  const gestor: GestorMisiones = new GestorMisiones(tablero, crearAleatorio(7));
  gestor.eventos.on("iniciada", ({ mision, intento }) => console.log(`  > inicia "${mision.nombre}" (${mision.dificultad})${intento > 1 ? ` - reintento ${intento}` : ""}`));
  gestor.eventos.on("completada", ({ mision, xpTotal }) => console.log(`  OK "${mision.nombre}" +${mision.xp} xp, +${mision.oro} oro (xp total ${xpTotal})`));
  gestor.eventos.on("fallo", ({ mision, intento }) => console.log(`  X  "${mision.nombre}" fallo en el intento ${intento}`));
  gestor.eventos.on("sube de nivel", ({ nivel }) => console.log(`  ** El grupo sube a nivel ${nivel} **`));
  gestor.eventos.on("bloqueada", ({ mision, motivo }) => console.log(`  -  "${mision.nombre}" no se pudo hacer: ${motivo}`));

  console.log("\n================ JORNADA DEL GREMIO (max 2 misiones a la vez) ================");
  const errores: string[] = await gestor.ejecutar();
  errores.forEach((e: string): void => console.log(`  ${e}`));

  const r = gestor.resumen;
  console.log(`\nResultado: ${r.completadas} misiones completadas | nivel ${r.nivel} | ${r.xp} xp | ${r.oro} de oro`);
}

main();
