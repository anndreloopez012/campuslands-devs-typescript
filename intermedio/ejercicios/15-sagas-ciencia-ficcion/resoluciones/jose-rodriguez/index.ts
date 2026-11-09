// ============================================================================
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)
// ============================================================================

export type SubgeneroSciFi =
  | 'SpaceOpera'
  | 'Cyberpunk'
  | 'Distopia'
  | 'ViajeEnElTiempo'
  | 'IAConciencia'
  | 'Mecha';

export type MedioSaga = 'Cine' | 'Literatura' | 'Videojuegos' | 'Television';

export interface EntregaSaga {
  readonly id: string;
  readonly titulo: string;
  readonly anioEstreno: number;
  readonly duracionMinutos: number;
  readonly calificacionCritica: number; // Porcentaje de 0 a 100
  readonly recaudacionMillonesUSD: number;
}

export interface SagaSciFi {
  readonly id: string;
  readonly nombreSaga: string;
  readonly creador: string;
  readonly subgenero: SubgeneroSciFi;
  readonly medioOriginal: MedioSaga;
  readonly entregas: readonly EntregaSaga[];
}

export interface MetricasSaga {
  readonly totalEntregas: number;
  readonly duracionTotalMinutos: number;
  readonly calificacionPromedio: number;
  readonly recaudacionTotalMillonesUSD: number;
  readonly entregaMejorValorada: EntregaSaga | null;
  readonly entregaMasTaquillera: EntregaSaga | null;
}

export interface SagaProcesada {
  readonly saga: SagaSciFi;
  readonly metricas: MetricasSaga;
}

