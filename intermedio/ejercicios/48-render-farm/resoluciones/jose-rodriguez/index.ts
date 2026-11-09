
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Clases)

export type MotorRender =
    | 'Arnold'
    | 'VRay'
    | 'Octane'
    | 'Redshift'
    | 'BlenderCycles'
    | 'UnrealEngine';

export type ResolucionRender = '720p' | '1080p' | '1440p' | '4K' | '8K';
export type PrioridadTrabajo = 'Baja' | 'Media' | 'Alta' | 'Urgente';
export type EstadoTrabajo =
    | 'EnCola'
    | 'Procesando'
    | 'Completado'
    | 'Fallido'
    | 'Cancelado';

export interface NodoRender {
    readonly id: string;
    readonly nombreNodo: string;
    readonly vramGB: number;
    readonly cpuCores: number;
    readonly tarifaHoraUSD: number;
    readonly estaDisponible: boolean;
}

export interface TrabajoRender {
    readonly id: string;
    readonly codigoTrabajo: string;
    readonly nombreProyecto: string;
    readonly motor: MotorRender;
    readonly resolucion: ResolucionRender;
    readonly framesTotales: number;
    readonly framesRenderizados: number;
    readonly tiempoPromedioFrameSegundos: number;
    readonly prioridad: PrioridadTrabajo;
    readonly estado: EstadoTrabajo;
    readonly costoEstimadoUSD: number;
    readonly nodoAsignadoId?: string;
}

export interface RenderFarmCluster {
    readonly id: string;
    readonly nombreFarm: string;
    readonly capacidadNodos: number;
    readonly trabajos: readonly TrabajoRender[];
}

export interface MetricasRenderFarm {
    readonly totalTrabajos: number;
    readonly trabajosCompletadosCount: number;
    readonly porcentajeExito: number;
    readonly tiempoTotalRenderHoras: number;
    readonly costoTotalRenderUSD: number;
    readonly promedioCostoPorTrabajoUSD: number;
    readonly trabajoMasCostoso: TrabajoRender | null;
    readonly desglosePorMotor: Readonly<Record<MotorRender, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoTrabajo, number>>;
}

