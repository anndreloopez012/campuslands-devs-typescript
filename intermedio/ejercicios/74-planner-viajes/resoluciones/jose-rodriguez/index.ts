// 1. CAPA DE DOMINIO Y DTOs (Data Transfer Objects)

export type CategoriaActividadViaje =
    | 'VueloTransporte'
    | 'Alojamiento'
    | 'TourCultural'
    | 'Gastronomia'
    | 'AventuraNaturaleza';

export type EstadoActividadDOM =
    | 'PendienteConfirmacion'
    | 'ConfirmadaDOM'
    | 'Completada'
    | 'Cancelada';

export type EstadoPlanViaje =
    | 'Borrador'
    | 'Confirmado'
    | 'PresupuestoExcedido';

export interface ActividadItinerarioDominio {
    readonly id: string;
    readonly codigoActividad: string;
    readonly titulo: string;
    readonly categoria: CategoriaActividadViaje;
    readonly diaViaje: number;
    readonly horaInicio: string;
    readonly duracionHoras: number;
    readonly costoEstimadoUSD: number;
    readonly estadoDOM: EstadoActividadDOM;
    readonly notas: string;
}

export interface ViajePlanificadoDominio {
    readonly id: string;
    readonly codigoViaje: string;
    readonly nombreViaje: string;
    readonly destinoCiudad: string;
    readonly destinoPais: string;
    readonly fechaInicioISO: string;
    readonly duracionDias: number;
    readonly numeroViajeros: number;
    readonly presupuestoMaximoUSD: number;
    readonly actividades: readonly ActividadItinerarioDominio[];
    readonly costoTotalActivoUSD: number;
    readonly saldoDisponibleUSD: number;
    readonly estadoPlan: EstadoPlanViaje;
}

// DTO de entrada para crear un nuevo plan de viaje
export interface CrearViajeDTO {
    readonly codigoViaje: string;
    readonly nombreViaje: string;
    readonly destinoCiudad: string;
    readonly destinoPais: string;
    readonly fechaInicioISO: string;
    readonly duracionDias: number;
    readonly numeroViajeros: number;
    readonly presupuestoMaximoUSD: number;
}

// DTO de entrada para agregar una actividad al itinerario
export interface AgregarActividadDTO {
    readonly viajeId: string;
    readonly codigoActividad: string;
    readonly titulo: string;
    readonly categoria: CategoriaActividadViaje;
    readonly diaViaje: number;
    readonly horaInicio: string;
    readonly duracionHoras: number;
    readonly costoPorPersonaUSD: number;
    readonly confirmadaInicial?: boolean;
    readonly notas?: string;
}

// DTO para interacción DOM de cambio de estado de actividad
export interface ActualizarEstadoActividadDOMDTO {
    readonly viajeId: string;
    readonly codigoActividad: string;
    readonly nuevoEstado: EstadoActividadDOM;
}

// Proyección tipada para renderizado en el DOM
export interface VistaPlannerViajesDOM {
    readonly contenedorSelector: string;
    readonly tituloCabeceraDOM: string;
    readonly resumenPresupuestoDOM: string;
    readonly barraProgresoPresupuestoPct: number;
    readonly totalActividadesActivasDOM: number;
    readonly alertaPresupuestoDOM: string;
}

export type ResultadoOperacion<T> =
    | { readonly ok: true; readonly valor: T }
    | { readonly ok: false; readonly errores: readonly string[] };

export interface ResumenCategoriaViaje {
    readonly cantidadActividades: number;
    readonly horasTotales: number;
    readonly inversionUSD: number;
}

export interface ReportePlannerViajesDOM {
    readonly reporteId: string;
    readonly nombreAgenciaPlanner: string;
    readonly totalViajesRegistrados: number;
    readonly viajesConfirmadosCount: number;
    readonly viajesConPresupuestoExcedidoCount: number;
    readonly totalActividadesActivas: number;
    readonly inversionTotalPlanificadaUSD: number;
    readonly promedioCostoPorViajeUSD: number;
    readonly viajeMayorInversion: ViajePlanificadoDominio | null;
    readonly desglosePorCategoria: Readonly<Record<CategoriaActividadViaje, ResumenCategoriaViaje>>;
    readonly vistasDOM: readonly VistaPlannerViajesDOM[];
    readonly viajesProcesados: readonly ViajePlanificadoDominio[];
    readonly advertencias: readonly string[];
}

