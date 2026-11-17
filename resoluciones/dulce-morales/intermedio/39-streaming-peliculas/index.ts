export {};

// Intermedio 39: Recomendador de streaming
// Tematica: peliculas y series
// Resolucion: Dulce Morales
//
// Problema: una plataforma de streaming quiere recomendar contenido a cada perfil.
// Con lo que el perfil ya vio y las estrellas que le puso, se calcula cuanto le gusta cada genero.
// Se descartan titulos ya vistos, no aptos para su edad o que no caben en el tiempo que tiene.
// Luego se ordenan por puntaje, cuidando que el top no repita demasiado el mismo genero.

// ===================== TIPOS =====================

type Genero = "accion" | "comedia" | "drama" | "terror" | "ciencia ficcion" | "animacion" | "documental";
type Clasificacion = "ATP" | "+13" | "+16" | "+18";

interface Base {
  readonly id: string;
  readonly titulo: string;
  readonly generos: readonly Genero[];
  readonly clasificacion: Clasificacion;
  readonly popularidad: number; // 0 a 100
}

// Contenido: union discriminada entre pelicula y serie
type Contenido =
  | (Base & { readonly formato: "pelicula"; readonly duracionMin: number })
  | (Base & { readonly formato: "serie"; readonly temporadas: number; readonly minutosPorEpisodio: number });

function esSerie(c: Contenido): c is Extract<Contenido, { formato: "serie" }> {
  return c.formato === "serie";
}

interface Perfil {
  readonly nombre: string;
  readonly edad: number;
  readonly minutosDisponibles: number; // para una pelicula o un episodio
  readonly vistos: ReadonlyMap<string, number>; // id -> estrellas (1 a 5)
}

interface Recomendacion<T> {
  readonly item: T;
  readonly puntaje: number;
  readonly motivo: string;
}

// ===================== REGLAS =====================

const EDAD_MINIMA: Readonly<Record<Clasificacion, number>> = { ATP: 0, "+13": 13, "+16": 16, "+18": 18 };
const MAX_POR_GENERO_EN_TOP: number = 2;
const TAMANO_TOP: number = 5;

// ===================== CLASE GENERICA =====================

// Sirve para cualquier contenido que tenga generos y popularidad
class Recomendador<T extends Base> {
  constructor(
    private readonly catalogo: readonly T[],
    private readonly minutosDe: (item: T) => number,
  ) {}

  // Afinidad por genero: promedio de (estrellas - 3) de lo visto en ese genero. Positivo = le gusta.
  afinidad(perfil: Perfil): Map<Genero, number> {
    const suma: Map<Genero, { total: number; n: number }> = new Map();
    for (const [id, estrellas] of perfil.vistos) {
      const item: T | undefined = this.catalogo.find((x: T): boolean => x.id === id);
      item?.generos.forEach((g: Genero): void => {
        const actual = suma.get(g) ?? { total: 0, n: 0 };
        suma.set(g, { total: actual.total + (estrellas - 3), n: actual.n + 1 });
      });
    }
    return new Map([...suma.entries()].map(([g, { total, n }]): [Genero, number] => [g, Math.round((total / n) * 100) / 100]));
  }

  descartar(item: T, perfil: Perfil): string | null {
    if (perfil.vistos.has(item.id)) return "ya lo vio";
    if (perfil.edad < EDAD_MINIMA[item.clasificacion]) return `clasificacion ${item.clasificacion}`;
    if (this.minutosDe(item) > perfil.minutosDisponibles) return `dura ${this.minutosDe(item)} min y tiene ${perfil.minutosDisponibles}`;
    return null;
  }

  recomendar(perfil: Perfil): { top: Recomendacion<T>[]; descartados: { item: T; motivo: string }[] } {
    const afinidad: Map<Genero, number> = this.afinidad(perfil);
    const descartados: { item: T; motivo: string }[] = [];
    const candidatos: Recomendacion<T>[] = [];

    for (const item of this.catalogo) {
      const motivo: string | null = this.descartar(item, perfil);
      if (motivo !== null) {
        if (motivo !== "ya lo vio") descartados.push({ item, motivo });
        continue;
      }
      const mejor: [Genero, number] = item.generos
        .map((g: Genero): [Genero, number] => [g, afinidad.get(g) ?? 0])
        .sort((a, b): number => b[1] - a[1])[0] ?? ["drama", 0];
      // Afinidad pesa mucho; la popularidad desempata
      const puntaje: number = Math.round((mejor[1] * 30 + item.popularidad / 2) * 10) / 10;
      const motivoTexto: string = mejor[1] > 0 ? `porque le gusta ${mejor[0]}` : "popular en la plataforma";
      candidatos.push({ item, puntaje, motivo: motivoTexto });
    }

    // Top con diversidad: maximo 2 titulos por genero principal
    const usados: Map<Genero, number> = new Map();
    const top: Recomendacion<T>[] = [];
    for (const r of [...candidatos].sort((a, b): number => b.puntaje - a.puntaje)) {
      const g: Genero | undefined = r.item.generos[0];
      if (g === undefined || (usados.get(g) ?? 0) >= MAX_POR_GENERO_EN_TOP) continue;
      usados.set(g, (usados.get(g) ?? 0) + 1);
      top.push(r);
      if (top.length === TAMANO_TOP) break;
    }
    return { top, descartados };
  }
}

