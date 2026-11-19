export {};

// Intermedio 38: Setlist de concierto
// Tematica: musica en vivo
// Resolucion: Dulce Morales
//
// Problema: una banda arma propuestas de setlist (orden del concierto) que mezclan canciones,
// solos y momentos de hablar con el publico. Hay que validar cada propuesta contra las reglas
// del show (duracion, cambios de afinacion, canciones obligatorias, cierre con un hit) y darle
// un puntaje para elegir la mejor.

// ===================== TIPOS =====================

type TipoCancion = "hit" | "nueva" | "balada" | "cover";
type Afinacion = "estandar" | "drop D" | "medio tono abajo";

interface Cancion {
  readonly titulo: string;
  readonly tipo: TipoCancion;
  readonly duracionSeg: number;
  readonly energia: number; // 1 a 10
  readonly afinacion: Afinacion;
}

// Elementos del show: union discriminada
type Elemento =
  | { readonly clase: "cancion"; readonly cancion: Cancion }
  | { readonly clase: "solo"; readonly instrumento: string; readonly duracionSeg: number }
  | { readonly clase: "habla"; readonly duracionSeg: number }
  | { readonly clase: "encore" }; // separa el set principal del cierre

function esCancion(e: Elemento): e is Extract<Elemento, { clase: "cancion" }> {
  return e.clase === "cancion";
}

interface Evaluacion {
  readonly errores: readonly string[];
  readonly avisos: readonly string[];
  readonly duracionSeg: number;
  readonly puntaje: number;
}

// ===================== REGLAS =====================

const DURACION_MAXIMA_SEG: number = 75 * 60;
const CAMBIO_AFINACION_SEG: number = 90; // tiempo muerto al cambiar de afinacion
const OBLIGATORIAS: ReadonlySet<string> = new Set(["Ciudad de Neon", "Ultimo Tren"]); // sencillos del disco nuevo
const MAX_BALADAS_SEGUIDAS: number = 2;

// ===================== CLASE =====================

class Setlist {
  constructor(
    public readonly nombre: string,
    private readonly elementos: readonly Elemento[],
  ) {}

  get canciones(): Cancion[] {
    return this.elementos.filter(esCancion).map((e) => e.cancion);
  }

  private duracionDe(e: Elemento): number {
    switch (e.clase) {
      case "cancion":
        return e.cancion.duracionSeg;
      case "solo":
      case "habla":
        return e.duracionSeg;
      case "encore":
        return 120; // la banda sale y vuelve
    }
  }

  // Cuenta los cambios de afinacion entre canciones consecutivas
  cambiosDeAfinacion(): number {
    const lista: Cancion[] = this.canciones;
    return lista.slice(1).filter((c: Cancion, i: number): boolean => c.afinacion !== lista[i]?.afinacion).length;
  }

  duracionTotal(): number {
    const base: number = this.elementos.reduce((t: number, e: Elemento): number => t + this.duracionDe(e), 0);
    return base + this.cambiosDeAfinacion() * CAMBIO_AFINACION_SEG;
  }

  evaluar(): Evaluacion {
    const errores: string[] = [];
    const avisos: string[] = [];
    const lista: Cancion[] = this.canciones;
    const duracion: number = this.duracionTotal();

    if (duracion > DURACION_MAXIMA_SEG) errores.push(`dura ${mmss(duracion)} (maximo ${mmss(DURACION_MAXIMA_SEG)})`);

    const titulos: string[] = lista.map((c: Cancion): string => c.titulo);
    const repetidas: string[] = titulos.filter((t: string, i: number): boolean => titulos.indexOf(t) !== i);
    if (repetidas.length > 0) errores.push(`canciones repetidas: ${repetidas.join(", ")}`);

    const faltan: string[] = [...OBLIGATORIAS].filter((t: string): boolean => !titulos.includes(t));
    if (faltan.length > 0) errores.push(`faltan las obligatorias: ${faltan.join(", ")}`);

    const iEncore: number = this.elementos.findIndex((e: Elemento): boolean => e.clase === "encore");
    if (iEncore === -1) {
      errores.push("no tiene encore");
    } else {
      const ultima: Cancion | undefined = this.elementos.slice(iEncore).filter(esCancion).map((e) => e.cancion).pop();
      if (ultima === undefined || ultima.tipo !== "hit") errores.push("el show debe cerrar con un hit");
    }

    // Baladas seguidas
    let seguidas: number = 0;
    for (const c of lista) {
      seguidas = c.tipo === "balada" ? seguidas + 1 : 0;
      if (seguidas > MAX_BALADAS_SEGUIDAS) {
        avisos.push(`${seguidas} baladas seguidas (hasta "${c.titulo}"): el publico se enfria`);
        break;
      }
    }

    const primera: Cancion | undefined = lista[0];
    if (primera !== undefined && primera.energia < 7) avisos.push(`abre con poca energia (${primera.energia})`);
    if (this.cambiosDeAfinacion() > 4) avisos.push(`${this.cambiosDeAfinacion()} cambios de afinacion: muchos tiempos muertos`);

    // Puntaje: energia promedio + hits + variedad - avisos - tiempos muertos
    const energia: number = lista.reduce((s: number, c: Cancion): number => s + c.energia, 0) / Math.max(1, lista.length);
    const hits: number = lista.filter((c: Cancion): boolean => c.tipo === "hit").length;
    const tipos: number = new Set(lista.map((c: Cancion): TipoCancion => c.tipo)).size;
    const puntaje: number = errores.length > 0 ? 0 : Math.round(energia * 8 + hits * 3 + tipos * 2 - avisos.length * 5 - this.cambiosDeAfinacion() * 2);
    return { errores, avisos, duracionSeg: duracion, puntaje };
  }
}