export interface ResumenRenderFarm {
    readonly farmId: string;
    readonly nombreFarm: string;
    readonly totalTrabajosValidos: number;
    readonly metricas: MetricasRenderFarm;
    readonly trabajosProcesados: readonly TrabajoRender[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y CLASE DE GESTIÓN (Generics & Encapsulamiento)

export class ContenedorTrabajos<T extends { readonly id: string }> {
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

export function validarNodoRender(nodo: NodoRender): ResultadoValidacion<NodoRender> {
    const errores: string[] = [];

    if (nodo.vramGB <= 0 || nodo.vramGB > 256) {
        errores.push(`VRAM inválida (${nodo.vramGB} GB) en nodo "${nodo.nombreNodo}".`);
    }

    if (nodo.cpuCores <= 0 || nodo.cpuCores > 256) {
        errores.push(`Número de núcleos CPU inválido (${nodo.cpuCores}) en nodo "${nodo.nombreNodo}".`);
    }

    if (nodo.tarifaHoraUSD <= 0) {
        errores.push(`Tarifa por hora inválida ($${nodo.tarifaHoraUSD} USD) en nodo "${nodo.nombreNodo}".`);
    }

    return errores.length === 0
        ? { esValido: true, datos: nodo }
        : { esValido: false, errores };
}

export function validarTrabajoRender(trabajo: TrabajoRender): ResultadoValidacion<TrabajoRender> {
    const errores: string[] = [];

    if (trabajo.framesTotales <= 0 || trabajo.framesTotales > 50000) {
        errores.push(`Cantidad de frames totales inválida (${trabajo.framesTotales}) en "${trabajo.nombreProyecto}".`);
    }

    if (trabajo.framesRenderizados < 0 || trabajo.framesRenderizados > trabajo.framesTotales) {
        errores.push(
            `Inconsistencia en "${trabajo.nombreProyecto}": Frames renderizados (${trabajo.framesRenderizados}) fuera del rango (0 - ${trabajo.framesTotales}).`
        );
    }

    if (trabajo.tiempoPromedioFrameSegundos <= 0) {
        errores.push(`Tiempo promedio por frame inválido (${trabajo.tiempoPromedioFrameSegundos}s) en "${trabajo.nombreProyecto}".`);
    }

    if (trabajo.costoEstimadoUSD < 0) {
        errores.push(`Costo estimado negativo ($${trabajo.costoEstimadoUSD} USD) en "${trabajo.nombreProyecto}".`);
    }

    if (trabajo.estado === 'Completado' && trabajo.framesRenderizados < trabajo.framesTotales) {
        errores.push(
            `Inconsistencia en "${trabajo.nombreProyecto}": Estado Completado pero frames renderizados (${trabajo.framesRenderizados}) es menor al total (${trabajo.framesTotales}).`
        );
    }

    return errores.length === 0
        ? { esValido: true, datos: trabajo }
        : { esValido: false, errores };
}

export function validarClusterRaw(cluster: RenderFarmCluster): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();
    const codigosVistos = new Set<string>();

    if (cluster.capacidadNodos <= 0) {
        advertencias.push(`Capacidad de nodos inválida (${cluster.capacidadNodos}) en el cluster "${cluster.nombreFarm}".`);
    }

    if (cluster.trabajos.length === 0) {
        advertencias.push(`El cluster "${cluster.nombreFarm}" no registra trabajos en cola.`);
    }

    for (const t of cluster.trabajos) {
        if (idsVistos.has(t.id)) {
            advertencias.push(`Trabajo duplicado detectado por ID: ${t.id} (${t.nombreProyecto}).`);
        }
        if (codigosVistos.has(t.codigoTrabajo)) {
            advertencias.push(`Código de trabajo duplicado: ${t.codigoTrabajo}.`);
        }
        idsVistos.add(t.id);
        codigosVistos.add(t.codigoTrabajo);
    }

    return advertencias;
}

// 4. TRANSFORMACIÓN Y CÁLCULOS MÉTRICOS (reduce & Record)

const MOTORES_RENDER: readonly MotorRender[] = [
    'Arnold',
    'VRay',
    'Octane',
    'Redshift',
    'BlenderCycles',
    'UnrealEngine'
];

const ESTADOS_TRABAJO: readonly EstadoTrabajo[] = [
    'EnCola',
    'Procesando',
    'Completado',
    'Fallido',
    'Cancelado'
];

export function calcularMetricasRenderFarm(trabajos: readonly TrabajoRender[]): MetricasRenderFarm {
    if (trabajos.length === 0) {
        const desgloseMotorVacio = MOTORES_RENDER.reduce((acc, m) => {
            acc[m] = 0;
            return acc;
        }, {} as Record<MotorRender, number>);

        const desgloseEstadoVacio = ESTADOS_TRABAJO.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstadoTrabajo, number>);

        return {
            totalTrabajos: 0,
            trabajosCompletadosCount: 0,
            porcentajeExito: 0,
            tiempoTotalRenderHoras: 0,
            costoTotalRenderUSD: 0,
            promedioCostoPorTrabajoUSD: 0,
            trabajoMasCostoso: null,
            desglosePorMotor: desgloseMotorVacio,
            desglosePorEstado: desgloseEstadoVacio
        };
    }

    const completados = trabajos.filter((t) => t.estado === 'Completado');
    const trabajosCompletadosCount = completados.length;
    const porcentajeExito = Number(((trabajosCompletadosCount / trabajos.length) * 100).toFixed(1));

    const tiempoTotalSegundos = trabajos.reduce(
        (acc, t) => acc + t.framesRenderizados * t.tiempoPromedioFrameSegundos,
        0
    );
    const tiempoTotalRenderHoras = Number((tiempoTotalSegundos / 3600).toFixed(2));

    const costoTotalRenderUSD = Number(
        trabajos.reduce((acc, t) => acc + t.costoEstimadoUSD, 0).toFixed(2)
    );

    const promedioCostoPorTrabajoUSD = Number((costoTotalRenderUSD / trabajos.length).toFixed(2));

    const trabajoMasCostoso = [...trabajos].sort((a, b) => b.costoEstimadoUSD - a.costoEstimadoUSD)[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorMotor = trabajos.reduce((acc, t) => {
        acc[t.motor] = (acc[t.motor] ?? 0) + 1;
        return acc;
    }, MOTORES_RENDER.reduce((acc, m) => ({ ...acc, [m]: 0 }), {} as Record<MotorRender, number>));

    const desglosePorEstado = trabajos.reduce((acc, t) => {
        acc[t.estado] = (acc[t.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_TRABAJO.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoTrabajo, number>));

    return {
        totalTrabajos: trabajos.length,
        trabajosCompletadosCount,
        porcentajeExito,
        tiempoTotalRenderHoras,
        costoTotalRenderUSD,
        promedioCostoPorTrabajoUSD,
        trabajoMasCostoso,
        desglosePorMotor,
        desglosePorEstado
    };
}

export class ServicioGestionRenderFarm {
    private readonly contenedor = new ContenedorTrabajos<TrabajoRender>();
    private readonly advertencias: string[] = [];

    constructor(private readonly clusterRaw: RenderFarmCluster) { }

    public procesarFarm(): ResumenRenderFarm {
        this.advertencias.push(...validarClusterRaw(this.clusterRaw));

        for (const rawTrabajo of this.clusterRaw.trabajos) {
            const resVal = validarTrabajoRender(rawTrabajo);

            if (!resVal.esValido) {
                this.advertencias.push(...resVal.errores);
            } else {
                const agregado = this.contenedor.agregar(resVal.datos);
                if (!agregado) {
                    this.advertencias.push(`No se pudo agregar el trabajo duplicado por ID: ${rawTrabajo.id}`);
                }
            }
        }

        const trabajosValidos = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasRenderFarm(trabajosValidos);

        const trabajosFallidos = trabajosValidos.filter((t) => t.estado === 'Fallido');
        if (trabajosFallidos.length > 0) {
            this.advertencias.push(
                `Alerta de render farm: Se registraron ${trabajosFallidos.length} trabajo(s) en estado Fallido.`
            );
        }

        return {
            farmId: this.clusterRaw.id,
            nombreFarm: this.clusterRaw.nombreFarm,
            totalTrabajosValidos: trabajosValidos.length,
            metricas,
            trabajosProcesados: trabajosValidos,
            advertencias: this.advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenRenderFarm(resumen: ResumenRenderFarm, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` RENDER FARM 3D - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Render Farm Cluster : ${resumen.nombreFarm}`);
    console.log(`Trabajos Validados  : ${resumen.totalTrabajosValidos}`);
    console.log(`Costo Total Render  : $${resumen.metricas.costoTotalRenderUSD.toLocaleString()} USD`);
    console.log(`Tiempo Total Render : ${resumen.metricas.tiempoTotalRenderHoras} hrs acumuladas`);
    console.log(`Efectividad Exito   : ${resumen.metricas.trabajosCompletadosCount} de ${resumen.metricas.totalTrabajos} (${resumen.metricas.porcentajeExito}%)`);
    console.log(`Trabajo Más Costoso : ${resumen.metricas.trabajoMasCostoso ? `"${resumen.metricas.trabajoMasCostoso.nombreProyecto}" ($${resumen.metricas.trabajoMasCostoso.costoEstimadoUSD} USD - ${resumen.metricas.trabajoMasCostoso.motor})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE RENDER FARM (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE TRABAJOS POR MOTOR DE RENDER:`);
    Object.entries(resumen.metricas.desglosePorMotor).forEach(([motor, cantidad]) => {
        console.log(`   - ${motor.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.trabajosProcesados.map((t) => ({
            ID: t.id,
            Código: t.codigoTrabajo,
            Proyecto: t.nombreProyecto,
            Motor: t.motor,
            Res: t.resolucion,
            Frames: `${t.framesRenderizados}/${t.framesTotales}`,
            Prioridad: t.prioridad,
            'Costo USD': `$${t.costoEstimadoUSD}`,
            Estado: t.estado
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const t1: TrabajoRender = {
    id: 'job-01',
    codigoTrabajo: 'JOB-SHREK-101',
    nombreProyecto: 'Cortometraje Sci-Fi Awakening',
    motor: 'Redshift',
    resolucion: '4K',
    framesTotales: 1200,
    framesRenderizados: 1200,
    tiempoPromedioFrameSegundos: 45,
    prioridad: 'Alta',
    estado: 'Completado',
    costoEstimadoUSD: 450.0,
    nodoAsignadoId: 'node-gpu-01'
};

const t2: TrabajoRender = {
    id: 'job-02',
    codigoTrabajo: 'JOB-ARCHVIZ-102',
    nombreProyecto: 'Recorrido Arquitectónico Villa 2026',
    motor: 'VRay',
    resolucion: '1080p',
    framesTotales: 800,
    framesRenderizados: 800,
    tiempoPromedioFrameSegundos: 30,
    prioridad: 'Media',
    estado: 'Completado',
    costoEstimadoUSD: 220.0,
    nodoAsignadoId: 'node-cpu-02'
};

const t3: TrabajoRender = {
    id: 'job-03',
    codigoTrabajo: 'JOB-COMM-103',
    nombreProyecto: 'Comercial TV Bebida Energética',
    motor: 'Octane',
    resolucion: '4K',
    framesTotales: 600,
    framesRenderizados: 300,
    tiempoPromedioFrameSegundos: 60,
    prioridad: 'Urgente',
    estado: 'Procesando',
    costoEstimadoUSD: 380.0,
    nodoAsignadoId: 'node-gpu-03'
};

// --- CASO 1: Render Farm de Estudio de Animación 3D (Caso Normal) ---
const clusterNormal: RenderFarmCluster = {
    id: 'FARM-MADNESS-01',
    nombreFarm: 'Madness VFX Render Farm',
    capacidadNodos: 32,
    trabajos: [t1, t2, t3]
};

// --- CASO 2: Frames Incoherentes, Estado Inconsistente y Trabajo Duplicado (Caso Límite) ---
const trabajoCorrupto: TrabajoRender = {
    id: 'job-99',
    codigoTrabajo: 'JOB-ERR-999',
    nombreProyecto: 'Proyecto Corrupto Error',
    motor: 'Arnold',
    resolucion: '8K',
    framesTotales: 0, // Frames totales 0 -> Inválido
    framesRenderizados: 50, // Renderizados > Totales -> Incoherente
    tiempoPromedioFrameSegundos: -10, // Tiempo negativo -> Inválido
    prioridad: 'Baja',
    estado: 'Completado', // Estado Completado pero renderizados incoherentes
    costoEstimadoUSD: -100.0 // Costo negativo -> Inválido
};

const clusterLimiteCorrupto: RenderFarmCluster = {
    id: 'FARM-FAIL-02',
    nombreFarm: 'Cluster Con Inconsistencias',
    capacidadNodos: 0, // Capacidad 0 -> Inválido
    trabajos: [
        t1,
        trabajoCorrupto,
        t1 // ID duplicado
    ]
};

// Ejecución Caso 1
const servicioNormal = new ServicioGestionRenderFarm(clusterNormal);
const resumenNormal = servicioNormal.procesarFarm();
mostrarResumenRenderFarm(resumenNormal, 'Caso Normal - Madness VFX Render Farm');

// Ejecución Caso 2
const servicioLimite = new ServicioGestionRenderFarm(clusterLimiteCorrupto);
const resumenLimite = servicioLimite.procesarFarm();
mostrarResumenRenderFarm(resumenLimite, 'Caso Límite - Frames Incoherentes y Costos Negativos');