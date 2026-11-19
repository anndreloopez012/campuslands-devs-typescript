export {};

// Intermedio 14: Catalogo de peliculas de miedo
// Tematica: peliculas
// Resolucion: Dulce Morales
//
// Problema: un cine club tiene un catalogo de peliculas de terror con resenas.
// Hay que calcular la calificacion de cada pelicula (solo si tiene suficientes resenas),
// medir su "nivel de miedo", y recomendar un maraton para cada espectador segun
// su edad, el tiempo que tiene y si quiere evitar el gore.

// ===================== MODELO (objetos anidados) =====================

type Subgenero = "sobrenatural" | "slasher" | "psicologico" | "found footage" | "zombis";
type Clasificacion = "B" | "B15" | "C"; // B: 12+, B15: 15+, C: 18+

interface Resena {
  readonly autor: string;
  readonly puntaje: number; // 1 a 10
}

interface Pelicula {
  readonly id: string;
  readonly titulo: string;
  readonly anio: number;
  readonly subgenero: Subgenero;
  readonly clasificacion: Clasificacion;
  readonly duracionMin: number;
  readonly director: { readonly nombre: string; readonly pais: string };
  readonly sustos: { readonly saltos: number; readonly gore: 0 | 1 | 2 | 3 }; // gore: 0 nada, 3 extremo
  readonly resenas: readonly Resena[];
}

interface Espectador {
  readonly nombre: string;
  readonly edad: number;
  readonly minutosDisponibles: number;
  readonly evitaGore: boolean;
  readonly subgenerosFavoritos: readonly Subgenero[];
}

interface FichaPelicula {
  readonly pelicula: Pelicula;
  readonly calificacion: number | null; // null = pocas resenas
  readonly nivelMiedo: number; // 0 a 10
}

interface Maraton {
  readonly espectador: Espectador;
  readonly peliculas: readonly FichaPelicula[];
  readonly minutosTotales: number;
  readonly descartadas: readonly { readonly titulo: string; readonly motivo: string }[];
}

// ===================== REGLAS =====================

const MIN_RESENAS: number = 3;
const EDAD_MINIMA: Readonly<Record<Clasificacion, number>> = { B: 12, B15: 15, C: 18 };
const GORE_MAXIMO_SI_EVITA: number = 1;

// ===================== VALIDACION =====================

function validarPelicula(p: Pelicula): string[] {
  const errores: string[] = [];
  if (p.duracionMin <= 0) errores.push("duracion invalida");
  if (p.sustos.saltos < 0) errores.push("sustos negativos");
  const malas: Resena[] = p.resenas.filter((r: Resena): boolean => !Number.isInteger(r.puntaje) || r.puntaje < 1 || r.puntaje > 10);
  if (malas.length > 0) errores.push(`${malas.length} resena(s) fuera de 1-10`);
  return errores;
}

// ===================== CALCULOS (map / filter / reduce / sort) =====================

function calcularCalificacion(resenas: readonly Resena[]): number | null {
  if (resenas.length < MIN_RESENAS) return null;
  const suma: number = resenas.reduce((total: number, r: Resena): number => total + r.puntaje, 0);
  return Math.round((suma / resenas.length) * 10) / 10;
}

// Miedo = sustos por hora (hasta 7 puntos) + gore (hasta 3 puntos)
function calcularMiedo(p: Pelicula): number {
  const sustosPorHora: number = (p.sustos.saltos / p.duracionMin) * 60;
  const porSustos: number = Math.min(7, sustosPorHora / 2);
  return Math.round((porSustos + p.sustos.gore) * 10) / 10;
}

function crearFicha(p: Pelicula): FichaPelicula {
  return { pelicula: p, calificacion: calcularCalificacion(p.resenas), nivelMiedo: calcularMiedo(p) };
}

// Motivo por el que una pelicula no sirve para un espectador (null = si sirve)
function motivoExclusion(f: FichaPelicula, e: Espectador): string | null {
  const minima: number = EDAD_MINIMA[f.pelicula.clasificacion];
  if (e.edad < minima) return `clasificacion ${f.pelicula.clasificacion} (${minima}+)`;
  if (e.evitaGore && f.pelicula.sustos.gore > GORE_MAXIMO_SI_EVITA) return `gore nivel ${f.pelicula.sustos.gore}`;
  if (f.calificacion === null) return `solo ${f.pelicula.resenas.length} resena(s)`;
  return null;
}

