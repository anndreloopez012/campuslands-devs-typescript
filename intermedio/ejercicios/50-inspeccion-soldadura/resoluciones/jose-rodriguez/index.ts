
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Clases)

export type ProcesoSoldadura =
    | 'SMAW'
    | 'GMAW'
    | 'GTAW'
    | 'FCAW'
    | 'SAW';

export type TipoJunta =
    | 'Tope'
    | 'Filete'
    | 'Solape'
    | 'Esquina'
    | 'Borde';

export type TipoDefecto =
    | 'Porosidad'
    | 'Socavado'
    | 'Fisura'
    | 'FaltaPenetracion'
    | 'Salpicaduras'
    | 'ExcesoRefuerzo'
    | 'Ninguno';

export type ResultadoInspeccion =
    | 'Aprobado'
    | 'Rechazado'
    | 'Reparacion'
    | 'Pendiente';

export type NivelCriterio =
    | 'AWS_D1_1'
    | 'ISO_5817_B'
    | 'ISO_5817_C'
    | 'ISO_5817_D';

export interface JuntaSoldada {
    readonly id: string;
    readonly codigoJunta: string;
    readonly proceso: ProcesoSoldadura;
    readonly tipoJunta: TipoJunta;
    readonly espesorBaseMM: number;
    readonly longitudMM: number;
}

export interface RegistroInspeccionVisual {
    readonly id: string;
    readonly codigoInspeccion: string;
    readonly junta: JuntaSoldada;
    readonly inspectorNombre: string;
    readonly defectoDetectado: TipoDefecto;
    readonly profundidadDefectoMM: number;
    readonly longitudDefectoMM: number;
    readonly resultado: ResultadoInspeccion;
    readonly normaAplicada: NivelCriterio;
    readonly requiereNDTSuplementario: boolean;
}

export interface InformeInspeccionSoldadura {
    readonly id: string;
    readonly codigoInforme: string;
    readonly nombreProyecto: string;
    readonly cliente: string;
    readonly inspecciones: readonly RegistroInspeccionVisual[];
}

export interface MetricasInspeccionSoldadura {
    readonly totalInspecciones: number;
    readonly juntasAprobadasCount: number;
    readonly porcentajeAprobacion: number;
    readonly longitudTotalInspeccionadaMM: number;
    readonly totalDefectosCriticos: number;
    readonly defectoMasFrecuente: TipoDefecto | null;
    readonly desglosePorProceso: Readonly<Record<ProcesoSoldadura, number>>;
    readonly desglosePorResultado: Readonly<Record<ResultadoInspeccion, number>>;
}

