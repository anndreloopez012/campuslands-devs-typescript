export {};

// Intermedio 32: Temporada modo carrera
// Tematica: futbol (modo carrera de un videojuego)
// Resolucion: Dulce Morales
//
// Problema: en el modo carrera diriges un club durante una temporada. Cada partido se simula
// segun la media del once titular contra la del rival (con un generador con semilla para que
// sea repetible). Hay lesiones, goles y jugadores jovenes que mejoran. Al final se compara
// el resultado con el objetivo que puso la directiva y se revisa el presupuesto de salarios.

// ===================== TIPOS =====================

type Posicion = "POR" | "DEF" | "MED" | "DEL";
type Objetivo = "campeonar" | "top 4" | "mitad de tabla" | "no descender";
type Resultado = "V" | "E" | "D";

type Suceso =
  | { readonly tipo: "gol"; readonly jugador: string }
  | { readonly tipo: "lesion"; readonly jugador: string; readonly partidos: number }
  | { readonly tipo: "mejora"; readonly jugador: string; readonly antes: number; readonly despues: number };

function esGol(s: Suceso): s is Extract<Suceso, { tipo: "gol" }> {
  return s.tipo === "gol";
}

function esLesion(s: Suceso): s is Extract<Suceso, { tipo: "lesion" }> {
  return s.tipo === "lesion";
}

// ===================== GENERADOR CON SEMILLA =====================