// Favoritos primero, luego mejor calificacion, luego mas corta (para que quepan mas)
function ordenarParaMaraton(fichas: readonly FichaPelicula[], e: Espectador): FichaPelicula[] {
  const esFavorita = (f: FichaPelicula): number => (e.subgenerosFavoritos.includes(f.pelicula.subgenero) ? 1 : 0);
  return [...fichas].sort(
    (a, b): number => esFavorita(b) - esFavorita(a) || (b.calificacion ?? 0) - (a.calificacion ?? 0) || a.pelicula.duracionMin - b.pelicula.duracionMin,
  );
}

function armarMaraton(fichas: readonly FichaPelicula[], e: Espectador): Maraton {
  const descartadas: { titulo: string; motivo: string }[] = [];
  const aptas: FichaPelicula[] = fichas.filter((f: FichaPelicula): boolean => {
    const motivo: string | null = motivoExclusion(f, e);
    if (motivo !== null) descartadas.push({ titulo: f.pelicula.titulo, motivo });
    return motivo === null;
  });

  // Va agregando en orden de preferencia mientras quepan en el tiempo disponible
  const elegidas: FichaPelicula[] = ordenarParaMaraton(aptas, e).reduce(
    (acc: FichaPelicula[], f: FichaPelicula): FichaPelicula[] => {
      const usado: number = acc.reduce((t: number, x: FichaPelicula): number => t + x.pelicula.duracionMin, 0);
      if (usado + f.pelicula.duracionMin <= e.minutosDisponibles) return [...acc, f];
      descartadas.push({ titulo: f.pelicula.titulo, motivo: "no alcanza el tiempo" });
      return acc;
    },
    [],
  );

  // Se proyectan de menos a mas miedo
  const enOrden: FichaPelicula[] = [...elegidas].sort((a, b): number => a.nivelMiedo - b.nivelMiedo);
  return {
    espectador: e,
    peliculas: enOrden,
    minutosTotales: enOrden.reduce((t: number, f: FichaPelicula): number => t + f.pelicula.duracionMin, 0),
    descartadas,
  };
}

// ===================== DATOS DE PRUEBA =====================

function resenas(...puntajes: number[]): Resena[] {
  return puntajes.map((p: number, i: number): Resena => ({ autor: `Critico ${i + 1}`, puntaje: p }));
}

const catalogo: readonly Pelicula[] = [
  { id: "P01", titulo: "La Casa del Pozo", anio: 2019, subgenero: "sobrenatural", clasificacion: "B15", duracionMin: 98, director: { nombre: "Ines Calderon", pais: "Mexico" }, sustos: { saltos: 14, gore: 1 }, resenas: resenas(8, 9, 7, 8) },
  { id: "P02", titulo: "Cuchillo de Medianoche", anio: 2021, subgenero: "slasher", clasificacion: "C", duracionMin: 92, director: { nombre: "Tom Becker", pais: "EE.UU." }, sustos: { saltos: 18, gore: 3 }, resenas: resenas(7, 6, 8, 7, 6) },
  { id: "P03", titulo: "El Espejo Roto", anio: 2018, subgenero: "psicologico", clasificacion: "B15", duracionMin: 115, director: { nombre: "Lucia Ferrer", pais: "Espana" }, sustos: { saltos: 6, gore: 0 }, resenas: resenas(9, 9, 10, 8) },
  { id: "P04", titulo: "Grabacion 47", anio: 2020, subgenero: "found footage", clasificacion: "B", duracionMin: 85, director: { nombre: "Ramiro Paz", pais: "Argentina" }, sustos: { saltos: 20, gore: 0 }, resenas: resenas(7, 8, 6) },
  { id: "P05", titulo: "Ciudad Infectada", anio: 2022, subgenero: "zombis", clasificacion: "C", duracionMin: 105, director: { nombre: "Ji-woo Han", pais: "Corea" }, sustos: { saltos: 12, gore: 2 }, resenas: resenas(8, 8, 9, 7) },
  { id: "P06", titulo: "Susurros", anio: 2023, subgenero: "sobrenatural", clasificacion: "B", duracionMin: 90, director: { nombre: "Ines Calderon", pais: "Mexico" }, sustos: { saltos: 10, gore: 0 }, resenas: resenas(6, 7, 7) },
  // Pocas resenas: no tiene calificacion y no se recomienda
  { id: "P07", titulo: "Estreno Misterioso", anio: 2026, subgenero: "psicologico", clasificacion: "B", duracionMin: 95, director: { nombre: "Ana Vidal", pais: "Chile" }, sustos: { saltos: 8, gore: 0 }, resenas: resenas(10, 9) },
  // Invalida
  { id: "P99", titulo: "Datos Rotos", anio: 2024, subgenero: "slasher", clasificacion: "C", duracionMin: 90, director: { nombre: "?", pais: "?" }, sustos: { saltos: 5, gore: 1 }, resenas: resenas(8, 12, -1) },
];