export interface ResumenAnalisisSagas {
  readonly totalSagasValidas: number;
  readonly sagaMasExitosa: string;
  readonly promedioCalificacionGeneral: number;
  readonly recaudacionGlobalMillonesUSD: number;
  readonly desglosePorSubgenero: Readonly<Record<SubgeneroSciFi, number>>;
  readonly sagas: readonly SagaProcesada[];
  readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
  | { readonly esValido: true; readonly datos: T }
  | { readonly esValido: false; readonly errores: readonly string[] };

// ============================================================================
// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO
// ============================================================================

export function validarEntregaSaga(entrega: EntregaSaga): ResultadoValidacion<EntregaSaga> {
  const errores: string[] = [];

  if (entrega.calificacionCritica < 0 || entrega.calificacionCritica > 100) {
    errores.push(`La entrega "${entrega.titulo}" tiene una calificacion invalida (${entrega.calificacionCritica}%).`);
  }

  if (entrega.duracionMinutos <= 0 || entrega.duracionMinutos > 600) {
    errores.push(`La duracion de "${entrega.titulo}" esta fuera de rango (${entrega.duracionMinutos} min).`);
  }

  if (entrega.anioEstreno < 1900 || entrega.anioEstreno > 2030) {
    errores.push(`El anio de estreno (${entrega.anioEstreno}) de "${entrega.titulo}" es invalido.`);
  }

  if (entrega.recaudacionMillonesUSD < 0) {
    errores.push(`La recaudacion de "${entrega.titulo}" no puede ser negativa.`);
  }

  return errores.length === 0
    ? { esValido: true, datos: entrega }
    : { esValido: false, errores };
}

export function validarSagaSciFi(saga: SagaSciFi): readonly string[] {
  const advertencias: string[] = [];
  const idsVistos = new Set<string>();

  if (saga.entregas.length === 0) {
    advertencias.push(`La saga "${saga.nombreSaga}" no registra ninguna entrega.`);
  }

  for (const entrega of saga.entregas) {
    if (idsVistos.has(entrega.id)) {
      advertencias.push(`Entrega duplicada detectada en la saga "${saga.nombreSaga}": ${entrega.titulo} (ID: ${entrega.id}).`);
    }
    idsVistos.add(entrega.id);
  }

  return advertencias;
}

// ============================================================================
// 3. TRANSFORMACIÓN Y CÁLCULOS
// ============================================================================

const SUBGENEROS_DISPONIBLES: readonly SubgeneroSciFi[] = [
  'SpaceOpera',
  'Cyberpunk',
  'Distopia',
  'ViajeEnElTiempo',
  'IAConciencia',
  'Mecha'
];

export function calcularMetricasSaga(entregas: readonly EntregaSaga[]): MetricasSaga {
  if (entregas.length === 0) {
    return {
      totalEntregas: 0,
      duracionTotalMinutos: 0,
      calificacionPromedio: 0,
      recaudacionTotalMillonesUSD: 0,
      entregaMejorValorada: null,
      entregaMasTaquillera: null
    };
  }

  const duracionTotalMinutos = entregas.reduce((acc, e) => acc + e.duracionMinutos, 0);
  const sumaCalificaciones = entregas.reduce((acc, e) => acc + e.calificacionCritica, 0);
  const calificacionPromedio = Number((sumaCalificaciones / entregas.length).toFixed(1));

  const recaudacionTotalMillonesUSD = Number(
    entregas.reduce((acc, e) => acc + e.recaudacionMillonesUSD, 0).toFixed(2)
  );

  const entregaMejorValorada = [...entregas].sort((a, b) => b.calificacionCritica - a.calificacionCritica)[0] ?? null;
  const entregaMasTaquillera = [...entregas].sort((a, b) => b.recaudacionMillonesUSD - a.recaudacionMillonesUSD)[0] ?? null;

  return {
    totalEntregas: entregas.length,
    duracionTotalMinutos,
    calificacionPromedio,
    recaudacionTotalMillonesUSD,
    entregaMejorValorada,
    entregaMasTaquillera
  };
}

export function procesarSagasSciFi(sagasRaw: readonly SagaSciFi[]): ResumenAnalisisSagas {
  const advertencias: string[] = [];
  const sagasProcesadas: SagaProcesada[] = [];

  for (const rawSaga of sagasRaw) {
    const advSaga = validarSagaSciFi(rawSaga);
    advertencias.push(...advSaga);

    const entregasValidas: EntregaSaga[] = [];
    for (const rawEntrega of rawSaga.entregas) {
      const res = validarEntregaSaga(rawEntrega);
      if (res.esValido) {
        entregasValidas.push(res.datos);
      } else {
        advertencias.push(...res.errores.map((err) => `${rawSaga.nombreSaga}: ${err}`));
      }
    }

    const metricas = calcularMetricasSaga(entregasValidas);
    sagasProcesadas.push({
      saga: rawSaga,
      metricas
    });
  }

  const totalSagasValidas = sagasProcesadas.filter((s) => s.metricas.totalEntregas > 0).length;

  const recaudacionGlobalMillonesUSD = Number(
    sagasProcesadas.reduce((acc, s) => acc + s.metricas.recaudacionTotalMillonesUSD, 0).toFixed(2)
  );

  const sumaPromedios = sagasProcesadas.reduce((acc, s) => acc + s.metricas.calificacionPromedio, 0);
  const promedioCalificacionGeneral = totalSagasValidas > 0
    ? Number((sumaPromedios / totalSagasValidas).toFixed(1))
    : 0;

  const sagaMasExitosaObj = [...sagasProcesadas].sort(
    (a, b) => b.metricas.recaudacionTotalMillonesUSD - a.metricas.recaudacionTotalMillonesUSD
  )[0];
  const sagaMasExitosa = sagaMasExitosaObj ? sagaMasExitosaObj.saga.nombreSaga : 'N/A';

  const desglosePorSubgenero = sagasProcesadas.reduce((acc, s) => {
    acc[s.saga.subgenero] = (acc[s.saga.subgenero] ?? 0) + 1;
    return acc;
  }, SUBGENEROS_DISPONIBLES.reduce((acc, sub) => ({ ...acc, [sub]: 0 }), {} as Record<SubgeneroSciFi, number>));

  return {
    totalSagasValidas,
    sagaMasExitosa,
    promedioCalificacionGeneral,
    recaudacionGlobalMillonesUSD,
    desglosePorSubgenero,
    sagas: sagasProcesadas,
    advertencias
  };
}

// ============================================================================
// 4. PRESENTACIÓN Y SALIDA POR CONSOLA
// ============================================================================

export function mostrarResumenSagas(resumen: ResumenAnalisisSagas, tituloCaso: string): void {
  console.log(`\n======================================================================`);
  console.log(` ANALIZADOR DE SAGAS SCI-FI - ${tituloCaso.toUpperCase()}`);
  console.log(`======================================================================`);
  console.log(`Sagas Validadas     : ${resumen.totalSagasValidas}`);
  console.log(`Saga Mas Taquillera : ${resumen.sagaMasExitosa}`);
  console.log(`Promedio Critica    : ${resumen.promedioCalificacionGeneral}%`);
  console.log(`Recaudacion Global  : $${resumen.recaudacionGlobalMillonesUSD.toLocaleString()}M USD`);
  console.log(`----------------------------------------------------------------------`);

  if (resumen.advertencias.length > 0) {
    console.log(`ADVERTENCIAS Y REGISTROS INVALIDOS (${resumen.advertencias.length}):`);
    resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
    console.log(`----------------------------------------------------------------------`);
  }

  console.log(`DESGLOSE DE SAGAS POR SUBGENERO:`);
  Object.entries(resumen.desglosePorSubgenero).forEach(([subgenero, cantidad]) => {
    console.log(`   - ${subgenero.padEnd(16)}: ${cantidad}`);
  });
  console.log(`----------------------------------------------------------------------`);

  console.table(
    resumen.sagas.map((s) => ({
      Saga: s.saga.nombreSaga,
      Subgenero: s.saga.subgenero,
      Medio: s.saga.medioOriginal,
      Entregas: s.metricas.totalEntregas,
      'Duracion Tot': `${s.metricas.duracionTotalMinutos}m`,
      'Critica Prom': `${s.metricas.calificacionPromedio}%`,
      'Recaudacion Tot': `$${s.metricas.recaudacionTotalMillonesUSD}M`,
      'Top Entrega': s.metricas.entregaMejorValorada ? s.metricas.entregaMejorValorada.titulo : 'N/A'
    }))
  );
}

// ============================================================================
// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)
// ============================================================================

// --- CASO 1: Sagas Emblemáticas de Ciencia Ficción (Caso Normal) ---
const sagasNormales: readonly SagaSciFi[] = [
  {
    id: 'SAGA-01',
    nombreSaga: 'Dune',
    creador: 'Denis Villeneuve / Frank Herbert',
    subgenero: 'SpaceOpera',
    medioOriginal: 'Literatura',
    entregas: [
      { id: 'dune-1', titulo: 'Dune: Part One', anioEstreno: 2021, duracionMinutos: 155, calificacionCritica: 83, recaudacionMillonesUSD: 402.0 },
      { id: 'dune-2', titulo: 'Dune: Part Two', anioEstreno: 2024, duracionMinutos: 166, calificacionCritica: 92, recaudacionMillonesUSD: 711.8 }
    ]
  },
  {
    id: 'SAGA-02',
    nombreSaga: 'Matrix',
    creador: 'Hermanas Wachowski',
    subgenero: 'Cyberpunk',
    medioOriginal: 'Cine',
    entregas: [
      { id: 'mat-1', titulo: 'The Matrix', anioEstreno: 1999, duracionMinutos: 136, calificacionCritica: 88, recaudacionMillonesUSD: 467.2 },
      { id: 'mat-2', titulo: 'The Matrix Reloaded', anioEstreno: 2003, duracionMinutos: 138, calificacionCritica: 73, recaudacionMillonesUSD: 741.8 },
      { id: 'mat-3', titulo: 'The Matrix Revolutions', anioEstreno: 2003, duracionMinutos: 129, calificacionCritica: 34, recaudacionMillonesUSD: 427.3 }
    ]
  },
  {
    id: 'SAGA-03',
    nombreSaga: 'Blade Runner',
    creador: 'Ridley Scott / Philip K. Dick',
    subgenero: 'Cyberpunk',
    medioOriginal: 'Literatura',
    entregas: [
      { id: 'br-1', titulo: 'Blade Runner', anioEstreno: 1982, duracionMinutos: 117, calificacionCritica: 89, recaudacionMillonesUSD: 41.5 },
      { id: 'br-2', titulo: 'Blade Runner 2049', anioEstreno: 2017, duracionMinutos: 164, calificacionCritica: 88, recaudacionMillonesUSD: 267.5 }
    ]
  }
];

// --- CASO 2: Datos Corruptos, Entregas Duplicadas y Ratings Fuera de Rango (Caso Límite) ---
const sagasLimiteCorruptas: readonly SagaSciFi[] = [
  {
    id: 'SAGA-04',
    nombreSaga: 'Saga Erronea',
    creador: 'Desconocido',
    subgenero: 'IAConciencia',
    medioOriginal: 'Cine',
    entregas: [
      { id: 'fail-1', titulo: 'AI Rating Imposible', anioEstreno: 2025, duracionMinutos: 120, calificacionCritica: 150, recaudacionMillonesUSD: 100.0 },
      { id: 'fail-2', titulo: 'Duracion Negativa', anioEstreno: 2023, duracionMinutos: -45, calificacionCritica: 60, recaudacionMillonesUSD: 50.0 },
      { id: 'fail-1', titulo: 'AI Rating Duplicado', anioEstreno: 2025, duracionMinutos: 120, calificacionCritica: 80, recaudacionMillonesUSD: 100.0 }
    ]
  }
];

// Ejecución
const resumenNormal = procesarSagasSciFi(sagasNormales);
mostrarResumenSagas(resumenNormal, 'Caso Normal - Sagas Emblematicas Sci-Fi');

const resumenLimite = procesarSagasSciFi(sagasLimiteCorruptas);
mostrarResumenSagas(resumenLimite, 'Caso Limite - Entregas Invalidas y Duplicadas');