// 2. REPOSITORIO GENÉRICO EN MEMORIA (Generics & Encapsulamiento)

export class RepositorioEnMemoria<T extends { readonly id: string }> {
    private readonly registros: Map<string, T> = new Map();

    public guardar(entidad: T): void {
        this.registros.set(entidad.id, entidad);
    }

    public obtenerPorId(id: string): T | undefined {
        return this.registros.get(id);
    }

    public buscarUno(predicado: (item: T) => boolean): T | undefined {
        for (const item of this.registros.values()) {
            if (predicado(item)) {
                return item;
            }
        }
        return undefined;
    }

    public obtenerTodos(): readonly T[] {
        return Array.from(this.registros.values());
    }

    public contar(): number {
        return this.registros.size;
    }
}

// 3. VALIDACIONES Y TRANSFORMACIONES DE DTO <-> DOMINIO

const CATEGORIAS_ACTIVIDAD: readonly CategoriaActividadViaje[] = [
    'VueloTransporte',
    'Alojamiento',
    'TourCultural',
    'Gastronomia',
    'AventuraNaturaleza'
];

const PATRON_HORA_24H = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function validarCrearViajeDTO(
    dto: CrearViajeDTO
): ResultadoOperacion<CrearViajeDTO> {
    const errores: string[] = [];

    if (dto.codigoViaje.trim().length < 4) {
        errores.push(`Código de viaje inválido ("${dto.codigoViaje}"): mínimo 4 caracteres.`);
    }

    if (dto.nombreViaje.trim().length < 3) {
        errores.push(`El nombre del viaje ("${dto.nombreViaje}") es obligatorio.`);
    }

    if (dto.destinoCiudad.trim().length < 2 || dto.destinoPais.trim().length < 2) {
        errores.push(`Destino incompleto en "${dto.codigoViaje}": ciudad y país son requeridos.`);
    }

    if (dto.duracionDias <= 0 || dto.duracionDias > 90) {
        errores.push(
            `Duración de viaje fuera de rango (${dto.duracionDias} días) en "${dto.codigoViaje}".`
        );
    }

    if (dto.numeroViajeros <= 0 || dto.numeroViajeros > 30) {
        errores.push(
            `Número de viajeros inválido (${dto.numeroViajeros}) en "${dto.codigoViaje}".`
        );
    }

    if (dto.presupuestoMaximoUSD <= 0 || dto.presupuestoMaximoUSD > 250000) {
        errores.push(
            `Presupuesto máximo fuera de rango ($${dto.presupuestoMaximoUSD}) en "${dto.codigoViaje}".`
        );
    }

    return errores.length === 0
        ? { ok: true, valor: dto }
        : { ok: false, errores };
}

export function validarAgregarActividadDTO(
    dto: AgregarActividadDTO,
    viaje: ViajePlanificadoDominio
): ResultadoOperacion<AgregarActividadDTO> {
    const errores: string[] = [];

    if (dto.codigoActividad.trim().length < 3) {
        errores.push(`Código de actividad inválido ("${dto.codigoActividad}").`);
    }

    if (dto.titulo.trim().length < 3) {
        errores.push(`Título de actividad inválido ("${dto.titulo}") en "${viaje.codigoViaje}".`);
    }

    if (dto.diaViaje < 1 || dto.diaViaje > viaje.duracionDias) {
        errores.push(
            `Día de actividad (${dto.diaViaje}) fuera de la duración del viaje (1-${viaje.duracionDias} días) en "${dto.titulo}".`
        );
    }

    if (!PATRON_HORA_24H.test(dto.horaInicio.trim())) {
        errores.push(
            `Formato de hora inválido ("${dto.horaInicio}") en "${dto.titulo}": use HH:MM (24h).`
        );
    }

    if (dto.duracionHoras <= 0 || dto.duracionHoras > 24) {
        errores.push(
            `Duración en horas fuera de rango (${dto.duracionHoras} h) en "${dto.titulo}".`
        );
    }

    if (dto.costoPorPersonaUSD < 0 || dto.costoPorPersonaUSD > 50000) {
        errores.push(
            `Costo por persona inválido ($${dto.costoPorPersonaUSD}) en "${dto.titulo}".`
        );
    }

    return errores.length === 0
        ? { ok: true, valor: dto }
        : { ok: false, errores };
}

