
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type EtapaPipeline =
    | 'Modelado'
    | 'Rigging'
    | 'Animacion'
    | 'Texturizado'
    | 'Iluminacion'
    | 'Renderizado'
    | 'Composicion';

export type EstadoToma = 'Pendiente' | 'EnProceso' | 'EnRevision' | 'Aprobado' | 'Rechazado';
export type ComplejidadToma = 'Baja' | 'Media' | 'Alta' | 'Extrema';

export interface Artista3D {
    readonly id: string;
    readonly nombre: string;
    readonly especialidad: EtapaPipeline;
    readonly costoHoraUSD: number;
}

export interface Toma3D {
    readonly id: string;
    readonly codigoToma: string;
    readonly etapaActual: EtapaPipeline;
    readonly complejidad: ComplejidadToma;
    readonly numeroFotogramas: number;
    readonly tiempoRenderHoraPorFrame: number;
    readonly horasTrabajadas: number;
    readonly artistaAsignado: Artista3D;
    readonly estado: EstadoToma;
}

export interface ProyectoAnimacion3D {
    readonly id: string;
    readonly nombreProyecto: string;
    readonly fps: number;
    readonly tomas: readonly Toma3D[];
}

export interface MetricasPipeline {
    readonly totalTomas: number;
    readonly tomasAprobadas: number;
    readonly porcentajeAprobacion: number;
    readonly totalFotogramas: number;
    readonly tiempoTotalRenderHoras: number;
    readonly costoTotalProduccionUSD: number;
    readonly tomaMasCompleja: Toma3D | null;
    readonly desglosePorEtapa: Readonly<Record<EtapaPipeline, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoToma, number>>;
}

