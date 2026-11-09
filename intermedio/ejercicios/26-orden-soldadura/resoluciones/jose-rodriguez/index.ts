
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type ProcesoSoldadura =
    | 'SMAW'
    | 'GMAW'
    | 'GTAW'
    | 'FCAW'
    | 'SAW';

export type PosicionSoldadura = '1G' | '2G' | '3G' | '4G' | '5G' | '6G';

export type EstadoInspeccion =
    | 'Aprobado'
    | 'Rechazado'
    | 'PendienteReparacion'
    | 'InspeccionVisualOk';

export type TipoDefecto =
    | 'Ninguno'
    | 'Porosidad'
    | 'FaltaPenetracion'
    | 'Grieta'
    | 'Socavado'
    | 'InclusionEscoria';

export interface SoldadorCertificado {
    readonly id: string;
    readonly nombre: string;
    readonly certificacionWPS: string;
    readonly tarifaHoraUSD: number;
}

export interface JuntaSoldadura {
    readonly id: string;
    readonly codigoJunta: string;
    readonly proceso: ProcesoSoldadura;
    readonly posicion: PosicionSoldadura;
    readonly espesorMaterialMm: number;
    readonly longitudMm: number;
    readonly tiempoEjecucionMinutos: number;
    readonly soldador: SoldadorCertificado;
    readonly defectoDetectado: TipoDefecto;
    readonly estado: EstadoInspeccion;
    readonly costoInsumosUSD: number;
}

export interface MetricasControlSoldadura {
    readonly totalJuntas: number;
    readonly juntasAprobadas: number;
    readonly porcentajeAprobacion: number;
    readonly longitudTotalSoldadaMm: number;
    readonly tiempoTotalHoras: number;
    readonly costoTotalUSD: number;
    readonly juntaMayorLongitud: JuntaSoldadura | null;
    readonly desglosePorProceso: Readonly<Record<ProcesoSoldadura, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoInspeccion, number>>;
    readonly desglosePorDefecto: Readonly<Record<TipoDefecto, number>>;
}