function crearAleatorio(semilla: number): () => number {
  let estado: number = semilla >>> 0;
  return (): number => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t: number = Math.imul(estado ^ (estado >>> 15), estado | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ===================== CLASES =====================

class Futbolista {
  private media: number;
  private partidosLesionado: number = 0;
  private partidosJugados: number = 0;
  public goles: number = 0;

  constructor(
    public readonly nombre: string,
    public readonly posicion: Posicion,
    public readonly edad: number,
    media: number,
    public readonly potencial: number,
    public readonly salarioSemanal: number,
  ) {
    if (media < 1 || media > 99 || potencial < media) throw new Error(`${nombre}: media o potencial invalidos`);
    this.media = media;
  }

  get mediaActual(): number {
    return this.media;
  }

  get disponible(): boolean {
    return this.partidosLesionado === 0;
  }

  lesionar(partidos: number): void {
    this.partidosLesionado = partidos;
  }

  pasarJornada(): void {
    if (this.partidosLesionado > 0) this.partidosLesionado -= 1;
  }

  // Los menores de 23 suben 1 punto cada 3 partidos jugados, sin pasar su potencial
  entrenar(): Suceso | null {
    this.partidosJugados += 1;
    if (this.edad >= 23 || this.media >= this.potencial || this.partidosJugados % 3 !== 0) return null;
    const antes: number = this.media;
    this.media += 1;
    return { tipo: "mejora", jugador: this.nombre, antes, despues: this.media };
  }
}

class Club {
  constructor(
    public readonly nombre: string,
    private readonly plantilla: Futbolista[],
    public readonly presupuestoSalarialSemanal: number,
    public readonly objetivo: Objetivo,
  ) {}

  get jugadores(): readonly Futbolista[] {
    return this.plantilla;
  }

  // Once: 1 POR, 4 DEF, 3 MED, 3 DEL, los mejores disponibles de cada puesto
  elegirOnce(): Futbolista[] {
    const cupos: Record<Posicion, number> = { POR: 1, DEF: 4, MED: 3, DEL: 3 };
    const posiciones: readonly Posicion[] = ["POR", "DEF", "MED", "DEL"];
    return posiciones.flatMap((p: Posicion): Futbolista[] =>
      this.plantilla
        .filter((f: Futbolista): boolean => f.posicion === p && f.disponible)
        .sort((a, b): number => b.mediaActual - a.mediaActual)
        .slice(0, cupos[p]),
    );
  }

  mediaDelOnce(): number {
    const once: Futbolista[] = this.elegirOnce();
    return Math.round((once.reduce((s: number, f: Futbolista): number => s + f.mediaActual, 0) / Math.max(1, once.length)) * 10) / 10;
  }

  masaSalarial(): number {
    return this.plantilla.reduce((s: number, f: Futbolista): number => s + f.salarioSemanal, 0);
  }
}

// ===================== SIMULACION =====================

interface Partido {
  readonly rival: string;
  readonly mediaRival: number;
}

interface Jornada {
  readonly partido: Partido;
  readonly golesFavor: number;
  readonly golesContra: number;
  readonly resultado: Resultado;
  readonly mediaPropia: number;
  readonly sucesos: readonly Suceso[];
}

function golesEsperados(mediaAtaque: number, mediaDefensa: number, azar: number): number {
  // Diferencia de media -> mas o menos goles; el azar decide el redondeo
  const base: number = 1.3 + (mediaAtaque - mediaDefensa) / 8;
  return Math.max(0, Math.floor(base + azar * 1.6));
}

function jugarTemporada(club: Club, calendario: readonly Partido[], aleatorio: () => number): Jornada[] {
  return calendario.map((partido: Partido): Jornada => {
    const once: Futbolista[] = club.elegirOnce();
    const mediaPropia: number = club.mediaDelOnce();
    const gf: number = golesEsperados(mediaPropia, partido.mediaRival, aleatorio());
    const gc: number = golesEsperados(partido.mediaRival, mediaPropia, aleatorio());
    const sucesos: Suceso[] = [];

    // Reparte los goles entre los delanteros y medios del once (mas probable si tiene mas media)
    const atacantes: Futbolista[] = once.filter((f: Futbolista): boolean => f.posicion === "DEL" || f.posicion === "MED");
    for (let g = 0; g < gf; g++) {
      const autor: Futbolista | undefined = atacantes[Math.floor(aleatorio() * atacantes.length)];
      if (autor !== undefined) {
        autor.goles += 1;
        sucesos.push({ tipo: "gol", jugador: autor.nombre });
      }
    }
    // 12% de probabilidad de una lesion en el partido
    if (aleatorio() < 0.12) {
      const lesionado: Futbolista | undefined = once[Math.floor(aleatorio() * once.length)];
      if (lesionado !== undefined) {
        const partidos: number = 1 + Math.floor(aleatorio() * 3);
        lesionado.lesionar(partidos + 1); // +1 porque pasarJornada descuenta este mismo partido
        sucesos.push({ tipo: "lesion", jugador: lesionado.nombre, partidos });
      }
    }
    once.forEach((f: Futbolista): void => {
      const mejora: Suceso | null = f.entrenar();
      if (mejora !== null) sucesos.push(mejora);
    });
    club.jugadores.forEach((f: Futbolista): void => f.pasarJornada());

    const resultado: Resultado = gf > gc ? "V" : gf === gc ? "E" : "D";
    return { partido, golesFavor: gf, golesContra: gc, resultado, mediaPropia, sucesos };
  });
}

// Puntos minimos que la directiva considera para cada objetivo (temporada de 12 partidos)
const PUNTOS_OBJETIVO: Readonly<Record<Objetivo, number>> = { campeonar: 30, "top 4": 22, "mitad de tabla": 15, "no descender": 10 };

// ===================== DATOS =====================

function crearClub(): Club {
  const f = (n: string, p: Posicion, e: number, m: number, pot: number, s: number): Futbolista => new Futbolista(n, p, e, m, pot, s);
  return new Club(
    "Atletico Andino",
    [
      f("Ruiz", "POR", 29, 78, 79, 18), f("Pinto", "POR", 19, 64, 80, 4),
      f("Vidal", "DEF", 31, 77, 77, 16), f("Soto", "DEF", 25, 75, 78, 12), f("Leon", "DEF", 21, 70, 82, 7), f("Mena", "DEF", 28, 73, 74, 11), f("Paz", "DEF", 18, 63, 79, 3),
      f("Castro", "MED", 27, 80, 82, 22), f("Rojas", "MED", 20, 72, 86, 8), f("Diaz", "MED", 30, 76, 76, 15), f("Gil", "MED", 22, 70, 77, 6),
      f("Herrera", "DEL", 26, 82, 85, 25), f("Quinto", "DEL", 19, 69, 88, 6), f("Navas", "DEL", 32, 75, 75, 17), f("Lara", "DEL", 24, 72, 76, 9),
    ],
    200,
    "top 4",
  );
}

const calendario: readonly Partido[] = [
  { rival: "Real Pacifico", mediaRival: 79 }, { rival: "Union Sur", mediaRival: 70 }, { rival: "Deportivo Norte", mediaRival: 75 },
  { rival: "Club Capital", mediaRival: 82 }, { rival: "Sporting Valle", mediaRival: 72 }, { rival: "Racing Costa", mediaRival: 74 },
  { rival: "Atletico Sierra", mediaRival: 68 }, { rival: "Real Pacifico", mediaRival: 79 }, { rival: "Union Sur", mediaRival: 70 },
  { rival: "Club Capital", mediaRival: 82 }, { rival: "Sporting Valle", mediaRival: 72 }, { rival: "Racing Costa", mediaRival: 74 },
];

// ===================== SALIDA =====================

function main(): void {
  // Validacion: un jugador con potencial menor a su media no se puede crear
  try {
    new Futbolista("Prueba", "DEL", 25, 80, 70, 10);
  } catch (e: unknown) {
    console.log(`Validacion: ${e instanceof Error ? e.message : "error"}\n`);
  }

  const club: Club = crearClub();
  const jornadas: Jornada[] = jugarTemporada(club, calendario, crearAleatorio(32));

  console.log(`==================== TEMPORADA DE ${club.nombre.toUpperCase()} ====================`);
  jornadas.forEach((j: Jornada, i: number): void => {
    const lesiones: string = j.sucesos.filter(esLesion).map((s) => ` | lesion ${s.jugador} (${s.partidos} p.)`).join("");
    const goleadores: string = j.sucesos.filter(esGol).map((s) => s.jugador).join(", ");
    console.log(`J${String(i + 1).padStart(2)} vs ${j.partido.rival.padEnd(16)} (${j.partido.mediaRival}) media ${j.mediaPropia.toFixed(1)}  ${j.golesFavor}-${j.golesContra} ${j.resultado}${goleadores ? `  goles: ${goleadores}` : ""}${lesiones}`);
  });

  const puntos: number = jornadas.reduce((p: number, j: Jornada): number => p + (j.resultado === "V" ? 3 : j.resultado === "E" ? 1 : 0), 0);
  const conteo: Record<Resultado, number> = { V: 0, E: 0, D: 0 };
  jornadas.forEach((j: Jornada): void => {
    conteo[j.resultado] += 1;
  });
  const gf: number = jornadas.reduce((s, j): number => s + j.golesFavor, 0);
  const gc: number = jornadas.reduce((s, j): number => s + j.golesContra, 0);

  console.log("\n==================== BALANCE ====================");
  console.log(`${conteo.V}V ${conteo.E}E ${conteo.D}D | ${puntos} puntos | goles ${gf}-${gc}`);
  const necesarios: number = PUNTOS_OBJETIVO[club.objetivo];
  console.log(`Objetivo "${club.objetivo}" (${necesarios} pts): ${puntos >= necesarios ? "CUMPLIDO" : `NO cumplido, faltaron ${necesarios - puntos} pts`}`);

  const goleadores: Futbolista[] = [...club.jugadores].filter((f) => f.goles > 0).sort((a, b): number => b.goles - a.goles || a.nombre.localeCompare(b.nombre));
  console.log(`Goleadores: ${goleadores.slice(0, 4).map((f) => `${f.nombre} ${f.goles}`).join(", ")}`);

  const mejoras: Map<string, { antes: number; despues: number }> = new Map();
  jornadas.flatMap((j) => j.sucesos).forEach((s: Suceso): void => {
    if (s.tipo === "mejora") mejoras.set(s.jugador, { antes: mejoras.get(s.jugador)?.antes ?? s.antes, despues: s.despues });
  });
  console.log(`Jovenes que mejoraron: ${[...mejoras.entries()].map(([n, m]) => `${n} ${m.antes}->${m.despues}`).join(", ") || "ninguno"}`);

  const masa: number = club.masaSalarial();
  console.log(`Salarios: ${masa}k/semana de ${club.presupuestoSalarialSemanal}k ${masa <= club.presupuestoSalarialSemanal ? "(dentro del presupuesto)" : `(EXCEDIDO por ${masa - club.presupuestoSalarialSemanal}k)`}`);
}

main();
