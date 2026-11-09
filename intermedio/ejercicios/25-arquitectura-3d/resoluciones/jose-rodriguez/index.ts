
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type TipoRender =
    | 'Exterior'
    | 'Interior'
    | 'Axonometrica'
    | 'Masterplan'
    | 'Planta3D'
    | 'Recorrido360';

export type ResolucionRender =
    | 'HD_1080p'
    | 'K4_2160p'
    | 'K8_4320p'
    | 'Impresion_A0';

export type EstadoRevision =
    | 'Pendiente'
    | 'Aprobado'
    | 'CambiosMenores'
    | 'CambiosMayores'
    | 'Rechazado';

export type MotorRender =
    | 'VRay'
    | 'Corona'
    | 'UnrealEngine'
    | 'Lumion'
    | 'Enscape'
    | 'BlenderCycles';

export interface Visualizador3D {
    readonly id: string;
    readonly nombre: string;
    readonly especialistaEn: TipoRender;
    readonly tarifaHoraUSD: number;
}

export interface ClienteArquitectura {
    readonly id: string;
    readonly estudioNombre: string;
    readonly proyectoArquitectonico: string;
}

export interface RenderArquitectura {
    readonly id: string;
    readonly codigoVista: string;
    readonly tipo: TipoRender;
    readonly resolucion: ResolucionRender;
    readonly motor: MotorRender;
    readonly anchoPixels: number;
    readonly altoPixels: number;
    readonly tiempoRenderHoras: number;
    readonly costoUSD: number;
    readonly visualizador: Visualizador3D;
    readonly cliente: ClienteArquitectura;
    readonly revisionesRealizadas: number;
    readonly estado: EstadoRevision;
}

export interface MetricasRevisionRenders {
    readonly totalRenders: number;
    readonly rendersAprobados: number;
    readonly porcentajeAprobacion: number;
    readonly horasTotalesRender: number;
    readonly costoTotalRendersUSD: number;
    readonly costoPromedioRenderUSD: number;
    readonly renderMasCostoso: RenderArquitectura | null;
    readonly desglosePorTipo: Readonly<Record<TipoRender, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoRevision, number>>;
    readonly desglosePorMotor: Readonly<Record<MotorRender, number>>;
}