export interface ResumenControlSoldadura {
    readonly totalJuntasValidas: number;
    readonly metricas: MetricasControlSoldadura;
    readonly juntasProcesadas: readonly JuntaSoldadura[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarJuntaSoldadura(junta: JuntaSoldadura): ResultadoValidacion<JuntaSoldadura> {
    const errores: string[] = [];

    if (junta.espesorMaterialMm <= 0 || junta.espesorMaterialMm > 150) {
        errores.push(`Espesor de material invalido en junta "${junta.codigoJunta}" (${junta.espesorMaterialMm} mm).`);
    }

    if (junta.longitudMm <= 0) {
        errores.push(`La longitud soldada debe ser mayor a 0 mm en junta "${junta.codigoJunta}".`);
    }

    if (junta.tiempoEjecucionMinutos <= 0 || junta.tiempoEjecucionMinutos > 1440) {
        errores.push(`Tiempo de ejecucion fuera de rango (${junta.tiempoEjecucionMinutos} min) en junta "${junta.codigoJunta}".`);
    }

    if (junta.costoInsumosUSD < 0) {
        errores.push(`El costo de insumos no puede ser negativo ($${junta.costoInsumosUSD}) en "${junta.codigoJunta}".`);
    }

    if (junta.soldador.tarifaHoraUSD <= 0) {
        errores.push(`La tarifa del soldador ${junta.soldador.nombre} es invalida ($${junta.soldador.tarifaHoraUSD}).`);
    }

    if (junta.estado === 'Aprobado' && junta.defectoDetectado !== 'Ninguno') {
        errores.push(`Inconsistencia en junta "${junta.codigoJunta}": Estado Aprobado pero registra defecto (${junta.defectoDetectado}).`);
    }

    return errores.length === 0
        ? { esValido: true, datos: junta }
        : { esValido: false, errores };
}

export function validarJuntasRaw(juntas: readonly JuntaSoldadura[]): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();
    const codigosVistos = new Set<string>();

    if (juntas.length === 0) {
        advertencias.push('El registro de control de soldaduras no contiene juntas inspeccionadas.');
    }

    for (const junta of juntas) {
        if (idsVistos.has(junta.id)) {
            advertencias.push(`Junta duplicada detectada por ID: ${junta.id}.`);
        }
        if (codigosVistos.has(junta.codigoJunta)) {
            advertencias.push(`Codigo de junta duplicado: ${junta.codigoJunta}.`);
        }
        idsVistos.add(junta.id);
        codigosVistos.add(junta.codigoJunta);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce y Record)

const PROCESOS_SOLDADURA: readonly ProcesoSoldadura[] = ['SMAW', 'GMAW', 'GTAW', 'FCAW', 'SAW'];
const ESTADOS_INSPECCION: readonly EstadoInspeccion[] = ['Aprobado', 'Rechazado', 'PendienteReparacion', 'InspeccionVisualOk'];
const TIPOS_DEFECTO: readonly TipoDefecto[] = ['Ninguno', 'Porosidad', 'FaltaPenetracion', 'Grieta', 'Socavado', 'InclusionEscoria'];

export function calcularMetricasSoldadura(juntas: readonly JuntaSoldadura[]): MetricasControlSoldadura {
    if (juntas.length === 0) {
        const desgloseProcesoVacio = PROCESOS_SOLDADURA.reduce((acc, p) => {
            acc[p] = 0;
            return acc;
        }, {} as Record<ProcesoSoldadura, number>);

        const desgloseEstadoVacio = ESTADOS_INSPECCION.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstadoInspeccion, number>);

        const desgloseDefectoVacio = TIPOS_DEFECTO.reduce((acc, d) => {
            acc[d] = 0;
            return acc;
        }, {} as Record<TipoDefecto, number>);

        return {
            totalJuntas: 0,
            juntasAprobadas: 0,
            porcentajeAprobacion: 0,
            longitudTotalSoldadaMm: 0,
            tiempoTotalHoras: 0,
            costoTotalUSD: 0,
            juntaMayorLongitud: null,
            desglosePorProceso: desgloseProcesoVacio,
            desglosePorEstado: desgloseEstadoVacio,
            desglosePorDefecto: desgloseDefectoVacio
        };
    }

    const juntasAprobadas = juntas.filter(
        (j) => j.estado === 'Aprobado' || j.estado === 'InspeccionVisualOk'
    ).length;

    const porcentajeAprobacion = Number(((juntasAprobadas / juntas.length) * 100).toFixed(1));
    const longitudTotalSoldadaMm = juntas.reduce((acc, j) => acc + j.longitudMm, 0);

    const tiempoTotalHoras = Number(
        (juntas.reduce((acc, j) => acc + j.tiempoEjecucionMinutos, 0) / 60).toFixed(2)
    );

    const costoTotalUSD = Number(
        juntas
            .reduce((acc, j) => {
                const costoManoObra = (j.tiempoEjecucionMinutos / 60) * j.soldador.tarifaHoraUSD;
                return acc + costoManoObra + j.costoInsumosUSD;
            }, 0)
            .toFixed(2)
    );

    const juntaMayorLongitud = [...juntas].sort((a, b) => b.longitudMm - a.longitudMm)[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorProceso = juntas.reduce((acc, j) => {
        acc[j.proceso] = (acc[j.proceso] ?? 0) + 1;
        return acc;
    }, PROCESOS_SOLDADURA.reduce((acc, p) => ({ ...acc, [p]: 0 }), {} as Record<ProcesoSoldadura, number>));

    const desglosePorEstado = juntas.reduce((acc, j) => {
        acc[j.estado] = (acc[j.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_INSPECCION.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoInspeccion, number>));

    const desglosePorDefecto = juntas.reduce((acc, j) => {
        acc[j.defectoDetectado] = (acc[j.defectoDetectado] ?? 0) + 1;
        return acc;
    }, TIPOS_DEFECTO.reduce((acc, d) => ({ ...acc, [d]: 0 }), {} as Record<TipoDefecto, number>));

    return {
        totalJuntas: juntas.length,
        juntasAprobadas,
        porcentajeAprobacion,
        longitudTotalSoldadaMm,
        tiempoTotalHoras,
        costoTotalUSD,
        juntaMayorLongitud,
        desglosePorProceso,
        desglosePorEstado,
        desglosePorDefecto
    };
}

export function procesarControlSoldadura(juntasRaw: readonly JuntaSoldadura[]): ResumenControlSoldadura {
    const advertencias: string[] = [...validarJuntasRaw(juntasRaw)];
    const juntasValidas: JuntaSoldadura[] = [];

    for (const raw of juntasRaw) {
        const res = validarJuntaSoldadura(raw);
        if (res.esValido) {
            juntasValidas.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const metricas = calcularMetricasSoldadura(juntasValidas);

    return {
        totalJuntasValidas: juntasValidas.length,
        metricas,
        juntasProcesadas: juntasValidas,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenSoldadura(resumen: ResumenControlSoldadura, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` CONTROL DE SOLDADURA - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Juntas Validadas   : ${resumen.totalJuntasValidas}`);
    console.log(`Juntas Aprobadas   : ${resumen.metricas.juntasAprobadas} de ${resumen.metricas.totalJuntas} (${resumen.metricas.porcentajeAprobacion}%)`);
    console.log(`Longitud Soldada   : ${(resumen.metricas.longitudTotalSoldadaMm / 1000).toFixed(2)} metros (${resumen.metricas.longitudTotalSoldadaMm.toLocaleString()} mm)`);
    console.log(`Tiempo Total Labor : ${resumen.metricas.tiempoTotalHoras} horas`);
    console.log(`Costo Total Proceso: $${resumen.metricas.costoTotalUSD.toLocaleString()} USD`);
    console.log(`Junta Mayor Longitud: ${resumen.metricas.juntaMayorLongitud ? `${resumen.metricas.juntaMayorLongitud.codigoJunta} (${resumen.metricas.juntaMayorLongitud.longitudMm} mm - Proceso ${resumen.metricas.juntaMayorLongitud.proceso})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y ERRORES DE CONTROL (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE JUNTAS POR PROCESO:`);
    Object.entries(resumen.metricas.desglosePorProceso).forEach(([proceso, cantidad]) => {
        console.log(`   - ${proceso.padEnd(10)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.juntasProcesadas.map((j) => ({
            ID: j.id,
            Junta: j.codigoJunta,
            Proceso: j.proceso,
            Posicion: j.posicion,
            'Espesor (mm)': `${j.espesorMaterialMm}mm`,
            'Longitud (mm)': `${j.longitudMm}mm`,
            'Tiempo (min)': `${j.tiempoEjecucionMinutos}m`,
            Soldador: j.soldador.nombre,
            Defecto: j.defectoDetectado,
            Estado: j.estado
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const soldador1: SoldadorCertificado = { id: 'weld-01', nombre: 'Jose Rodriguez', certificacionWPS: 'AWS-D1.1-GTAW', tarifaHoraUSD: 38 };
const soldador2: SoldadorCertificado = { id: 'weld-02', nombre: 'Mario Lopez', certificacionWPS: 'ASME-IX-GMAW', tarifaHoraUSD: 42 };

// --- CASO 1: Inspección de Soldadura de Estructura Industrial (Caso Normal) ---
const juntasNormales: readonly JuntaSoldadura[] = [
    {
        id: 'JNT-001',
        codigoJunta: 'WELD_BEAM_A1',
        proceso: 'GTAW',
        posicion: '3G',
        espesorMaterialMm: 12.5,
        longitudMm: 1500,
        tiempoEjecucionMinutos: 90,
        soldador: soldador1,
        defectoDetectado: 'Ninguno',
        estado: 'Aprobado',
        costoInsumosUSD: 45
    },
    {
        id: 'JNT-002',
        codigoJunta: 'WELD_PIPE_B4',
        proceso: 'GMAW',
        posicion: '6G',
        espesorMaterialMm: 16.0,
        longitudMm: 850,
        tiempoEjecucionMinutos: 120,
        soldador: soldador2,
        defectoDetectado: 'Porosidad',
        estado: 'PendienteReparacion',
        costoInsumosUSD: 60
    },
    {
        id: 'JNT-003',
        codigoJunta: 'WELD_PLATE_C2',
        proceso: 'FCAW',
        posicion: '2G',
        espesorMaterialMm: 20.0,
        longitudMm: 2200,
        tiempoEjecucionMinutos: 110,
        soldador: soldador1,
        defectoDetectado: 'Ninguno',
        estado: 'InspeccionVisualOk',
        costoInsumosUSD: 85
    }
];

// --- CASO 2: Inconsistencia Aprobado con Defecto, Tiempos Fuera de Rango y Código Duplicado (Caso Límite) ---
const juntasLimiteCorruptas: readonly JuntaSoldadura[] = [
    {
        id: 'JNT-004',
        codigoJunta: 'WELD_ERR_INCONSISTENTE',
        proceso: 'SMAW',
        posicion: '1G',
        espesorMaterialMm: 10.0,
        longitudMm: 500,
        tiempoEjecucionMinutos: 45,
        soldador: soldador1,
        defectoDetectado: 'Grieta', // Inconsistencia: Grieta pero estado Aprobado
        estado: 'Aprobado',
        costoInsumosUSD: 30
    },
    {
        id: 'JNT-005',
        codigoJunta: 'WELD_ERR_TIEMPO',
        proceso: 'SAW',
        posicion: '1G',
        espesorMaterialMm: 0, // Espesor 0 -> Invalido
        longitudMm: 1000,
        tiempoEjecucionMinutos: 2000, // Tiempo > 1440 min -> Invalido
        soldador: soldador2,
        defectoDetectado: 'Socavado',
        estado: 'Rechazado',
        costoInsumosUSD: -15 // Costo negativo -> Invalido
    },
    {
        id: 'JNT-001', // ID Duplicado con JNT-001
        codigoJunta: 'WELD_BEAM_A1', // Codigo junta duplicado
        proceso: 'GTAW',
        posicion: '3G',
        espesorMaterialMm: 12.5,
        longitudMm: 1500,
        tiempoEjecucionMinutos: 90,
        soldador: soldador1,
        defectoDetectado: 'Ninguno',
        estado: 'Aprobado',
        costoInsumosUSD: 45
    }
];

// Ejecución
const resumenNormal = procesarControlSoldadura(juntasNormales);
mostrarResumenSoldadura(resumenNormal, 'Caso Normal - Estructura Nivel Industrial');

const resumenLimite = procesarControlSoldadura(juntasLimiteCorruptas);
mostrarResumenSoldadura(resumenLimite, 'Caso Limite - Inconsistencia Aprobado/Defecto y Codigo Duplicado');