export interface ResumenPipelineAnimacion {
    readonly proyectoId: string;
    readonly nombreProyecto: string;
    readonly totalTomasValidas: number;
    readonly metricas: MetricasPipeline;
    readonly tomasProcesadas: readonly Toma3D[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarToma3D(toma: Toma3D): ResultadoValidacion<Toma3D> {
    const errores: string[] = [];

    if (toma.numeroFotogramas <= 0 || toma.numeroFotogramas > 10000) {
        errores.push(`El numero de fotogramas de la toma "${toma.codigoToma}" es invalido (${toma.numeroFotogramas} frames).`);
    }

    if (toma.tiempoRenderHoraPorFrame < 0 || toma.tiempoRenderHoraPorFrame > 24) {
        errores.push(`El tiempo de render por frame de "${toma.codigoToma}" esta fuera de rango (${toma.tiempoRenderHoraPorFrame}h/frame).`);
    }

    if (toma.horasTrabajadas < 0) {
        errores.push(`Las horas trabajadas en "${toma.codigoToma}" no pueden ser negativas (${toma.horasTrabajadas}h).`);
    }

    if (toma.artistaAsignado.costoHoraUSD <= 0) {
        errores.push(`El costo por hora del artista ${toma.artistaAsignado.nombre} es invalido ($${toma.artistaAsignado.costoHoraUSD}).`);
    }

    return errores.length === 0
        ? { esValido: true, datos: toma }
        : { esValido: false, errores };
}

export function validarProyectoRaw(proyecto: ProyectoAnimacion3D): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();
    const codigosVistos = new Set<string>();

    if (proyecto.fps <= 0 || proyecto.fps > 120) {
        advertencias.push(`Frecuencia de cuadros (FPS) invalida en el proyecto (${proyecto.fps} fps).`);
    }

    if (proyecto.tomas.length === 0) {
        advertencias.push(`El proyecto "${proyecto.nombreProyecto}" no contiene tomas registradas en el pipeline.`);
    }

    for (const toma of proyecto.tomas) {
        if (idsVistos.has(toma.id)) {
            advertencias.push(`Toma duplicada detectada por ID: ${toma.id}.`);
        }
        if (codigosVistos.has(toma.codigoToma)) {
            advertencias.push(`Codigo de toma duplicado: ${toma.codigoToma}.`);
        }
        idsVistos.add(toma.id);
        codigosVistos.add(toma.codigoToma);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce y Record)

const ETAPAS_PIPELINE: readonly EtapaPipeline[] = [
    'Modelado',
    'Rigging',
    'Animacion',
    'Texturizado',
    'Iluminacion',
    'Renderizado',
    'Composicion'
];

const ESTADOS_TOMA: readonly EstadoToma[] = [
    'Pendiente',
    'EnProceso',
    'EnRevision',
    'Aprobado',
    'Rechazado'
];

const PESO_COMPLEJIDAD: Readonly<Record<ComplejidadToma, number>> = {
    Baja: 1,
    Media: 2,
    Alta: 3,
    Extrema: 4
};

export function calcularMetricasPipeline(tomas: readonly Toma3D[]): MetricasPipeline {
    if (tomas.length === 0) {
        const desgloseEtapaVacio = ETAPAS_PIPELINE.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EtapaPipeline, number>);

        const desgloseEstadoVacio = ESTADOS_TOMA.reduce((acc, est) => {
            acc[est] = 0;
            return acc;
        }, {} as Record<EstadoToma, number>);

        return {
            totalTomas: 0,
            tomasAprobadas: 0,
            porcentajeAprobacion: 0,
            totalFotogramas: 0,
            tiempoTotalRenderHoras: 0,
            costoTotalProduccionUSD: 0,
            tomaMasCompleja: null,
            desglosePorEtapa: desgloseEtapaVacio,
            desglosePorEstado: desgloseEstadoVacio
        };
    }

    const tomasAprobadas = tomas.filter((t) => t.estado === 'Aprobado').length;
    const porcentajeAprobacion = Number(((tomasAprobadas / tomas.length) * 100).toFixed(1));

    const totalFotogramas = tomas.reduce((acc, t) => acc + t.numeroFotogramas, 0);

    const tiempoTotalRenderHoras = Number(
        tomas
            .reduce((acc, t) => acc + t.numeroFotogramas * t.tiempoRenderHoraPorFrame, 0)
            .toFixed(2)
    );

    const costoTotalProduccionUSD = Number(
        tomas
            .reduce((acc, t) => acc + t.horasTrabajadas * t.artistaAsignado.costoHoraUSD, 0)
            .toFixed(2)
    );

    const tomaMasCompleja = [...tomas].sort(
        (a, b) => PESO_COMPLEJIDAD[b.complejidad] - PESO_COMPLEJIDAD[a.complejidad]
    )[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorEtapa = tomas.reduce((acc, t) => {
        acc[t.etapaActual] = (acc[t.etapaActual] ?? 0) + 1;
        return acc;
    }, ETAPAS_PIPELINE.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EtapaPipeline, number>));

    const desglosePorEstado = tomas.reduce((acc, t) => {
        acc[t.estado] = (acc[t.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_TOMA.reduce((acc, est) => ({ ...acc, [est]: 0 }), {} as Record<EstadoToma, number>));

    return {
        totalTomas: tomas.length,
        tomasAprobadas,
        porcentajeAprobacion,
        totalFotogramas,
        tiempoTotalRenderHoras,
        costoTotalProduccionUSD,
        tomaMasCompleja,
        desglosePorEtapa,
        desglosePorEstado
    };
}

export function procesarPipelineAnimacion(proyectoRaw: ProyectoAnimacion3D): ResumenPipelineAnimacion {
    const advertencias: string[] = [...validarProyectoRaw(proyectoRaw)];
    const tomasValidas: Toma3D[] = [];

    for (const raw of proyectoRaw.tomas) {
        const res = validarToma3D(raw);
        if (res.esValido) {
            tomasValidas.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const metricas = calcularMetricasPipeline(tomasValidas);

    return {
        proyectoId: proyectoRaw.id,
        nombreProyecto: proyectoRaw.nombreProyecto,
        totalTomasValidas: tomasValidas.length,
        metricas,
        tomasProcesadas: tomasValidas,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenPipeline(resumen: ResumenPipelineAnimacion, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` PIPELINE DE ANIMACION 3D - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Proyecto            : ${resumen.nombreProyecto}`);
    console.log(`Tomas Validadas     : ${resumen.totalTomasValidas}`);
    console.log(`Tomas Aprobadas     : ${resumen.metricas.tomasAprobadas} de ${resumen.metricas.totalTomas} (${resumen.metricas.porcentajeAprobacion}%)`);
    console.log(`Fotogramas Totales  : ${resumen.metricas.totalFotogramas.toLocaleString()} frames`);
    console.log(`Tiempo Render Total : ${resumen.metricas.tiempoTotalRenderHoras.toLocaleString()} horas de render`);
    console.log(`Costo Produccion USD: $${resumen.metricas.costoTotalProduccionUSD.toLocaleString()} USD`);
    console.log(`Toma Mas Compleja   : ${resumen.metricas.tomaMasCompleja ? `${resumen.metricas.tomaMasCompleja.codigoToma} (Complejidad: ${resumen.metricas.tomaMasCompleja.complejidad})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE PIPELINE (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE TOMAS POR ETAPA DEL PIPELINE:`);
    Object.entries(resumen.metricas.desglosePorEtapa).forEach(([etapa, cantidad]) => {
        console.log(`   - ${etapa.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.tomasProcesadas.map((t) => ({
            ID: t.id,
            Codigo: t.codigoToma,
            Etapa: t.etapaActual,
            Complejidad: t.complejidad,
            Frames: t.numeroFotogramas,
            'Render (h/f)': `${t.tiempoRenderHoraPorFrame}h`,
            'Horas Artista': `${t.horasTrabajadas}h`,
            Artista: t.artistaAsignado.nombre,
            Estado: t.estado
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const artistaMod: Artista3D = { id: 'art-01', nombre: 'Carlos Ruiz', especialidad: 'Modelado', costoHoraUSD: 45 };
const artistaAnim: Artista3D = { id: 'art-02', nombre: 'Elena Blanco', especialidad: 'Animacion', costoHoraUSD: 65 };
const artistaRnd: Artista3D = { id: 'art-03', nombre: 'Mateo Silva', especialidad: 'Renderizado', costoHoraUSD: 55 };

// --- CASO 1: Cortometraje Animado en Producción (Caso Normal) ---
const proyectoNormal: ProyectoAnimacion3D = {
    id: 'PROJ-3D-001',
    nombreProyecto: 'Cyber Odyssey Short Film',
    fps: 24,
    tomas: [
        {
            id: 'TOM-001',
            codigoToma: 'SHOT_010',
            etapaActual: 'Animacion',
            complejidad: 'Media',
            numeroFotogramas: 120,
            tiempoRenderHoraPorFrame: 0.15,
            horasTrabajadas: 16,
            artistaAsignado: artistaAnim,
            estado: 'EnProceso'
        },
        {
            id: 'TOM-002',
            codigoToma: 'SHOT_020',
            etapaActual: 'Renderizado',
            complejidad: 'Alta',
            numeroFotogramas: 240,
            tiempoRenderHoraPorFrame: 0.45,
            horasTrabajadas: 30,
            artistaAsignado: artistaRnd,
            estado: 'EnRevision'
        },
        {
            id: 'TOM-003',
            codigoToma: 'SHOT_030',
            etapaActual: 'Composicion',
            complejidad: 'Extrema',
            numeroFotogramas: 180,
            tiempoRenderHoraPorFrame: 0.8,
            horasTrabajadas: 45,
            artistaAsignado: artistaAnim,
            estado: 'Aprobado'
        },
        {
            id: 'TOM-004',
            codigoToma: 'SHOT_040',
            etapaActual: 'Modelado',
            complejidad: 'Baja',
            numeroFotogramas: 90,
            tiempoRenderHoraPorFrame: 0.05,
            horasTrabajadas: 8,
            artistaAsignado: artistaMod,
            estado: 'Aprobado'
        }
    ]
};

// --- CASO 2: Fotogramas Negativos, Horas Imposibles y Tomas Duplicadas (Caso Límite) ---
const proyectoLimiteCorrupto: ProyectoAnimacion3D = {
    id: 'PROJ-FAIL-02',
    nombreProyecto: 'Proyecto Con Errores 3D',
    fps: 0, // FPS invalido
    tomas: [
        {
            id: 'TOM-005',
            codigoToma: 'SHOT_ERR1',
            etapaActual: 'Rigging',
            complejidad: 'Media',
            numeroFotogramas: -50, // Fotogramas negativos -> Invalido
            tiempoRenderHoraPorFrame: 0.2,
            horasTrabajadas: 10,
            artistaAsignado: artistaMod,
            estado: 'Pendiente'
        },
        {
            id: 'TOM-006',
            codigoToma: 'SHOT_ERR2',
            etapaActual: 'Iluminacion',
            complejidad: 'Alta',
            numeroFotogramas: 100,
            tiempoRenderHoraPorFrame: 30.0, // Render > 24h/frame -> Invalido
            horasTrabajadas: -5, // Horas negativas -> Invalido
            artistaAsignado: artistaRnd,
            estado: 'Rechazado'
        },
        {
            id: 'TOM-001', // ID Duplicado con TOM-001
            codigoToma: 'SHOT_010', // Codigo duplicado
            etapaActual: 'Animacion',
            complejidad: 'Media',
            numeroFotogramas: 120,
            tiempoRenderHoraPorFrame: 0.15,
            horasTrabajadas: 16,
            artistaAsignado: artistaAnim,
            estado: 'EnProceso'
        }
    ]
};

// Ejecución
const resumenNormal = procesarPipelineAnimacion(proyectoNormal);
mostrarResumenPipeline(resumenNormal, 'Caso Normal - Cortometraje Cyber Odyssey');

const resumenLimite = procesarPipelineAnimacion(proyectoLimiteCorrupto);
mostrarResumenPipeline(resumenLimite, 'Caso Limite - Frames Negativos y Codigos Duplicados');