const espectadores: readonly Espectador[] = [
  // Normal: adulta, mucho tiempo, sin restricciones
  { nombre: "Valeria", edad: 27, minutosDisponibles: 300, evitaGore: false, subgenerosFavoritos: ["slasher", "zombis"] },
  // Caso limite: cumple exactamente 15 -> si puede ver B15
  { nombre: "Tomas", edad: 15, minutosDisponibles: 200, evitaGore: false, subgenerosFavoritos: ["found footage"] },
  // Evita gore y tiene poco tiempo
  { nombre: "Rocio", edad: 34, minutosDisponibles: 210, evitaGore: true, subgenerosFavoritos: ["psicologico"] },
];

// ===================== SALIDA POR CONSOLA =====================

function main(): void {
  const validas: Pelicula[] = catalogo.filter((p: Pelicula): boolean => validarPelicula(p).length === 0);
  const fichas: FichaPelicula[] = validas.map(crearFicha);

  console.log("====================== CATALOGO DE TERROR ======================");
  catalogo
    .filter((p: Pelicula): boolean => validarPelicula(p).length > 0)
    .forEach((p: Pelicula): void => console.log(`X ${p.titulo}: ${validarPelicula(p).join(", ")}`));

  const ranking: FichaPelicula[] = [...fichas].sort((a, b): number => (b.calificacion ?? -1) - (a.calificacion ?? -1));
  ranking.forEach((f: FichaPelicula, i: number): void => {
    const p: Pelicula = f.pelicula;
    const nota: string = f.calificacion === null ? "s/c" : f.calificacion.toFixed(1);
    console.log(
      `${i + 1}. ${p.titulo.padEnd(23)} ${String(p.anio)} ${p.subgenero.padEnd(13)} ${p.clasificacion.padEnd(3)} ${String(p.duracionMin).padStart(3)} min | nota ${nota.padStart(4)} (${p.resenas.length} res.) | miedo ${f.nivelMiedo.toFixed(1)}`,
    );
  });

  const masMiedo: FichaPelicula | undefined = [...fichas].sort((a, b): number => b.nivelMiedo - a.nivelMiedo)[0];
  if (masMiedo !== undefined) console.log(`La que mas asusta: ${masMiedo.pelicula.titulo} (${masMiedo.nivelMiedo}/10)`);

  for (const e of espectadores) {
    const m: Maraton = armarMaraton(fichas, e);
    console.log(`\n--- Maraton para ${e.nombre} (${e.edad} anios, ${e.minutosDisponibles} min${e.evitaGore ? ", sin gore" : ""}) ---`);
    m.peliculas.forEach((f: FichaPelicula, i: number): void => {
      console.log(`  ${i + 1}. ${f.pelicula.titulo.padEnd(23)} ${String(f.pelicula.duracionMin).padStart(3)} min | miedo ${f.nivelMiedo.toFixed(1)}`);
    });
    console.log(`  Total: ${m.minutosTotales} de ${e.minutosDisponibles} min`);
    m.descartadas.forEach((d): void => console.log(`  - ${d.titulo}: ${d.motivo}`));
  }
}

main();