export interface ResumenRevisionRenders {
    readonly totalRendersValidos: number;
    readonly metricas: MetricasRevisionRenders;
    readonly rendersProcesados: readonly RenderArquitectura[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarRenderArquitectura(render: RenderArquitectura): ResultadoValidacion<RenderArquitectura> {
    const errores: string[] = [];

    if (render.anchoPixels <= 0 || render.altoPixels <= 0) {
        errores.push(`Dimensiones de imagen invalidas en render "${render.codigoVista}" (${render.anchoPixels}x${render.altoPixels}px).`);
    }

    if (render.tiempoRenderHoras <= 0 || render.tiempoRenderHoras > 72) {
        errores.push(`Tiempo de renderizado fuera de rango (${render.tiempoRenderHoras}h) en la vista "${render.codigoVista}".`);
    }

    if (render.costoUSD <= 0) {
        errores.push(`El costo de renderizado debe ser mayor a 0 USD ($${render.costoUSD}) en "${render.codigoVista}".`);
    }

    if (render.revisionesRealizadas < 0 || render.revisionesRealizadas > 10) {
        errores.push(`Numero de revisiones fuera del limite operativo (${render.revisionesRealizadas}) en "${render.codigoVista}".`);
    }

    if (render.visualizador.tarifaHoraUSD <= 0) {
        errores.push(`La tarifa del visualizador 3D ${render.visualizador.nombre} es invalida ($${render.visualizador.tarifaHoraUSD}).`);
    }

    return errores.length === 0
        ? { esValido: true, datos: render }
        : { esValido: false, errores };
}

export function validarRevisionesRaw(renders: readonly RenderArquitectura[]): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();
    const codigosVistos = new Set<string>();

    if (renders.length === 0) {
        advertencias.push('La lista de revision de renders arquitectonicos esta vacia.');
    }

    for (const render of renders) {
        if (idsVistos.has(render.id)) {
            advertencias.push(`Render duplicado detectado por ID: ${render.id}.`);
        }
        if (codigosVistos.has(render.codigoVista)) {
            advertencias.push(`Codigo de vista duplicado: ${render.codigoVista}.`);
        }
        idsVistos.add(render.id);
        codigosVistos.add(render.codigoVista);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce y Record)

const TIPOS_RENDER: readonly TipoRender[] = [
    'Exterior',
    'Interior',
    'Axonometrica',
    'Masterplan',
    'Planta3D',
    'Recorrido360'
];

const ESTADOS_REVISION: readonly EstadoRevision[] = [
    'Pendiente',
    'Aprobado',
    'CambiosMenores',
    'CambiosMayores',
    'Rechazado'
];

const MOTORES_RENDER: readonly MotorRender[] = [
    'VRay',
    'Corona',
    'UnrealEngine',
    'Lumion',
    'Enscape',
    'BlenderCycles'
];

export function calcularMetricasRevision(renders: readonly RenderArquitectura[]): MetricasRevisionRenders {
    if (renders.length === 0) {
        const desgloseTipoVacio = TIPOS_RENDER.reduce((acc, t) => {
            acc[t] = 0;
            return acc;
        }, {} as Record<TipoRender, number>);

        const desgloseEstadoVacio = ESTADOS_REVISION.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstadoRevision, number>);

        const desgloseMotorVacio = MOTORES_RENDER.reduce((acc, m) => {
            acc[m] = 0;
            return acc;
        }, {} as Record<MotorRender, number>);

        return {
            totalRenders: 0,
            rendersAprobados: 0,
            porcentajeAprobacion: 0,
            horasTotalesRender: 0,
            costoTotalRendersUSD: 0,
            costoPromedioRenderUSD: 0,
            renderMasCostoso: null,
            desglosePorTipo: desgloseTipoVacio,
            desglosePorEstado: desgloseEstadoVacio,
            desglosePorMotor: desgloseMotorVacio
        };
    }

    const rendersAprobados = renders.filter((r) => r.estado === 'Aprobado').length;
    const porcentajeAprobacion = Number(((rendersAprobados / renders.length) * 100).toFixed(1));

    const horasTotalesRender = Number(
        renders.reduce((acc, r) => acc + r.tiempoRenderHoras, 0).toFixed(2)
    );

    const costoTotalRendersUSD = Number(
        renders.reduce((acc, r) => acc + r.costoUSD, 0).toFixed(2)
    );

    const costoPromedioRenderUSD = Number((costoTotalRendersUSD / renders.length).toFixed(2));

    const renderMasCostoso = [...renders].sort((a, b) => b.costoUSD - a.costoUSD)[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorTipo = renders.reduce((acc, r) => {
        acc[r.tipo] = (acc[r.tipo] ?? 0) + 1;
        return acc;
    }, TIPOS_RENDER.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TipoRender, number>));

    const desglosePorEstado = renders.reduce((acc, r) => {
        acc[r.estado] = (acc[r.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_REVISION.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoRevision, number>));

    const desglosePorMotor = renders.reduce((acc, r) => {
        acc[r.motor] = (acc[r.motor] ?? 0) + 1;
        return acc;
    }, MOTORES_RENDER.reduce((acc, m) => ({ ...acc, [m]: 0 }), {} as Record<MotorRender, number>));

    return {
        totalRenders: renders.length,
        rendersAprobados,
        porcentajeAprobacion,
        horasTotalesRender,
        costoTotalRendersUSD,
        costoPromedioRenderUSD,
        renderMasCostoso,
        desglosePorTipo,
        desglosePorEstado,
        desglosePorMotor
    };
}

export function procesarRevisionRenders(rendersRaw: readonly RenderArquitectura[]): ResumenRevisionRenders {
    const advertencias: string[] = [...validarRevisionesRaw(rendersRaw)];
    const rendersValidos: RenderArquitectura[] = [];

    for (const raw of rendersRaw) {
        const res = validarRenderArquitectura(raw);
        if (res.esValido) {
            rendersValidos.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const metricas = calcularMetricasRevision(rendersValidos);

    return {
        totalRendersValidos: rendersValidos.length,
        metricas,
        rendersProcesados: rendersValidos,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenRevision(resumen: ResumenRevisionRenders, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` REVISION DE RENDERS ARQUITECTURA - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Renders Validados   : ${resumen.totalRendersValidos}`);
    console.log(`Renders Aprobados   : ${resumen.metricas.rendersAprobados} de ${resumen.metricas.totalRenders} (${resumen.metricas.porcentajeAprobacion}%)`);
    console.log(`Horas Totales Render: ${resumen.metricas.horasTotalesRender} horas`);
    console.log(`Costo Total Renders : $${resumen.metricas.costoTotalRendersUSD.toLocaleString()} USD`);
    console.log(`Costo Promedio      : $${resumen.metricas.costoPromedioRenderUSD} USD`);
    console.log(`Render Mas Costoso  : ${resumen.metricas.renderMasCostoso ? `${resumen.metricas.renderMasCostoso.codigoVista} ($${resumen.metricas.renderMasCostoso.costoUSD} - ${resumen.metricas.renderMasCostoso.tipo})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE REVISION (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR TIPO DE VISTA:`);
    Object.entries(resumen.metricas.desglosePorTipo).forEach(([tipo, cantidad]) => {
        console.log(`   - ${tipo.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.rendersProcesados.map((r) => ({
            ID: r.id,
            Vista: r.codigoVista,
            Tipo: r.tipo,
            Resolucion: r.resolucion,
            Motor: r.motor,
            Dimensiones: `${r.anchoPixels}x${r.altoPixels}`,
            'Tiempo (h)': `${r.tiempoRenderHoras}h`,
            Costo: `$${r.costoUSD}`,
            Visualizador: r.visualizador.nombre,
            Revisiones: r.revisionesRealizadas,
            Estado: r.estado
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const visualizador1: Visualizador3D = { id: 'vis-01', nombre: 'Jose Rodriguez', especialistaEn: 'Exterior', tarifaHoraUSD: 60 };
const visualizador2: Visualizador3D = { id: 'vis-02', nombre: 'Ana Martinez', especialistaEn: 'Interior', tarifaHoraUSD: 55 };

const clienteArq: ClienteArquitectura = { id: 'cli-arq-01', estudioNombre: 'Foster & Partners Studio', proyectoArquitectonico: 'Torre Horizon 2026' };

// --- CASO 1: Revisión de Entrega Final de Renders (Caso Normal) ---
const rendersNormales: readonly RenderArquitectura[] = [
    {
        id: 'RND-001',
        codigoVista: 'EXT_FACULTAD_NORT',
        tipo: 'Exterior',
        resolucion: 'K4_2160p',
        motor: 'Corona',
        anchoPixels: 3840,
        altoPixels: 2160,
        tiempoRenderHoras: 4.5,
        costoUSD: 450,
        visualizador: visualizador1,
        cliente: clienteArq,
        revisionesRealizadas: 1,
        estado: 'Aprobado'
    },
    {
        id: 'RND-002',
        codigoVista: 'INT_LOBBY_PRINCIPAL',
        tipo: 'Interior',
        resolucion: 'K4_2160p',
        motor: 'VRay',
        anchoPixels: 3840,
        altoPixels: 2160,
        tiempoRenderHoras: 6.0,
        costoUSD: 550,
        visualizador: visualizador2,
        cliente: clienteArq,
        revisionesRealizadas: 2,
        estado: 'CambiosMenores'
    },
    {
        id: 'RND-003',
        codigoVista: 'AXO_ESTRUCTURAL_ISOM',
        tipo: 'Axonometrica',
        resolucion: 'HD_1080p',
        motor: 'BlenderCycles',
        anchoPixels: 1920,
        altoPixels: 1080,
        tiempoRenderHoras: 2.0,
        costoUSD: 250,
        visualizador: visualizador1,
        cliente: clienteArq,
        revisionesRealizadas: 0,
        estado: 'Aprobado'
    }
];

// --- CASO 2: Dimensiones Cero, Tiempos Excesivos y Vistas Duplicadas (Caso Límite) ---
const rendersLimiteCorruptos: readonly RenderArquitectura[] = [
    {
        id: 'RND-004',
        codigoVista: 'EXT_ERR_DIMENSION',
        tipo: 'Exterior',
        resolucion: 'HD_1080p',
        motor: 'Lumion',
        anchoPixels: 0, // Ancho 0 -> Invalido
        altoPixels: 1080,
        tiempoRenderHoras: 1.5,
        costoUSD: 200,
        visualizador: visualizador1,
        cliente: clienteArq,
        revisionesRealizadas: 0,
        estado: 'Pendiente'
    },
    {
        id: 'RND-005',
        codigoVista: 'INT_ERR_TIEMPO',
        tipo: 'Interior',
        resolucion: 'K8_4320p',
        motor: 'UnrealEngine',
        anchoPixels: 7680,
        altoPixels: 4320,
        tiempoRenderHoras: 100, // Tiempo > 72h -> Invalido
        costoUSD: -50, // Costo negativo -> Invalido
        visualizador: visualizador2,
        cliente: clienteArq,
        revisionesRealizadas: 12, // Revisiones > 10 -> Invalido
        estado: 'Rechazado'
    },
    {
        id: 'RND-001', // ID Duplicado con RND-001
        codigoVista: 'EXT_FACULTAD_NORT', // Codigo vista duplicado
        tipo: 'Exterior',
        resolucion: 'K4_2160p',
        motor: 'Corona',
        anchoPixels: 3840,
        altoPixels: 2160,
        tiempoRenderHoras: 4.5,
        costoUSD: 450,
        visualizador: visualizador1,
        cliente: clienteArq,
        revisionesRealizadas: 1,
        estado: 'Aprobado'
    }
];

// Ejecución
const resumenNormal = procesarRevisionRenders(rendersNormales);
mostrarResumenRevision(resumenNormal, 'Caso Normal - Entrega Torre Horizon 2026');

const resumenLimite = procesarRevisionRenders(rendersLimiteCorruptos);
mostrarResumenRevision(resumenLimite, 'Caso Limite - Dimensiones Cero y Registros Duplicados');