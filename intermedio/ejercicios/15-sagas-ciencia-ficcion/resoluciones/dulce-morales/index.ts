export {};

// Intermedio 15: Analizador de sagas sci-fi
// Tematica: ciencia ficcion
// Resolucion: Dulce Morales
//
// Problema: un club de fans quiere comparar sagas de ciencia ficcion (inventadas para el ejercicio).
// Cada saga tiene entregas (peliculas o series) con anio de estreno, anio dentro de la historia,
// duracion y calificacion. Hay que calcular estadisticas por saga, detectar si la saga mejora
// o empeora con el tiempo, y armar dos ordenes para verla: por estreno y cronologico.

// ===================== MODELO (objetos anidados) =====================

type Formato = "pelicula" | "serie";
type Tendencia = "mejora" | "empeora" | "estable" | "sin datos";

interface Entrega {
  readonly titulo: string;
  readonly formato: Formato;
  readonly estreno: number; // anio real de estreno
  readonly anioHistoria: number; // anio dentro del universo de la saga
  readonly duracionMin: number; // para series: duracion total de la temporada
  readonly calificacion: number; // 0 a 10
}

interface Saga {
  readonly nombre: string;
  readonly universo: { readonly creador: string; readonly ambientacion: string };
  readonly entregas: readonly Entrega[];
}

interface Estadisticas {
  readonly saga: Saga;
  readonly entregas: number;
  readonly horasTotales: number;
  readonly promedio: number;
  readonly mejor: Entrega;
  readonly peor: Entrega;
  readonly tendencia: Tendencia;
  readonly aniosActiva: number;
}

// ===================== REGLAS =====================

const UMBRAL_TENDENCIA: number = 0.5; // diferencia minima para decir que mejora o empeora
const MIN_ENTREGAS_RANKING: number = 2; // una sola pelicula no es una saga para comparar

// ===================== VALIDACION =====================

function validarEntrega(e: Entrega): string[] {
  const errores: string[] = [];
  if (e.calificacion < 0 || e.calificacion > 10) errores.push(`calificacion ${e.calificacion} fuera de 0-10`);
  if (e.duracionMin <= 0) errores.push("duracion invalida");
  if (e.estreno < 1900 || e.estreno > 2030) errores.push(`estreno ${e.estreno} fuera de rango`);
  return errores;
}

function validarSaga(s: Saga): string[] {
  const errores: string[] = s.entregas.flatMap((e: Entrega): string[] => validarEntrega(e).map((m: string): string => `"${e.titulo}": ${m}`));
  const titulos: string[] = s.entregas.map((e: Entrega): string => e.titulo);
  const repetidos: string[] = titulos.filter((t: string, i: number): boolean => titulos.indexOf(t) !== i);
  if (repetidos.length > 0) errores.push(`titulos repetidos: ${repetidos.join(", ")}`);
  if (s.entregas.length === 0) errores.push("la saga no tiene entregas");
  return errores;
}

// ===================== CALCULOS (map / filter / reduce / sort) =====================

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

function promedio(valores: readonly number[]): number {
  return valores.length === 0 ? 0 : valores.reduce((a: number, b: number): number => a + b, 0) / valores.length;
}

function porEstreno(entregas: readonly Entrega[]): Entrega[] {
  return [...entregas].sort((a: Entrega, b: Entrega): number => a.estreno - b.estreno || a.titulo.localeCompare(b.titulo));
}

function cronologico(entregas: readonly Entrega[]): Entrega[] {
  return [...entregas].sort((a: Entrega, b: Entrega): number => a.anioHistoria - b.anioHistoria || a.estreno - b.estreno);
}

// Compara el promedio de la primera mitad (por estreno) con el de la segunda mitad
function calcularTendencia(entregas: readonly Entrega[]): Tendencia {
  if (entregas.length < 2) return "sin datos";
  const ordenadas: Entrega[] = porEstreno(entregas);
  const mitad: number = Math.floor(ordenadas.length / 2);
  const notas = (lista: Entrega[]): number[] => lista.map((e: Entrega): number => e.calificacion);
  const primera: number = promedio(notas(ordenadas.slice(0, mitad)));
  const segunda: number = promedio(notas(ordenadas.slice(ordenadas.length - mitad)));
  const diferencia: number = segunda - primera;
  if (diferencia >= UMBRAL_TENDENCIA) return "mejora";
  if (diferencia <= -UMBRAL_TENDENCIA) return "empeora";
  return "estable";
}