function mmss(seg: number): string {
  return `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, "0")}`;
}

// ===================== DATOS =====================

const c = (titulo: string, tipo: TipoCancion, dur: string, energia: number, afinacion: Afinacion = "estandar"): Elemento => {
  const [m, s] = dur.split(":").map(Number);
  return { clase: "cancion", cancion: { titulo, tipo, duracionSeg: (m ?? 0) * 60 + (s ?? 0), energia, afinacion } };
};
const ENCORE: Elemento = { clase: "encore" };

const propuestas: readonly Setlist[] = [
  new Setlist("A - Clasica", [
    c("Ciudad de Neon", "nueva", "4:10", 9), c("Fuego Lento", "hit", "3:50", 8), c("Asfalto", "hit", "4:20", 9, "drop D"),
    { clase: "habla", duracionSeg: 90 }, c("Ultimo Tren", "nueva", "4:40", 7, "drop D"), c("Marea", "balada", "5:10", 4),
    c("Siempre Tu", "balada", "4:30", 4), c("Rompe el Silencio", "hit", "3:40", 9), { clase: "solo", instrumento: "bateria", duracionSeg: 180 },
    c("Electrico", "cover", "4:00", 8), c("Noches de Agosto", "hit", "4:50", 8),
    ENCORE, c("Volver a Empezar", "balada", "5:00", 5), c("Himno", "hit", "6:10", 10),
  ]),
  new Setlist("B - Todo energia", [
    c("Asfalto", "hit", "4:20", 9, "drop D"), c("Ciudad de Neon", "nueva", "4:10", 9), c("Electrico", "cover", "4:00", 8, "medio tono abajo"),
    c("Fuego Lento", "hit", "3:50", 8), c("Rompe el Silencio", "hit", "3:40", 9, "drop D"), c("Ultimo Tren", "nueva", "4:40", 7, "medio tono abajo"),
    c("Noches de Agosto", "hit", "4:50", 8), ENCORE, c("Himno", "hit", "6:10", 10, "drop D"),
  ]),
  new Setlist("C - Acustica", [
    c("Marea", "balada", "5:10", 4), c("Siempre Tu", "balada", "4:30", 4), c("Volver a Empezar", "balada", "5:00", 5),
    c("Ultimo Tren", "nueva", "4:40", 7), c("Fuego Lento", "hit", "3:50", 8), ENCORE, c("Ciudad de Neon", "nueva", "4:10", 9),
  ]),
  new Setlist("D - Demasiado larga", [
    c("Himno", "hit", "6:10", 10), c("Ciudad de Neon", "nueva", "4:10", 9), c("Ultimo Tren", "nueva", "4:40", 7),
    { clase: "solo", instrumento: "guitarra", duracionSeg: 600 }, { clase: "habla", duracionSeg: 900 }, c("Marea", "balada", "5:10", 4),
    c("Asfalto", "hit", "4:20", 9), { clase: "solo", instrumento: "bajo", duracionSeg: 900 }, c("Fuego Lento", "hit", "3:50", 8),
    c("Himno", "hit", "6:10", 10), ENCORE, c("Noches de Agosto", "hit", "4:50", 8),
  ]),
  new Setlist("E - Solo los viejos exitos", [
    c("Asfalto", "hit", "4:20", 9), c("Fuego Lento", "hit", "3:50", 8), c("Rompe el Silencio", "hit", "3:40", 9),
    c("Noches de Agosto", "hit", "4:50", 8), ENCORE, c("Himno", "hit", "6:10", 10),
  ]),
];

// ===================== SALIDA =====================

function main(): void {
  console.log(`================ PROPUESTAS DE SETLIST (maximo ${mmss(DURACION_MAXIMA_SEG)}) ================`);
  const evaluadas = propuestas.map((s: Setlist) => ({ setlist: s, ev: s.evaluar() }));
  for (const { setlist, ev } of evaluadas) {
    console.log(`\n${setlist.nombre}: ${setlist.canciones.length} canciones, ${mmss(ev.duracionSeg)}, ${setlist.cambiosDeAfinacion()} cambio(s) de afinacion`);
    ev.errores.forEach((e: string): void => console.log(`  X ${e}`));
    ev.avisos.forEach((a: string): void => console.log(`  ! ${a}`));
    console.log(`  Puntaje: ${ev.puntaje}${ev.errores.length > 0 ? " (invalida)" : ""}`);
  }

  const ganadora = evaluadas.filter((x) => x.ev.errores.length === 0).sort((a, b): number => b.ev.puntaje - a.ev.puntaje)[0];
  if (ganadora !== undefined) {
    console.log(`\n================ ELEGIDA: ${ganadora.setlist.nombre} ================`);
    ganadora.setlist.canciones.forEach((cn: Cancion, i: number): void => {
      console.log(`${String(i + 1).padStart(2)}. ${cn.titulo.padEnd(18)} ${cn.tipo.padEnd(7)} energia ${"#".repeat(cn.energia)}`);
    });
  }
}

main();