export interface ResumenInspeccionSoldadura {
    readonly informeId: string;
    readonly codigoInforme: string;
    readonly nombreProyecto: string;
    readonly totalInspeccionesValidas: number;
    readonly metricas: MetricasInspeccionSoldadura;
    readonly inspeccionesProcesadas: readonly RegistroInspeccionVisual[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y CLASE DE CONTROL (Generics & Encapsulamiento)

export class ContenedorInspecciones<T extends { readonly id: string; readonly codigoInspeccion: string }> {
    private readonly elementos: Map<string, T> = new Map();

    public agregar(item: T): boolean {
        if (this.elementos.has(item.id)) {
            return false;
        }
        this.elementos.set(item.id, item);
        return true;
    }

    public obtenerPorId(id: string): T | undefined {
        return this.elementos.get(id);
    }

    public obtenerTodos(): readonly T[] {
        return Array.from(this.elementos.values());
    }

    public existe(id: string): boolean {
        return this.elementos.has(id);
    }

    public obtenerTamano(): number {
        return this.elementos.size;
    }
}

// 3. VALIDACIONES Y REGLAS DE NEGOCIO

export function validarJunta(junta: JuntaSoldada): ResultadoValidacion<JuntaSoldada> {
    const errores: string[] = [];

    if (junta.espesorBaseMM <= 0 || junta.espesorBaseMM > 200) {
        errores.push(`Espesor de metal base inválido (${junta.espesorBaseMM} mm) en junta "${junta.codigoJunta}".`);
    }

    if (junta.longitudMM <= 0 || junta.longitudMM > 50000) {
        errores.push(`Longitud de junta soldada inválida (${junta.longitudMM} mm) en "${junta.codigoJunta}".`);
    }

    if (junta.codigoJunta.trim().length === 0) {
        errores.push('La junta soldada debe registrar un código de junta válido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: junta }
        : { esValido: false, errores };
}

export function validarRegistroInspeccion(
    inspeccion: RegistroInspeccionVisual
): ResultadoValidacion<RegistroInspeccionVisual> {
    const errores: string[] = [];

    if (inspeccion.profundidadDefectoMM < 0) {
        errores.push(`Profundidad de defecto negativa (${inspeccion.profundidadDefectoMM} mm) en "${inspeccion.codigoInspeccion}".`);
    }

    if (inspeccion.longitudDefectoMM < 0 || inspeccion.longitudDefectoMM > inspeccion.junta.longitudMM) {
        errores.push(
            `Longitud de defecto (${inspeccion.longitudDefectoMM} mm) supera la longitud total de la junta (${inspeccion.junta.longitudMM} mm) en "${inspeccion.codigoInspeccion}".`
        );
    }

    if (inspeccion.defectoDetectado === 'Ninguno' && (inspeccion.profundidadDefectoMM > 0 || inspeccion.longitudDefectoMM > 0)) {
        errores.push(
            `Inconsistencia en "${inspeccion.codigoInspeccion}": Defecto registrado como "Ninguno" pero con dimensiones mayores a 0.`
        );
    }

    if (inspeccion.defectoDetectado !== 'Ninguno' && inspeccion.resultado === 'Aprobado' && inspeccion.profundidadDefectoMM > 2.0) {
        errores.push(
            `Inconsistencia en "${inspeccion.codigoInspeccion}": Defecto "${inspeccion.defectoDetectado}" con profundidad ${inspeccion.profundidadDefectoMM} mm no puede estar Aprobado.`
        );
    }

    if (inspeccion.inspectorNombre.trim().length === 0) {
        errores.push(`La inspección "${inspeccion.codigoInspeccion}" debe incluir el nombre del inspector CWI/VT.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: inspeccion }
        : { esValido: false, errores };
}

export function validarInformeRaw(informe: InformeInspeccionSoldadura): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();
    const codigosVistos = new Set<string>();

    if (informe.inspecciones.length === 0) {
        advertencias.push(`El informe de inspección "${informe.codigoInforme}" no registra juntas inspeccionadas.`);
    }

    for (const insp of informe.inspecciones) {
        if (idsVistos.has(insp.id)) {
            advertencias.push(`Registro de inspección duplicado por ID: ${insp.id}.`);
        }
        if (codigosVistos.has(insp.codigoInspeccion)) {
            advertencias.push(`Código de inspección duplicado detectado: ${insp.codigoInspeccion}.`);
        }
        idsVistos.add(insp.id);
        codigosVistos.add(insp.codigoInspeccion);
    }

    return advertencias;
}

// 4. TRANSFORMACIÓN Y CÁLCULOS MÉTRICOS (reduce & Record)

const PROCESOS_SOLDADURA: readonly ProcesoSoldadura[] = [
    'SMAW',
    'GMAW',
    'GTAW',
    'FCAW',
    'SAW'
];

const RESULTADOS_INSPECCION: readonly ResultadoInspeccion[] = [
    'Aprobado',
    'Rechazado',
    'Reparacion',
    'Pendiente'
];

export function calcularMetricasInspeccion(
    inspecciones: readonly RegistroInspeccionVisual[]
): MetricasInspeccionSoldadura {
    if (inspecciones.length === 0) {
        const desgloseProcVacio = PROCESOS_SOLDADURA.reduce((acc, p) => {
            acc[p] = 0;
            return acc;
        }, {} as Record<ProcesoSoldadura, number>);

        const desgloseResVacio = RESULTADOS_INSPECCION.reduce((acc, r) => {
            acc[r] = 0;
            return acc;
        }, {} as Record<ResultadoInspeccion, number>);

        return {
            totalInspecciones: 0,
            juntasAprobadasCount: 0,
            porcentajeAprobacion: 0,
            longitudTotalInspeccionadaMM: 0,
            totalDefectosCriticos: 0,
            defectoMasFrecuente: null,
            desglosePorProceso: desgloseProcVacio,
            desglosePorResultado: desgloseResVacio
        };
    }

    const aprobadas = inspecciones.filter((i) => i.resultado === 'Aprobado');
    const juntasAprobadasCount = aprobadas.length;
    const porcentajeAprobacion = Number(((juntasAprobadasCount / inspecciones.length) * 100).toFixed(1));

    const longitudTotalInspeccionadaMM = inspecciones.reduce((acc, i) => acc + i.junta.longitudMM, 0);

    const criticos = inspecciones.filter(
        (i) => i.defectoDetectado === 'Fisura' || i.defectoDetectado === 'FaltaPenetracion' || i.resultado === 'Rechazado'
    );
    const totalDefectosCriticos = criticos.length;

    // Conteo de frecuencia de defectos
    const conteoDefectos = inspecciones.reduce((acc, i) => {
        if (i.defectoDetectado !== 'Ninguno') {
            acc[i.defectoDetectado] = (acc[i.defectoDetectado] ?? 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const defectoMasFrecuente = (Object.entries(conteoDefectos).sort(
        (a, b) => b[1] - a[1]
    )[0]?.[0] as TipoDefecto) ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorProceso = inspecciones.reduce((acc, i) => {
        acc[i.junta.proceso] = (acc[i.junta.proceso] ?? 0) + 1;
        return acc;
    }, PROCESOS_SOLDADURA.reduce((acc, p) => ({ ...acc, [p]: 0 }), {} as Record<ProcesoSoldadura, number>));

    const desglosePorResultado = inspecciones.reduce((acc, i) => {
        acc[i.resultado] = (acc[i.resultado] ?? 0) + 1;
        return acc;
    }, RESULTADOS_INSPECCION.reduce((acc, r) => ({ ...acc, [r]: 0 }), {} as Record<ResultadoInspeccion, number>));

    return {
        totalInspecciones: inspecciones.length,
        juntasAprobadasCount,
        porcentajeAprobacion,
        longitudTotalInspeccionadaMM,
        totalDefectosCriticos,
        defectoMasFrecuente,
        desglosePorProceso,
        desglosePorResultado
    };
}

export class ServicioGestionInspeccionSoldadura {
    private readonly contenedor = new ContenedorInspecciones<RegistroInspeccionVisual>();
    private readonly advertencias: string[] = [];

    constructor(private readonly informeRaw: InformeInspeccionSoldadura) { }

    public procesarInforme(): ResumenInspeccionSoldadura {
        this.advertencias.push(...validarInformeRaw(this.informeRaw));

        for (const rawInsp of this.informeRaw.inspecciones) {
            const resJunta = validarJunta(rawInsp.junta);
            const resInsp = validarRegistroInspeccion(rawInsp);

            if (!resJunta.esValido) {
                this.advertencias.push(...resJunta.errores);
            }
            if (!resInsp.esValido) {
                this.advertencias.push(...resInsp.errores);
            }

            if (resJunta.esValido && resInsp.esValido) {
                const agregado = this.contenedor.agregar(rawInsp);
                if (!agregado) {
                    this.advertencias.push(`No se pudo agregar la inspección duplicada por ID: ${rawInsp.id}`);
                }
            }
        }

        const inspeccionesValidas = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasInspeccion(inspeccionesValidas);

        const fisurasDetectadas = inspeccionesValidas.filter((i) => i.defectoDetectado === 'Fisura');
        if (fisurasDetectadas.length > 0) {
            this.advertencias.push(
                `Alerta de seguridad estructural: Se detectaron ${fisurasDetectadas.length} fisura(s) críticas en las juntas inspeccionadas.`
            );
        }

        return {
            informeId: this.informeRaw.id,
            codigoInforme: this.informeRaw.codigoInforme,
            nombreProyecto: this.informeRaw.nombreProyecto,
            totalInspeccionesValidas: inspeccionesValidas.length,
            metricas,
            inspeccionesProcesadas: inspeccionesValidas,
            advertencias: this.advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenInspeccion(resumen: ResumenInspeccionSoldadura, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` INSPECCIÓN VISUAL DE SOLDADURA - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Proyecto ESTRUCTURAL: ${resumen.nombreProyecto}`);
    console.log(`Código Informe      : ${resumen.codigoInforme}`);
    console.log(`Inspecciones Válidas: ${resumen.totalInspeccionesValidas}`);
    console.log(`Longitud Inspeccionada: ${(resumen.metricas.longitudTotalInspeccionadaMM / 1000).toFixed(2)} metros (${resumen.metricas.longitudTotalInspeccionadaMM} mm)`);
    console.log(`Porcentaje Aprobación: ${resumen.metricas.juntasAprobadasCount} de ${resumen.metricas.totalInspecciones} (${resumen.metricas.porcentajeAprobacion}%)`);
    console.log(`Defectos Críticos    : ${resumen.metricas.totalDefectosCriticos}`);
    console.log(`Defecto Frecuente    : ${resumen.metricas.defectoMasFrecuente ?? 'Ninguno'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE CALIDAD (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR PROCESO DE SOLDADURA:`);
    Object.entries(resumen.metricas.desglosePorProceso).forEach(([proceso, cantidad]) => {
        console.log(`   - ${proceso.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.inspeccionesProcesadas.map((i) => ({
            Código: i.codigoInspeccion,
            Junta: i.junta.codigoJunta,
            Proceso: i.junta.proceso,
            Tipo: i.junta.tipoJunta,
            'Espesor mm': `${i.junta.espesorBaseMM} mm`,
            Defecto: i.defectoDetectado,
            'Dim. Defecto': i.defectoDetectado === 'Ninguno' ? 'N/A' : `${i.profundidadDefectoMM}mm x ${i.longitudDefectoMM}mm`,
            Norma: i.normaAplicada,
            NDT: i.requiereNDTSuplementario ? 'Sí' : 'No',
            Resultado: i.resultado
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const j1: JuntaSoldada = { id: 'jnt-01', codigoJunta: 'JNT-COL-01', proceso: 'GMAW', tipoJunta: 'Tope', espesorBaseMM: 19.0, longitudMM: 1200 };
const j2: JuntaSoldada = { id: 'jnt-02', codigoJunta: 'JNT-VIG-02', proceso: 'SMAW', tipoJunta: 'Filete', espesorBaseMM: 25.4, longitudMM: 850 };
const j3: JuntaSoldada = { id: 'jnt-03', codigoJunta: 'JNT-TUB-03', proceso: 'GTAW', tipoJunta: 'Tope', espesorBaseMM: 9.5, longitudMM: 600 };

const i1: RegistroInspeccionVisual = {
    id: 'insp-01',
    codigoInspeccion: 'VT-2026-001',
    junta: j1,
    inspectorNombre: 'Ing. José Rodríguez (CWI #190203)',
    defectoDetectado: 'Ninguno',
    profundidadDefectoMM: 0,
    longitudDefectoMM: 0,
    resultado: 'Aprobado',
    normaAplicada: 'AWS_D1_1',
    requiereNDTSuplementario: false
};

const i2: RegistroInspeccionVisual = {
    id: 'insp-02',
    codigoInspeccion: 'VT-2026-002',
    junta: j2,
    inspectorNombre: 'Ing. José Rodríguez (CWI #190203)',
    defectoDetectado: 'Porosidad',
    profundidadDefectoMM: 1.2,
    longitudDefectoMM: 15,
    resultado: 'Reparacion',
    normaAplicada: 'AWS_D1_1',
    requiereNDTSuplementario: true
};

const i3: RegistroInspeccionVisual = {
    id: 'insp-03',
    codigoInspeccion: 'VT-2026-003',
    junta: j3,
    inspectorNombre: 'Ing. José Rodríguez (CWI #190203)',
    defectoDetectado: 'Ninguno',
    profundidadDefectoMM: 0,
    longitudDefectoMM: 0,
    resultado: 'Aprobado',
    normaAplicada: 'ISO_5817_B',
    requiereNDTSuplementario: false
};

// --- CASO 1: Inspección de Estructura Metálica Puente Industrial (Caso Normal) ---
const informeNormal: InformeInspeccionSoldadura = {
    id: 'INF-WELD-2026',
    codigoInforme: 'VT-PUENTE-01',
    nombreProyecto: 'Puente Grúa Estructural Naves Industriales',
    cliente: 'Corporación Acero & Estructuras S.A.',
    inspecciones: [i1, i2, i3]
};

// --- CASO 2: Fisura Crítica, Inconsistencia de Dimensiones y Código Duplicado (Caso Límite) ---
const juntaCorrupta: JuntaSoldada = {
    id: 'jnt-99',
    codigoJunta: 'JNT-ERR-999',
    proceso: 'FCAW',
    tipoJunta: 'Tope',
    espesorBaseMM: -5.0, // Espesor negativo -> Inválido
    longitudMM: 500
};

const inspeccionCorrupta: RegistroInspeccionVisual = {
    id: 'insp-99',
    codigoInspeccion: 'VT-FAIL-999',
    junta: juntaCorrupta,
    inspectorNombre: 'Inspector Prueba',
    defectoDetectado: 'Fisura',
    profundidadDefectoMM: 4.5,
    longitudDefectoMM: 800, // Defecto 800 mm > Junta 500 mm -> Inconsistente
    resultado: 'Rechazado',
    normaAplicada: 'AWS_D1_1',
    requiereNDTSuplementario: true
};

const informeLimiteCorrupto: InformeInspeccionSoldadura = {
    id: 'INF-FAIL-02',
    codigoInforme: 'VT-FAIL-02',
    nombreProyecto: 'Proyecto Con Defectos Críticos de Soldadura',
    cliente: 'Cliente Control de Calidad',
    inspecciones: [
        i1,
        inspeccionCorrupta,
        i1 // ID e Inspección duplicada
    ]
};

// Ejecución Caso 1
const servicioNormal = new ServicioGestionInspeccionSoldadura(informeNormal);
const resumenNormal = servicioNormal.procesarInforme();
mostrarResumenInspeccion(resumenNormal, 'Caso Normal - Puente Grúa Estructural');

// Ejecución Caso 2
const servicioLimite = new ServicioGestionInspeccionSoldadura(informeLimiteCorrupto);
const resumenLimite = servicioLimite.procesarInforme();
mostrarResumenInspeccion(resumenLimite, 'Caso Límite - Fisura Crítica e Inconsistencias de Junta');