function calcularEstadisticas(s: Saga): Estadisticas | null {
  const [primera] = s.entregas;
  if (primera === undefined) return null;

  const mejor: Entrega = s.entregas.reduce((m: Entrega, e: Entrega): Entrega => (e.calificacion > m.calificacion ? e : m), primera);
  const peor: Entrega = s.entregas.reduce((m: Entrega, e: Entrega): Entrega => (e.calificacion < m.calificacion ? e : m), primera);
  const estrenos: number[] = s.entregas.map((e: Entrega): number => e.estreno);
  const minutos: number = s.entregas.reduce((t: number, e: Entrega): number => t + e.duracionMin, 0);

  return {
    saga: s,
    entregas: s.entregas.length,
    horasTotales: redondear(minutos / 60),
    promedio: redondear(promedio(s.entregas.map((e: Entrega): number => e.calificacion))),
    mejor,
    peor,
    tendencia: calcularTendencia(s.entregas),
    aniosActiva: Math.max(...estrenos) - Math.min(...estrenos),
  };
}

// Precuelas: entregas estrenadas despues de otra pero que ocurren antes en la historia
function contarPrecuelas(entregas: readonly Entrega[]): number {
  const ordenadas: Entrega[] = porEstreno(entregas);
  return ordenadas.filter((e: Entrega, i: number): boolean =>
    ordenadas.slice(0, i).some((anterior: Entrega): boolean => anterior.anioHistoria > e.anioHistoria),
  ).length;
}

// ===================== DATOS DE PRUEBA (sagas inventadas) =====================

const sagas: readonly Saga[] = [
  {
    nombre: "Cronicas de Andromeda",
    universo: { creador: "Elena Vasquez", ambientacion: "guerra entre colonias espaciales" },
    entregas: [
      { titulo: "Andromeda: El Despertar", formato: "pelicula", estreno: 1998, anioHistoria: 2310, duracionMin: 128, calificacion: 8.6 },
      { titulo: "Andromeda: La Flota Perdida", formato: "pelicula", estreno: 2002, anioHistoria: 2315, duracionMin: 135, calificacion: 7.9 },
      { titulo: "Andromeda: Origenes", formato: "pelicula", estreno: 2009, anioHistoria: 2280, duracionMin: 140, calificacion: 6.4 },
      { titulo: "Andromeda: El Juicio", formato: "pelicula", estreno: 2014, anioHistoria: 2320, duracionMin: 150, calificacion: 5.8 },
    ],
  },
  {
    nombre: "Proyecto Helix",
    universo: { creador: "Marcus Obi", ambientacion: "inteligencia artificial y clones" },
    entregas: [
      { titulo: "Helix", formato: "pelicula", estreno: 2011, anioHistoria: 2090, duracionMin: 112, calificacion: 6.9 },
      { titulo: "Helix: Temporada 1", formato: "serie", estreno: 2016, anioHistoria: 2095, duracionMin: 480, calificacion: 7.8 },
      { titulo: "Helix: Temporada 2", formato: "serie", estreno: 2018, anioHistoria: 2096, duracionMin: 510, calificacion: 8.7 },
      { titulo: "Helix: Convergencia", formato: "pelicula", estreno: 2023, anioHistoria: 2101, duracionMin: 126, calificacion: 9.1 },
    ],
  },
  {
    nombre: "Ecos de Marte",
    universo: { creador: "Sofia Lund", ambientacion: "colonizacion de Marte" },
    entregas: [
      { titulo: "Ecos de Marte", formato: "pelicula", estreno: 2015, anioHistoria: 2060, duracionMin: 118, calificacion: 7.4 },
      { titulo: "Ecos de Marte II", formato: "pelicula", estreno: 2019, anioHistoria: 2064, duracionMin: 121, calificacion: 7.6 },
      { titulo: "Ecos de Marte III", formato: "pelicula", estreno: 2024, anioHistoria: 2070, duracionMin: 125, calificacion: 7.2 },
    ],
  },
  // Caso limite: una sola entrega -> no hay tendencia
  {
    nombre: "Horizonte Cero",
    universo: { creador: "Ken Arata", ambientacion: "viaje en el tiempo" },
    entregas: [{ titulo: "Horizonte Cero", formato: "pelicula", estreno: 2021, anioHistoria: 1985, duracionMin: 109, calificacion: 8.2 }],
  },
  // Invalida
  {
    nombre: "Saga Rota",
    universo: { creador: "?", ambientacion: "?" },
    entregas: [
      { titulo: "Parte 1", formato: "pelicula", estreno: 2020, anioHistoria: 3000, duracionMin: 100, calificacion: 11 },
      { titulo: "Parte 1", formato: "pelicula", estreno: 2022, anioHistoria: 3001, duracionMin: 0, calificacion: 6 },
    ],
  },
];