export function mapearViajeDTOADominio(
    dto: CrearViajeDTO,
    secuencia: number
): ViajePlanificadoDominio {
    const codigoLimpio = dto.codigoViaje.trim().toUpperCase();
    const presupuesto = Number(dto.presupuestoMaximoUSD.toFixed(2));

    return {
        id: `trp-${codigoLimpio}-${secuencia}`,
        codigoViaje: codigoLimpio,
        nombreViaje: dto.nombreViaje.trim(),
        destinoCiudad: dto.destinoCiudad.trim(),
        destinoPais: dto.destinoPais.trim(),
        fechaInicioISO: dto.fechaInicioISO.trim(),
        duracionDias: dto.duracionDias,
        numeroViajeros: dto.numeroViajeros,
        presupuestoMaximoUSD: presupuesto,
        actividades: [],
        costoTotalActivoUSD: 0,
        saldoDisponibleUSD: presupuesto,
        estadoPlan: 'Borrador'
    };
}

export function mapearActividadDTOADominio(
    dto: AgregarActividadDTO,
    numeroViajeros: number,
    secuencia: number
): ActividadItinerarioDominio {
    const codigoLimpio = dto.codigoActividad.trim().toUpperCase();
    const costoTotal = Number((dto.costoPorPersonaUSD * numeroViajeros).toFixed(2));

    return {
        id: `act-${codigoLimpio}-${secuencia}`,
        codigoActividad: codigoLimpio,
        titulo: dto.titulo.trim(),
        categoria: dto.categoria,
        diaViaje: dto.diaViaje,
        horaInicio: dto.horaInicio.trim(),
        duracionHoras: dto.duracionHoras,
        costoEstimadoUSD: costoTotal,
        estadoDOM: dto.confirmadaInicial ? 'ConfirmadaDOM' : 'PendienteConfirmacion',
        notas: dto.notas?.trim() ?? ''
    };
}

function recalcularEstadoFinancieroViaje(
    viaje: ViajePlanificadoDominio,
    actividadesActualizadas: readonly ActividadItinerarioDominio[]
): ViajePlanificadoDominio {
    // Ordenar inmutablemente por día y hora de inicio
    const actividadesOrdenadas = [...actividadesActualizadas].sort((a, b) => {
        if (a.diaViaje !== b.diaViaje) {
            return a.diaViaje - b.diaViaje;
        }
        return a.horaInicio.localeCompare(b.horaInicio);
    });

    const activas = actividadesOrdenadas.filter((a) => a.estadoDOM !== 'Cancelada');
    const costoTotalActivoUSD = Number(
        activas.reduce((acc, a) => acc + a.costoEstimadoUSD, 0).toFixed(2)
    );
    const saldoDisponibleUSD = Number(
        (viaje.presupuestoMaximoUSD - costoTotalActivoUSD).toFixed(2)
    );

    let estadoPlan: EstadoPlanViaje = 'Borrador';
    if (saldoDisponibleUSD < 0) {
        estadoPlan = 'PresupuestoExcedido';
    } else if (
        activas.length > 0 &&
        activas.every((a) => a.estadoDOM === 'ConfirmadaDOM' || a.estadoDOM === 'Completada')
    ) {
        estadoPlan = 'Confirmado';
    }

    return {
        ...viaje,
        actividades: actividadesOrdenadas,
        costoTotalActivoUSD,
        saldoDisponibleUSD,
        estadoPlan
    };
}