// ===================== DATOS =====================

const catalogo: readonly Contenido[] = [
  { id: "m1", titulo: "Orbita Silenciosa", formato: "pelicula", generos: ["ciencia ficcion", "drama"], clasificacion: "+13", popularidad: 82, duracionMin: 128 },
  { id: "m2", titulo: "Risas en la Oficina", formato: "pelicula", generos: ["comedia"], clasificacion: "ATP", popularidad: 64, duracionMin: 95 },
  { id: "m3", titulo: "La Casa del Eco", formato: "pelicula", generos: ["terror"], clasificacion: "+18", popularidad: 77, duracionMin: 102 },
  { id: "m4", titulo: "Protocolo Marte", formato: "pelicula", generos: ["ciencia ficcion", "accion"], clasificacion: "+13", popularidad: 91, duracionMin: 140 },
  { id: "m5", titulo: "Pixeles Perdidos", formato: "pelicula", generos: ["animacion", "comedia"], clasificacion: "ATP", popularidad: 88, duracionMin: 100 },
  { id: "m6", titulo: "Oceanos Profundos", formato: "pelicula", generos: ["documental"], clasificacion: "ATP", popularidad: 55, duracionMin: 90 },
  { id: "m7", titulo: "Velocidad Final", formato: "pelicula", generos: ["accion"], clasificacion: "+16", popularidad: 73, duracionMin: 118 },
  { id: "s1", titulo: "Estacion Nebula", formato: "serie", generos: ["ciencia ficcion"], clasificacion: "+13", popularidad: 86, temporadas: 3, minutosPorEpisodio: 50 },
  { id: "s2", titulo: "Familia Disfuncional", formato: "serie", generos: ["comedia", "drama"], clasificacion: "+13", popularidad: 79, temporadas: 5, minutosPorEpisodio: 25 },
  { id: "s3", titulo: "Ecos del Pasado", formato: "serie", generos: ["drama"], clasificacion: "+16", popularidad: 70, temporadas: 2, minutosPorEpisodio: 60 },
  { id: "s4", titulo: "Robots de Bolsillo", formato: "serie", generos: ["animacion", "ciencia ficcion"], clasificacion: "ATP", popularidad: 68, temporadas: 4, minutosPorEpisodio: 22 },
  { id: "s5", titulo: "Expedientes Ocultos", formato: "serie", generos: ["terror", "drama"], clasificacion: "+16", popularidad: 75, temporadas: 2, minutosPorEpisodio: 45 },
];

const perfiles: readonly Perfil[] = [
  // Le encanta la ciencia ficcion, no le gusta la comedia
  { nombre: "Lucia", edad: 29, minutosDisponibles: 150, vistos: new Map([["m1", 5], ["s1", 5], ["m2", 2], ["s3", 4]]) },
  // Limite: tiene 13 anios exactos -> puede ver +13 pero no +16
  { nombre: "Tomas", edad: 13, minutosDisponibles: 120, vistos: new Map([["m5", 5], ["s4", 4]]) },
  // Perfil nuevo sin historial: solo popularidad; tiene poco tiempo
  { nombre: "Invitado", edad: 35, minutosDisponibles: 60, vistos: new Map() },
];

// ===================== SALIDA =====================

function minutos(c: Contenido): number {
  return esSerie(c) ? c.minutosPorEpisodio : c.duracionMin;
}

function main(): void {
  const recomendador: Recomendador<Contenido> = new Recomendador<Contenido>(catalogo, minutos);

  for (const perfil of perfiles) {
    console.log(`=============== ${perfil.nombre} (${perfil.edad} anios, ${perfil.minutosDisponibles} min disponibles) ===============`);
    const afinidad: Map<Genero, number> = recomendador.afinidad(perfil);
    console.log(`Afinidad: ${[...afinidad.entries()].sort((a, b) => b[1] - a[1]).map(([g, v]) => `${g} ${v > 0 ? "+" : ""}${v}`).join(", ") || "sin historial"}`);

    const { top, descartados } = recomendador.recomendar(perfil);
    top.forEach((r: Recomendacion<Contenido>, i: number): void => {
      const c: Contenido = r.item;
      const formato: string = esSerie(c) ? `serie, ${c.temporadas} temp. de ${c.minutosPorEpisodio} min` : `pelicula, ${c.duracionMin} min`;
      console.log(`  ${i + 1}. ${c.titulo.padEnd(21)} ${String(r.puntaje).padStart(5)} pts | ${formato.padEnd(28)} | ${r.motivo}`);
    });
    descartados.forEach(({ item, motivo }): void => console.log(`  - ${item.titulo}: ${motivo}`));
    console.log("");
  }
}

main();