// ===================== SALIDA POR CONSOLA =====================

function imprimirSaga(est: Estadisticas): void {
  const s: Saga = est.saga;
  console.log(`\n=== ${s.nombre} (${s.universo.creador} - ${s.universo.ambientacion}) ===`);
  console.log(`Entregas: ${est.entregas} | ${est.horasTotales} h en total | ${est.aniosActiva} anios de estrenos | promedio ${est.promedio.toFixed(2)}`);
  console.log(`Mejor: ${est.mejor.titulo} (${est.mejor.calificacion}) | Peor: ${est.peor.titulo} (${est.peor.calificacion})`);
  console.log(`Tendencia: ${est.tendencia}`);

  const precuelas: number = contarPrecuelas(s.entregas);
  console.log(`Orden por estreno:  ${porEstreno(s.entregas).map((e: Entrega): string => `${e.titulo} [${e.estreno}]`).join(" -> ")}`);
  if (precuelas > 0) {
    console.log(`Orden cronologico:  ${cronologico(s.entregas).map((e: Entrega): string => `${e.titulo} [anio ${e.anioHistoria}]`).join(" -> ")}`);
    console.log(`  (${precuelas} precuela(s): el orden cronologico es distinto al de estreno)`);
  } else {
    console.log("Orden cronologico:  igual al de estreno");
  }
}

function main(): void {
  console.log("==================== ANALIZADOR DE SAGAS SCI-FI ====================");
  const estadisticas: Estadisticas[] = [];

  for (const saga of sagas) {
    const errores: string[] = validarSaga(saga);
    if (errores.length > 0) {
      console.log(`\nX ${saga.nombre} descartada:`);
      errores.forEach((e: string): void => console.log(`  - ${e}`));
      continue;
    }
    const est: Estadisticas | null = calcularEstadisticas(saga);
    if (est !== null) {
      estadisticas.push(est);
      imprimirSaga(est);
    }
  }

  console.log(`\n==================== RANKING DE SAGAS (minimo ${MIN_ENTREGAS_RANKING} entregas) ====================`);
  estadisticas
    .filter((est: Estadisticas): boolean => est.entregas >= MIN_ENTREGAS_RANKING)
    .sort((a: Estadisticas, b: Estadisticas): number => b.promedio - a.promedio || b.entregas - a.entregas)
    .forEach((est: Estadisticas, i: number): void => {
      console.log(`${i + 1}. ${est.saga.nombre.padEnd(22)} promedio ${est.promedio.toFixed(2)} | ${String(est.entregas)} entrega(s) | ${est.horasTotales.toFixed(2).padStart(5)} h | ${est.tendencia}`);
    });

  const sueltas: string[] = estadisticas
    .filter((est: Estadisticas): boolean => est.entregas < MIN_ENTREGAS_RANKING)
    .map((est: Estadisticas): string => `${est.saga.nombre} (${est.entregas} entrega)`);
  if (sueltas.length > 0) console.log(`Fuera del ranking por tener pocas entregas: ${sueltas.join(", ")}`);

  const todas: Entrega[] = estadisticas.flatMap((est: Estadisticas): readonly Entrega[] => est.saga.entregas);
  const series: Entrega[] = todas.filter((e: Entrega): boolean => e.formato === "serie");
  console.log(`\nTotal: ${todas.length} entregas (${todas.length - series.length} peliculas, ${series.length} temporadas de serie)`);
  const maraton: number = todas.reduce((t: number, e: Entrega): number => t + e.duracionMin, 0);
  console.log(`Ver todo seguido tomaria ${Math.floor(maraton / 60)} h ${maraton % 60} min`);
}

main();