export function proyectarVistaPlannerDOM(
    viaje: ViajePlanificadoDominio
): VistaPlannerViajesDOM {
    const activasCount = viaje.actividades.filter(
        (a) => a.estadoDOM !== 'Cancelada'
    ).length;
    const porcentajeUso =
        viaje.presupuestoMaximoUSD > 0
            ? Number(
                ((viaje.costoTotalActivoUSD / viaje.presupuestoMaximoUSD) * 100).toFixed(1)
            )
            : 0;

    const alertaPresupuestoDOM =
        viaje.estadoPlan === 'PresupuestoExcedido'
            ? `ALERTA: Presupuesto excedido por $${Math.abs(viaje.saldoDisponibleUSD).toFixed(2)} USD`
            : viaje.estadoPlan === 'Confirmado'
                ? `Itinerario 100% confirmado (Saldo: $${viaje.saldoDisponibleUSD.toFixed(2)} USD)`
                : `Planificación en curso (${porcentajeUso}% del presupuesto asignado)`;

    return {
        contenedorSelector: `#planner-viaje-${viaje.codigoViaje.toLowerCase()}`,
        tituloCabeceraDOM: `${viaje.nombreViaje} -> ${viaje.destinoCiudad}, ${viaje.destinoPais} (${viaje.duracionDias}d / ${viaje.numeroViajeros} pax)`,
        resumenPresupuestoDOM: `$${viaje.costoTotalActivoUSD.toFixed(2)} / $${viaje.presupuestoMaximoUSD.toFixed(2)} USD`,
        barraProgresoPresupuestoPct: porcentajeUso,
        totalActividadesActivasDOM: activasCount,
        alertaPresupuestoDOM
    };
}

// 4. GENERACIÓN DE REPORTES Y SERVICIO DE PLANNER DE VIAJES DOM

export function generarReportePlannerViajes(
    nombreAgenciaPlanner: string,
    viajes: readonly ViajePlanificadoDominio[],
    advertencias: readonly string[]
): ReportePlannerViajesDOM {
    const viajesConfirmadosCount = viajes.filter(
        (v) => v.estadoPlan === 'Confirmado'
    ).length;
    const viajesConPresupuestoExcedidoCount = viajes.filter(
        (v) => v.estadoPlan === 'PresupuestoExcedido'
    ).length;

    const todasActividadesActivas = viajes.flatMap((v) =>
        v.actividades.filter((a) => a.estadoDOM !== 'Cancelada')
    );

    const inversionTotalPlanificadaUSD = Number(
        viajes.reduce((acc, v) => acc + v.costoTotalActivoUSD, 0).toFixed(2)
    );

    const promedioCostoPorViajeUSD =
        viajes.length > 0
            ? Number((inversionTotalPlanificadaUSD / viajes.length).toFixed(2))
            : 0;

    const viajeMayorInversion =
        [...viajes].sort((a, b) => b.costoTotalActivoUSD - a.costoTotalActivoUSD)[0] ??
        null;

    const desglosePorCategoria = CATEGORIAS_ACTIVIDAD.reduce((acc, cat) => {
        const delGrupo = todasActividadesActivas.filter((a) => a.categoria === cat);
        const horasTotales = Number(
            delGrupo.reduce((s, a) => s + a.duracionHoras, 0).toFixed(1)
        );
        const inversionUSD = Number(
            delGrupo.reduce((s, a) => s + a.costoEstimadoUSD, 0).toFixed(2)
        );

        acc[cat] = {
            cantidadActividades: delGrupo.length,
            horasTotales,
            inversionUSD
        };
        return acc;
    }, {} as Record<CategoriaActividadViaje, ResumenCategoriaViaje>);

    const vistasDOM = viajes.map((v) => proyectarVistaPlannerDOM(v));

    return {
        reporteId: `REP-VIAJES-${Date.now()}`,
        nombreAgenciaPlanner,
        totalViajesRegistrados: viajes.length,
        viajesConfirmadosCount,
        viajesConPresupuestoExcedidoCount,
        totalActividadesActivas: todasActividadesActivas.length,
        inversionTotalPlanificadaUSD,
        promedioCostoPorViajeUSD,
        viajeMayorInversion,
        desglosePorCategoria,
        vistasDOM,
        viajesProcesados: viajes,
        advertencias
    };
}

export class ServicioPlannerViajesDOM {
    private readonly repoViajes = new RepositorioEnMemoria<ViajePlanificadoDominio>();
    private readonly advertencias: string[] = [];
    private secuenciaViaje = 1;
    private secuenciaActividad = 1;

    constructor(private readonly nombreAgenciaPlanner: string) { }

    public crearPlanViaje(dto: CrearViajeDTO): ResultadoOperacion<ViajePlanificadoDominio> {
        const validacion = validarCrearViajeDTO(dto);
        if (!validacion.ok) {
            this.advertencias.push(...validacion.errores);
            return validacion;
        }

        const codigoNormalizado = dto.codigoViaje.trim().toUpperCase();
        const duplicado = this.repoViajes.buscarUno(
            (v) => v.codigoViaje === codigoNormalizado
        );
        if (duplicado) {
            const msg = `Código de viaje duplicado: "${codigoNormalizado}" ("${dto.nombreViaje}") ya existe.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const viaje = mapearViajeDTOADominio(dto, this.secuenciaViaje++);
        this.repoViajes.guardar(viaje);
        return { ok: true, valor: viaje };
    }

    public agregarActividadItinerario(
        dto: AgregarActividadDTO
    ): ResultadoOperacion<ViajePlanificadoDominio> {
        const viaje = this.repoViajes.obtenerPorId(dto.viajeId);
        if (!viaje) {
            const msg = `No se encontró el viaje con ID "${dto.viajeId}" para agregar "${dto.titulo}".`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const validacion = validarAgregarActividadDTO(dto, viaje);
        if (!validacion.ok) {
            this.advertencias.push(...validacion.errores);
            return validacion;
        }

        const codigoActNormalizado = dto.codigoActividad.trim().toUpperCase();
        const existeEnViaje = viaje.actividades.some(
            (a) => a.codigoActividad === codigoActNormalizado
        );
        if (existeEnViaje) {
            const msg = `Actividad duplicada "${codigoActNormalizado}" dentro del itinerario "${viaje.codigoViaje}".`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const nuevaActividad = mapearActividadDTOADominio(
            dto,
            viaje.numeroViajeros,
            this.secuenciaActividad++
        );

        const viajeRecalculado = recalcularEstadoFinancieroViaje(viaje, [
            ...viaje.actividades,
            nuevaActividad
        ]);

        if (
            viajeRecalculado.estadoPlan === 'PresupuestoExcedido' &&
            viaje.estadoPlan !== 'PresupuestoExcedido'
        ) {
            this.advertencias.push(
                `Alerta financiera en "${viaje.codigoViaje}": Se excedió el presupuesto máximo ($${viaje.presupuestoMaximoUSD.toFixed(2)} USD) al agregar "${nuevaActividad.titulo}".`
            );
        }

        this.repoViajes.guardar(viajeRecalculado);
        return { ok: true, valor: viajeRecalculado };
    }

    public actualizarEstadoActividadDOM(
        dto: ActualizarEstadoActividadDOMDTO
    ): ResultadoOperacion<ViajePlanificadoDominio> {
        const viaje = this.repoViajes.obtenerPorId(dto.viajeId);
        if (!viaje) {
            const msg = `Viaje inexistente "${dto.viajeId}" al actualizar actividad en DOM.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const codigoActNormalizado = dto.codigoActividad.trim().toUpperCase();
        const existe = viaje.actividades.some(
            (a) => a.codigoActividad === codigoActNormalizado
        );
        if (!existe) {
            const msg = `Actividad "${codigoActNormalizado}" no encontrada en "${viaje.codigoViaje}".`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const actividadesActualizadas = viaje.actividades.map((a) =>
            a.codigoActividad === codigoActNormalizado
                ? { ...a, estadoDOM: dto.nuevoEstado }
                : a
        );

        const viajeRecalculado = recalcularEstadoFinancieroViaje(
            viaje,
            actividadesActualizadas
        );
        this.repoViajes.guardar(viajeRecalculado);
        return { ok: true, valor: viajeRecalculado };
    }

    public obtenerReporteFinal(): ReportePlannerViajesDOM {
        return generarReportePlannerViajes(
            this.nombreAgenciaPlanner,
            this.repoViajes.obtenerTodos(),
            this.advertencias
        );
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarReportePlannerViajes(
    reporte: ReportePlannerViajesDOM,
    tituloCaso: string
): void {
    console.log(`\n======================================================================`);
    console.log(` PLANNER DE VIAJES DOM - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Planner / Agencia   : ${reporte.nombreAgenciaPlanner}`);
    console.log(`Reporte ID          : ${reporte.reporteId}`);
    console.log(`Viajes Registrados  : ${reporte.totalViajesRegistrados} (Confirmados: ${reporte.viajesConfirmadosCount} | Excedidos: ${reporte.viajesConPresupuestoExcedidoCount})`);
    console.log(`Actividades Activas : ${reporte.totalActividadesActivas}`);
    console.log(`Inversión Total     : $${reporte.inversionTotalPlanificadaUSD.toFixed(2)} USD (Prom: $${reporte.promedioCostoPorViajeUSD.toFixed(2)} USD/viaje)`);
    console.log(`Mayor Inversión     : ${reporte.viajeMayorInversion ? `"${reporte.viajeMayorInversion.nombreViaje}" ($${reporte.viajeMayorInversion.costoTotalActivoUSD.toFixed(2)} USD)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (reporte.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y VALIDACIONES DEL ITINERARIO (${reporte.advertencias.length}):`);
        reporte.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR CATEGORÍA DE ACTIVIDAD:`);
    Object.entries(reporte.desglosePorCategoria).forEach(([cat, info]) => {
        console.log(
            `   - ${cat.padEnd(20)}: ${info.cantidadActividades} act. | ${String(info.horasTotales).padStart(4)} h | Inversión: $${info.inversionUSD.toFixed(2)}`
        );
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        reporte.viajesProcesados.map((v, idx) => ({
            Código: v.codigoViaje,
            Destino: `${v.destinoCiudad}, ${v.destinoPais}`,
            'Días/Pax': `${v.duracionDias}d / ${v.numeroViajeros}p`,
            'Presupuesto DOM': reporte.vistasDOM[idx]?.resumenPresupuestoDOM ?? '',
            'Uso %': `${reporte.vistasDOM[idx]?.barraProgresoPresupuestoPct ?? 0}%`,
            Actividades: v.actividades.filter((a) => a.estadoDOM !== 'Cancelada').length,
            EstadoPlan: v.estadoPlan
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

async function ejecutarPruebas(): Promise<void> {
    // Simulación de carga inicial de rutas y tarifas
    await new Promise((resolve) => setTimeout(resolve, 10));

    // --- CASO 1: Planificación Internacional con Interacciones DOM (Caso Normal) ---
    const plannerNormal = new ServicioPlannerViajesDOM('NomadTech Travel Planner');

    const v1 = plannerNormal.crearPlanViaje({
        codigoViaje: 'TOK-2026-01',
        nombreViaje: 'Expedición Tecnológica Tokio & Kioto',
        destinoCiudad: 'Tokio',
        destinoPais: 'Japón',
        fechaInicioISO: '2026-11-20',
        duracionDias: 7,
        numeroViajeros: 2,
        presupuestoMaximoUSD: 5200
    });

    if (v1.ok) {
        plannerNormal.agregarActividadItinerario({
            viajeId: v1.valor.id,
            codigoActividad: 'FLT-NRT-01',
            titulo: 'Vuelo Redondo Internacional a Narita',
            categoria: 'VueloTransporte',
            diaViaje: 1,
            horaInicio: '08:30',
            duracionHoras: 14,
            costoPorPersonaUSD: 1150,
            confirmadaInicial: true
        });

        plannerNormal.agregarActividadItinerario({
            viajeId: v1.valor.id,
            codigoActividad: 'HTL-SHJ-02',
            titulo: 'Hotel Boutique Shinjuku (6 noches)',
            categoria: 'Alojamiento',
            diaViaje: 1,
            horaInicio: '15:00',
            duracionHoras: 6,
            costoPorPersonaUSD: 680,
            confirmadaInicial: true
        });

        plannerNormal.agregarActividadItinerario({
            viajeId: v1.valor.id,
            codigoActividad: 'TUR-AKB-03',
            titulo: 'Ruta Gastronómica Tsukiji y Akihabara',
            categoria: 'Gastronomia',
            diaViaje: 3,
            horaInicio: '11:00',
            duracionHoras: 4.5,
            costoPorPersonaUSD: 120,
            confirmadaInicial: false
        });

        // Confirmación vía evento DOM del usuario
        plannerNormal.actualizarEstadoActividadDOM({
            viajeId: v1.valor.id,
            codigoActividad: 'TUR-AKB-03',
            nuevoEstado: 'ConfirmadaDOM'
        });
    }

    const v2 = plannerNormal.crearPlanViaje({
        codigoViaje: 'ANT-2026-02',
        nombreViaje: 'Escapada Volcanes y Lago Atitlán',
        destinoCiudad: 'Antigua Guatemala',
        destinoPais: 'Guatemala',
        fechaInicioISO: '2026-12-05',
        duracionDias: 3,
        numeroViajeros: 4,
        presupuestoMaximoUSD: 1400
    });

    if (v2.ok) {
        plannerNormal.agregarActividadItinerario({
            viajeId: v2.valor.id,
            codigoActividad: 'AVN-ACA-01',
            titulo: 'Ascenso Guiado Volcán Acatenango',
            categoria: 'AventuraNaturaleza',
            diaViaje: 1,
            horaInicio: '07:00',
            duracionHoras: 10,
            costoPorPersonaUSD: 95,
            confirmadaInicial: true
        });

        plannerNormal.agregarActividadItinerario({
            viajeId: v2.valor.id,
            codigoActividad: 'TUR-ANT-02',
            titulo: 'Recorrido Arquitectónico y Café de Altura',
            categoria: 'TourCultural',
            diaViaje: 2,
            horaInicio: '10:00',
            duracionHoras: 3.5,
            costoPorPersonaUSD: 45,
            confirmadaInicial: true
        });
    }

    const reporteNormal = plannerNormal.obtenerReporteFinal();
    mostrarReportePlannerViajes(reporteNormal, 'Caso Normal - Itinerarios Confirmados y Control Presupuestario');

    // --- CASO 2: Presupuesto Excedido, Días Fuera de Rango, Duplicados y DTO Corrupto (Caso Límite) ---
    const plannerLimite = new ServicioPlannerViajesDOM('NomadTech Auditoría');

    const vLimite = plannerLimite.crearPlanViaje({
        codigoViaje: 'REK-2026-99',
        nombreViaje: 'Ruta Auroras Boreales Reikiavik',
        destinoCiudad: 'Reikiavik',
        destinoPais: 'Islandia',
        fechaInicioISO: '2026-12-15',
        duracionDias: 4,
        numeroViajeros: 2,
        presupuestoMaximoUSD: 1800
    });

    // Intento de registrar viaje duplicado
    plannerLimite.crearPlanViaje({
        codigoViaje: 'REK-2026-99',
        nombreViaje: 'Viaje Duplicado',
        destinoCiudad: 'Reikiavik',
        destinoPais: 'Islandia',
        fechaInicioISO: '2026-12-15',
        duracionDias: 4,
        numeroViajeros: 2,
        presupuestoMaximoUSD: 1800
    });

    // Intento de registrar DTO de viaje corrupto
    plannerLimite.crearPlanViaje({
        codigoViaje: 'X',
        nombreViaje: '',
        destinoCiudad: 'A',
        destinoPais: '',
        fechaInicioISO: '2026-12-20',
        duracionDias: -3,
        numeroViajeros: 0,
        presupuestoMaximoUSD: -500
    });

    if (vLimite.ok) {
        // Actividad válida que dispara PresupuestoExcedido ($1,100 * 2 = $2,200 > $1,800)
        plannerLimite.agregarActividadItinerario({
            viajeId: vLimite.valor.id,
            codigoActividad: 'AVN-GLA-01',
            titulo: 'Expedición en Helicóptero y Glaciar Vatnajökull',
            categoria: 'AventuraNaturaleza',
            diaViaje: 2,
            horaInicio: '09:30',
            duracionHoras: 5,
            costoPorPersonaUSD: 1100,
            confirmadaInicial: true
        });

        // Actividad con día fuera de duración del viaje (Día 9 > 4) y formato de hora inválido
        plannerLimite.agregarActividadItinerario({
            viajeId: vLimite.valor.id,
            codigoActividad: 'ERR-ACT-02',
            titulo: 'Tour Día Inexistente',
            categoria: 'TourCultural',
            diaViaje: 9,
            horaInicio: '25:99',
            duracionHoras: -2,
            costoPorPersonaUSD: -50
        });
    }

    const reporteLimite = plannerLimite.obtenerReporteFinal();
    mostrarReportePlannerViajes(reporteLimite, 'Caso Límite - Presupuesto Excedido, Días Inválidos y Duplicados');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));