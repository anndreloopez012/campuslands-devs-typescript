
// 1. CAPA DE DOMINIO Y DTOs (Data Transfer Objects)

export type TipoProyectoArquitectonico =
    | 'Residencial'
    | 'Comercial'
    | 'Corporativo'
    | 'Urbanismo'
    | 'Interiorismo';

export type CalidadRender3D =
    | 'BorradorConceptual'
    | 'Fotorrealista4K'
    | 'RecorridoVirtualVR'
    | 'AnimacionCinematografica';

export type NivelDetalleBIM =
    | 'LOD200_Basico'
    | 'LOD300_Ejecutivo'
    | 'LOD400_Fabricacion';

export type EstadoCotizacionArquitectura =
    | 'Borrador'
    | 'EnviadaCliente'
    | 'Aprobada'
    | 'RechazadaPorPresupuesto';

export interface ConfiguracionEstudio3D {
    readonly nombreEstudio: string;
    readonly tarifaHoraModeladorUSD: number;
    readonly tasaImpuestoPorcentaje: number;
    readonly horasProductivasPorDia: number;
}

export interface EntregableArquitectura3D {
    readonly codigoEntregable: string;
    readonly descripcion: string;
    readonly calidadRender: CalidadRender3D;
    readonly cantidadUnidades: number;
    readonly horasModeladoRender: number;
    readonly costoEntregableUSD: number;
}

export interface CotizacionArquitecturaDominio {
    readonly id: string;
    readonly codigoCotizacion: string;
    readonly nombreProyecto: string;
    readonly clienteNombre: string;
    readonly tipoProyecto: TipoProyectoArquitectonico;
    readonly areaConstruccionM2: number;
    readonly nivelDetalleBIM: NivelDetalleBIM;
    readonly entregables: readonly EntregableArquitectura3D[];
    readonly costoBaseModeladoM2USD: number;
    readonly costoEntregables3DUSD: number;
    readonly subtotalUSD: number;
    readonly descuentoVolumenUSD: number;
    readonly impuestosUSD: number;
    readonly totalCotizacionUSD: number;
    readonly diasHabilesEntrega: number;
    readonly estado: EstadoCotizacionArquitectura;
}

// DTO de entrada para cada pieza o visualización 3D solicitada
export interface ItemEntregable3DDTO {
    readonly codigoEntregable: string;
    readonly descripcion: string;
    readonly calidadRender: CalidadRender3D;
    readonly cantidadUnidades: number;
    readonly complejidadEscena: 'Baja' | 'Media' | 'Alta';
}

// DTO de entrada para generar una cotización arquitectónica 3D
export interface CrearCotizacionArquitecturaDTO {
    readonly codigoCotizacion: string;
    readonly nombreProyecto: string;
    readonly clienteNombre: string;
    readonly tipoProyecto: TipoProyectoArquitectonico;
    readonly areaConstruccionM2: number;
    readonly nivelDetalleBIM: NivelDetalleBIM;
    readonly entregables: readonly ItemEntregable3DDTO[];
    readonly clienteFrecuente?: boolean;
    readonly presupuestoTopeClienteUSD?: number;
}

// DTO para gestionar el flujo comercial de la cotización
export interface ActualizarEstadoCotizacionDTO {
    readonly codigoCotizacion: string;
    readonly nuevoEstado: EstadoCotizacionArquitectura;
}

export type ResultadoOperacion<T> =
    | { readonly ok: true; readonly valor: T }
    | { readonly ok: false; readonly errores: readonly string[] };

export interface ResumenTipoProyecto3D {
    readonly totalProyectos: number;
    readonly aprobadosCount: number;
    readonly areaTotalM2: number;
    readonly montoCotizadoUSD: number;
}

export interface ReporteCotizadorArquitectura3D {
    readonly reporteId: string;
    readonly configuracionEstudio: ConfiguracionEstudio3D;
    readonly totalCotizaciones: number;
    readonly cotizacionesAprobadasCount: number;
    readonly cotizacionesEnviadasCount: number;
    readonly cotizacionesRechazadasCount: number;
    readonly montoTotalCotizadoUSD: number;
    readonly montoAprobadoConfirmadoUSD: number;
    readonly ticketPromedioProyectoUSD: number;
    readonly areaTotalDisenadaM2: number;
    readonly cotizacionMayorValor: CotizacionArquitecturaDominio | null;
    readonly desglosePorTipoProyecto: Readonly<
        Record<TipoProyectoArquitectonico, ResumenTipoProyecto3D>
    >;
    readonly listaCotizaciones: readonly CotizacionArquitecturaDominio[];
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

// 3. VALIDACIONES, CÁLCULOS DE INGENIERÍA 3D Y TRANSFORMACIONES DTO <-> DOMINIO

const TIPOS_PROYECTO: readonly TipoProyectoArquitectonico[] = [
    'Residencial',
    'Comercial',
    'Corporativo',
    'Urbanismo',
    'Interiorismo'
];

const TARIFA_BASE_M2_POR_TIPO: Readonly<Record<TipoProyectoArquitectonico, number>> = {
    Residencial: 4.5,
    Comercial: 6.2,
    Corporativo: 7.5,
    Urbanismo: 3.1,
    Interiorismo: 8.0
};

const MULTIPLICADOR_BIM: Readonly<Record<NivelDetalleBIM, number>> = {
    LOD200_Basico: 1.0,
    LOD300_Ejecutivo: 1.35,
    LOD400_Fabricacion: 1.75
};

const HORAS_BASE_POR_CALIDAD: Readonly<Record<CalidadRender3D, number>> = {
    BorradorConceptual: 3,
    Fotorrealista4K: 8,
    RecorridoVirtualVR: 18,
    AnimacionCinematografica: 32
};

const FACTOR_COMPLEJIDAD_ESCENA: Readonly<Record<'Baja' | 'Media' | 'Alta', number>> = {
    Baja: 0.85,
    Media: 1.0,
    Alta: 1.4
};

export function calcularCostoBaseAreaM2(
    tipoProyecto: TipoProyectoArquitectonico,
    areaConstruccionM2: number,
    nivelDetalleBIM: NivelDetalleBIM
): number {
    const tarifaM2 = TARIFA_BASE_M2_POR_TIPO[tipoProyecto];
    const factorBIM = MULTIPLICADOR_BIM[nivelDetalleBIM];
    return Number((areaConstruccionM2 * tarifaM2 * factorBIM).toFixed(2));
}

export function calcularEntregable3D(
    item: ItemEntregable3DDTO,
    tarifaHoraModeladorUSD: number
): EntregableArquitectura3D {
    const horasUnitarias =
        HORAS_BASE_POR_CALIDAD[item.calidadRender] *
        FACTOR_COMPLEJIDAD_ESCENA[item.complejidadEscena];
    const horasModeladoRender = Number(
        (horasUnitarias * item.cantidadUnidades).toFixed(1)
    );
    const costoEntregableUSD = Number(
        (horasModeladoRender * tarifaHoraModeladorUSD).toFixed(2)
    );

    return {
        codigoEntregable: item.codigoEntregable.trim().toUpperCase(),
        descripcion: item.descripcion.trim(),
        calidadRender: item.calidadRender,
        cantidadUnidades: item.cantidadUnidades,
        horasModeladoRender,
        costoEntregableUSD
    };
}

export function validarCrearCotizacionDTO(
    dto: CrearCotizacionArquitecturaDTO
): ResultadoOperacion<CrearCotizacionArquitecturaDTO> {
    const errores: string[] = [];

    if (dto.codigoCotizacion.trim().length < 4) {
        errores.push(
            `Código de cotización inválido ("${dto.codigoCotizacion}"): mínimo 4 caracteres.`
        );
    }

    if (dto.nombreProyecto.trim().length < 3) {
        errores.push(
            `El nombre del proyecto ("${dto.nombreProyecto}") es obligatorio.`
        );
    }

    if (dto.clienteNombre.trim().length < 3) {
        errores.push(
            `El nombre del cliente ("${dto.clienteNombre}") es obligatorio.`
        );
    }

    if (dto.areaConstruccionM2 < 15 || dto.areaConstruccionM2 > 500_000) {
        errores.push(
            `Área de construcción fuera de rango (${dto.areaConstruccionM2} m²) en "${dto.codigoCotizacion}".`
        );
    }

    if (dto.entregables.length === 0) {
        errores.push(
            `La cotización "${dto.codigoCotizacion}" debe incluir al menos un entregable 3D.`
        );
    }

    for (const item of dto.entregables) {
        if (item.codigoEntregable.trim().length < 3) {
            errores.push(`Código de entregable inválido ("${item.codigoEntregable}").`);
        }
        if (!Number.isInteger(item.cantidadUnidades) || item.cantidadUnidades <= 0 || item.cantidadUnidades > 50) {
            errores.push(
                `Cantidad de unidades inválida (${item.cantidadUnidades}) en entregable "${item.descripcion}".`
            );
        }
    }

    if (
        dto.presupuestoTopeClienteUSD !== undefined &&
        dto.presupuestoTopeClienteUSD <= 0
    ) {
        errores.push(
            `Presupuesto tope del cliente inválido ($${dto.presupuestoTopeClienteUSD}) en "${dto.codigoCotizacion}".`
        );
    }

    return errores.length === 0
        ? { ok: true, valor: dto }
        : { ok: false, errores };
}

export function mapearCotizacionDTOADominio(
    dto: CrearCotizacionArquitecturaDTO,
    config: ConfiguracionEstudio3D,
    secuencia: number
): CotizacionArquitecturaDominio {
    const codigoLimpio = dto.codigoCotizacion.trim().toUpperCase();
    const costoBaseModeladoM2USD = calcularCostoBaseAreaM2(
        dto.tipoProyecto,
        dto.areaConstruccionM2,
        dto.nivelDetalleBIM
    );

    const entregablesDominio = dto.entregables.map((item) =>
        calcularEntregable3D(item, config.tarifaHoraModeladorUSD)
    );

    const costoEntregables3DUSD = Number(
        entregablesDominio
            .reduce((acc, ent) => acc + ent.costoEntregableUSD, 0)
            .toFixed(2)
    );

    const subtotalUSD = Number(
        (costoBaseModeladoM2USD + costoEntregables3DUSD).toFixed(2)
    );

    // Descuento del 8% si el proyecto supera 1,500 m² o es cliente frecuente
    const aplicaDescuento =
        dto.areaConstruccionM2 >= 1500 || dto.clienteFrecuente === true;
    const descuentoVolumenUSD = aplicaDescuento
        ? Number((subtotalUSD * 0.08).toFixed(2))
        : 0;

    const baseImponible = Number((subtotalUSD - descuentoVolumenUSD).toFixed(2));
    const impuestosUSD = Number(
        (baseImponible * (config.tasaImpuestoPorcentaje / 100)).toFixed(2)
    );
    const totalCotizacionUSD = Number((baseImponible + impuestosUSD).toFixed(2));

    // Estimación de plazo: horas de renders + horas de levantamiento arquitectónico (1h por cada 45 m²)
    const horasLevantamiento = dto.areaConstruccionM2 / 45;
    const horasRenders = entregablesDominio.reduce(
        (acc, ent) => acc + ent.horasModeladoRender,
        0
    );
    const diasHabilesEntrega = Math.max(
        2,
        Math.ceil((horasLevantamiento + horasRenders) / config.horasProductivasPorDia)
    );

    const excedeTopeCliente =
        dto.presupuestoTopeClienteUSD !== undefined &&
        totalCotizacionUSD > dto.presupuestoTopeClienteUSD;

    return {
        id: `cot-arq-${codigoLimpio}-${secuencia}`,
        codigoCotizacion: codigoLimpio,
        nombreProyecto: dto.nombreProyecto.trim(),
        clienteNombre: dto.clienteNombre.trim(),
        tipoProyecto: dto.tipoProyecto,
        areaConstruccionM2: dto.areaConstruccionM2,
        nivelDetalleBIM: dto.nivelDetalleBIM,
        entregables: entregablesDominio,
        costoBaseModeladoM2USD,
        costoEntregables3DUSD,
        subtotalUSD,
        descuentoVolumenUSD,
        impuestosUSD,
        totalCotizacionUSD,
        diasHabilesEntrega,
        estado: excedeTopeCliente ? 'RechazadaPorPresupuesto' : 'EnviadaCliente'
    };
}

// 4. GENERACIÓN DE REPORTES Y SERVICIO COTIZADOR ARQUITECTURA 3D

export function generarReporteCotizadorArquitectura(
    config: ConfiguracionEstudio3D,
    cotizaciones: readonly CotizacionArquitecturaDominio[],
    advertencias: readonly string[]
): ReporteCotizadorArquitectura3D {
    const aprobadas = cotizaciones.filter((c) => c.estado === 'Aprobada');
    const enviadas = cotizaciones.filter((c) => c.estado === 'EnviadaCliente');
    const rechazadas = cotizaciones.filter(
        (c) => c.estado === 'RechazadaPorPresupuesto'
    );

    const activas = cotizaciones.filter(
        (c) => c.estado !== 'RechazadaPorPresupuesto'
    );

    const montoTotalCotizadoUSD = Number(
        activas.reduce((acc, c) => acc + c.totalCotizacionUSD, 0).toFixed(2)
    );

    const montoAprobadoConfirmadoUSD = Number(
        aprobadas.reduce((acc, c) => acc + c.totalCotizacionUSD, 0).toFixed(2)
    );

    const ticketPromedioProyectoUSD =
        activas.length > 0
            ? Number((montoTotalCotizadoUSD / activas.length).toFixed(2))
            : 0;

    const areaTotalDisenadaM2 = Number(
        activas.reduce((acc, c) => acc + c.areaConstruccionM2, 0).toFixed(1)
    );

    const cotizacionMayorValor =
        [...activas].sort((a, b) => b.totalCotizacionUSD - a.totalCotizacionUSD)[0] ??
        null;

    const desglosePorTipoProyecto = TIPOS_PROYECTO.reduce((acc, tipo) => {
        const delGrupo = cotizaciones.filter((c) => c.tipoProyecto === tipo);
        const aprobadosCount = delGrupo.filter((c) => c.estado === 'Aprobada').length;
        const areaTotalM2 = Number(
            delGrupo.reduce((s, c) => s + c.areaConstruccionM2, 0).toFixed(1)
        );
        const montoCotizadoUSD = Number(
            delGrupo
                .filter((c) => c.estado !== 'RechazadaPorPresupuesto')
                .reduce((s, c) => s + c.totalCotizacionUSD, 0)
                .toFixed(2)
        );

        acc[tipo] = {
            totalProyectos: delGrupo.length,
            aprobadosCount,
            areaTotalM2,
            montoCotizadoUSD
        };
        return acc;
    }, {} as Record<TipoProyectoArquitectonico, ResumenTipoProyecto3D>);

    return {
        reporteId: `REP-ARQ3D-${Date.now()}`,
        configuracionEstudio: config,
        totalCotizaciones: cotizaciones.length,
        cotizacionesAprobadasCount: aprobadas.length,
        cotizacionesEnviadasCount: enviadas.length,
        cotizacionesRechazadasCount: rechazadas.length,
        montoTotalCotizadoUSD,
        montoAprobadoConfirmadoUSD,
        ticketPromedioProyectoUSD,
        areaTotalDisenadaM2,
        cotizacionMayorValor,
        desglosePorTipoProyecto,
        listaCotizaciones: cotizaciones,
        advertencias
    };
}

export class ServicioCotizadorArquitectura3D {
    private readonly repoCotizaciones =
        new RepositorioEnMemoria<CotizacionArquitecturaDominio>();
    private readonly advertencias: string[] = [];
    private secuenciaCotizacion = 1;

    constructor(private readonly configEstudio: ConfiguracionEstudio3D) { }

    public generarCotizacion(
        dto: CrearCotizacionArquitecturaDTO
    ): ResultadoOperacion<CotizacionArquitecturaDominio> {
        const validacion = validarCrearCotizacionDTO(dto);
        if (!validacion.ok) {
            this.advertencias.push(...validacion.errores);
            return validacion;
        }

        const codigoNormalizado = dto.codigoCotizacion.trim().toUpperCase();
        const duplicada = this.repoCotizaciones.buscarUno(
            (c) => c.codigoCotizacion === codigoNormalizado
        );
        if (duplicada) {
            const msg = `Código de cotización duplicado: "${codigoNormalizado}" ("${dto.nombreProyecto}") ya existe.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const cotizacion = mapearCotizacionDTOADominio(
            dto,
            this.configEstudio,
            this.secuenciaCotizacion++
        );

        if (cotizacion.estado === 'RechazadaPorPresupuesto') {
            this.advertencias.push(
                `Alerta presupuestaria en "${cotizacion.codigoCotizacion}": Total calculado ($${cotizacion.totalCotizacionUSD.toFixed(2)} USD) supera el tope del cliente ($${dto.presupuestoTopeClienteUSD?.toFixed(2)} USD).`
            );
        }

        this.repoCotizaciones.guardar(cotizacion);
        return { ok: true, valor: cotizacion };
    }

    public actualizarEstadoCotizacion(
        dto: ActualizarEstadoCotizacionDTO
    ): ResultadoOperacion<CotizacionArquitecturaDominio> {
        const codigoNormalizado = dto.codigoCotizacion.trim().toUpperCase();
        const cotizacion = this.repoCotizaciones.buscarUno(
            (c) => c.codigoCotizacion === codigoNormalizado
        );

        if (!cotizacion) {
            const msg = `No se encontró la cotización "${codigoNormalizado}" para actualizar estado.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        if (
            cotizacion.estado === 'RechazadaPorPresupuesto' &&
            dto.nuevoEstado === 'Aprobada'
        ) {
            const msg = `No se puede aprobar directamente "${codigoNormalizado}" porque excede el presupuesto tope del cliente.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const actualizada: CotizacionArquitecturaDominio = {
            ...cotizacion,
            estado: dto.nuevoEstado
        };
        this.repoCotizaciones.guardar(actualizada);
        return { ok: true, valor: actualizada };
    }

    public obtenerReporteFinal(): ReporteCotizadorArquitectura3D {
        return generarReporteCotizadorArquitectura(
            this.configEstudio,
            this.repoCotizaciones.obtenerTodos(),
            this.advertencias
        );
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarReporteCotizadorArquitectura(
    reporte: ReporteCotizadorArquitectura3D,
    tituloCaso: string
): void {
    const { configuracionEstudio: config } = reporte;
    console.log(`\n======================================================================`);
    console.log(` COTIZADOR DE ARQUITECTURA 3D - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Estudio 3D          : ${config.nombreEstudio} (Tarifa: $${config.tarifaHoraModeladorUSD}/h | IVA: ${config.tasaImpuestoPorcentaje}%)`);
    console.log(`Reporte ID          : ${reporte.reporteId}`);
    console.log(`Estado Propuestas   : ${reporte.totalCotizaciones} totales (Aprobadas: ${reporte.cotizacionesAprobadasCount} | Enviadas: ${reporte.cotizacionesEnviadasCount} | Rechazadas: ${reporte.cotizacionesRechazadasCount})`);
    console.log(`Finanzas Estudio    : Cotizado Activo: $${reporte.montoTotalCotizadoUSD.toFixed(2)} USD | Aprobado: $${reporte.montoAprobadoConfirmadoUSD.toFixed(2)} USD`);
    console.log(`Área Total / Ticket : ${reporte.areaTotalDisenadaM2.toLocaleString()} m² | Ticket Promedio: $${reporte.ticketPromedioProyectoUSD.toFixed(2)} USD`);
    console.log(`Proyecto Mayor Valor: ${reporte.cotizacionMayorValor ? `"${reporte.cotizacionMayorValor.nombreProyecto}" ($${reporte.cotizacionMayorValor.totalCotizacionUSD.toFixed(2)} USD)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (reporte.advertencias.length > 0) {
        console.log(`ALERTAS COMERCIALES Y DE VALIDACIÓN (${reporte.advertencias.length}):`);
        reporte.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR TIPOLOGÍA ARQUITECTÓNICA:`);
    Object.entries(reporte.desglosePorTipoProyecto).forEach(([tipo, info]) => {
        console.log(
            `   - ${tipo.padEnd(14)}: ${info.totalProyectos} proy. | Área: ${String(info.areaTotalM2).padStart(7)} m² | Cotizado: $${info.montoCotizadoUSD.toFixed(2)}`
        );
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        reporte.listaCotizaciones.map((c) => ({
            Código: c.codigoCotizacion,
            Proyecto: c.nombreProyecto,
            Tipología: c.tipoProyecto,
            'Área / BIM': `${c.areaConstruccionM2} m² (${c.nivelDetalleBIM.split('_')[0]})`,
            Entregables: c.entregables.length,
            'Subtotal USD': `$${c.subtotalUSD.toFixed(2)}`,
            'Total c/IVA': `$${c.totalCotizacionUSD.toFixed(2)}`,
            Plazo: `${c.diasHabilesEntrega} días`,
            Estado: c.estado
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

async function ejecutarPruebas(): Promise<void> {
    // Simulación de consulta inicial de tarifario BIM y renderizado
    await new Promise((resolve) => setTimeout(resolve, 10));

    const configEstudio: ConfiguracionEstudio3D = {
        nombreEstudio: 'Atelier ArchViz & BIM 3D',
        tarifaHoraModeladorUSD: 65,
        tasaImpuestoPorcentaje: 12,
        horasProductivasPorDia: 8
    };

    // --- CASO 1: Propuestas Arquitectónicas Residencial, Corporativo e Interiorismo (Caso Normal) ---
    const servicioNormal = new ServicioCotizadorArquitectura3D(configEstudio);

    servicioNormal.generarCotizacion({
        codigoCotizacion: 'ARQ-2026-001',
        nombreProyecto: 'Residencia Minimalista Cayalá',
        clienteNombre: 'Constructora Horizonte S.A.',
        tipoProyecto: 'Residencial',
        areaConstruccionM2: 420,
        nivelDetalleBIM: 'LOD300_Ejecutivo',
        clienteFrecuente: true,
        entregables: [
            {
                codigoEntregable: 'RND-EXT-01',
                descripcion: 'Renders Exteriores Fachada Día y Atardecer 4K',
                calidadRender: 'Fotorrealista4K',
                cantidadUnidades: 4,
                complejidadEscena: 'Alta'
            },
            {
                codigoEntregable: 'RND-INT-02',
                descripcion: 'Renders Interiores Sala, Cocina y Master Suite',
                calidadRender: 'Fotorrealista4K',
                cantidadUnidades: 6,
                complejidadEscena: 'Media'
            }
        ]
    });

    servicioNormal.generarCotizacion({
        codigoCotizacion: 'ARQ-2026-002',
        nombreProyecto: 'Torre Corporativa Zona 10',
        clienteNombre: 'Grupo Inmobiliario Apex',
        tipoProyecto: 'Corporativo',
        areaConstruccionM2: 3200,
        nivelDetalleBIM: 'LOD400_Fabricacion',
        entregables: [
            {
                codigoEntregable: 'VR-LOBBY-01',
                descripcion: 'Recorrido Virtual Interactivo 360° Lobby y Amenidades',
                calidadRender: 'RecorridoVirtualVR',
                cantidadUnidades: 2,
                complejidadEscena: 'Alta'
            },
            {
                codigoEntregable: 'ANIM-PROMO-02',
                descripcion: 'Animación Arquitectónica Cinematográfica 60s',
                calidadRender: 'AnimacionCinematografica',
                cantidadUnidades: 1,
                complejidadEscena: 'Alta'
            }
        ]
    });

    servicioNormal.generarCotizacion({
        codigoCotizacion: 'ARQ-2026-003',
        nombreProyecto: 'Flagship Store Café de Especialidad',
        clienteNombre: 'Tostaduría Antigua',
        tipoProyecto: 'Interiorismo',
        areaConstruccionM2: 145,
        nivelDetalleBIM: 'LOD300_Ejecutivo',
        entregables: [
            {
                codigoEntregable: 'RND-COM-01',
                descripcion: 'Vistas Fotorrealistas Barra y Mobiliario Custom',
                calidadRender: 'Fotorrealista4K',
                cantidadUnidades: 3,
                complejidadEscena: 'Media'
            }
        ]
    });

    // Aprobación comercial de la residencia y la tienda flagship
    servicioNormal.actualizarEstadoCotizacion({
        codigoCotizacion: 'ARQ-2026-001',
        nuevoEstado: 'Aprobada'
    });
    servicioNormal.actualizarEstadoCotizacion({
        codigoCotizacion: 'ARQ-2026-003',
        nuevoEstado: 'Aprobada'
    });

    const reporteNormal = servicioNormal.obtenerReporteFinal();
    mostrarReporteCotizadorArquitectura(
        reporteNormal,
        'Caso Normal - Portafolio BIM, Renders 4K y Recorridos VR'
    );

    // --- CASO 2: Presupuesto Cliente Excedido, Aprobación Bloqueada, Duplicados y DTO Inválido (Caso Límite) ---
    const servicioLimite = new ServicioCotizadorArquitectura3D(configEstudio);

    // Proyecto cuyo costo supera el presupuestoTopeClienteUSD ($2,000)
    servicioLimite.generarCotizacion({
        codigoCotizacion: 'ARQ-LIM-01',
        nombreProyecto: 'Centro Comercial Plaza Norte',
        clienteNombre: 'Inversiones del Norte',
        tipoProyecto: 'Comercial',
        areaConstruccionM2: 1800,
        nivelDetalleBIM: 'LOD300_Ejecutivo',
        presupuestoTopeClienteUSD: 2000,
        entregables: [
            {
                codigoEntregable: 'RND-PLZ-01',
                descripcion: 'Perspectivas Aéreas y Atrio Central',
                calidadRender: 'Fotorrealista4K',
                cantidadUnidades: 5,
                complejidadEscena: 'Alta'
            }
        ]
    });

    // Intento de forzar aprobación de una cotización marcada como RechazadaPorPresupuesto
    servicioLimite.actualizarEstadoCotizacion({
        codigoCotizacion: 'ARQ-LIM-01',
        nuevoEstado: 'Aprobada'
    });

    // Intento de generar cotización con código duplicado
    servicioLimite.generarCotizacion({
        codigoCotizacion: 'ARQ-LIM-01',
        nombreProyecto: 'Centro Comercial Duplicado',
        clienteNombre: 'Inversiones del Norte',
        tipoProyecto: 'Comercial',
        areaConstruccionM2: 1800,
        nivelDetalleBIM: 'LOD200_Basico',
        entregables: [
            {
                codigoEntregable: 'RND-01',
                descripcion: 'Vista Simple',
                calidadRender: 'BorradorConceptual',
                cantidadUnidades: 1,
                complejidadEscena: 'Baja'
            }
        ]
    });

    // Intento de generar cotización con DTO corrupto (área negativa, sin entregables, código corto)
    servicioLimite.generarCotizacion({
        codigoCotizacion: 'X',
        nombreProyecto: 'AB',
        clienteNombre: '',
        tipoProyecto: 'Urbanismo',
        areaConstruccionM2: -120,
        nivelDetalleBIM: 'LOD200_Basico',
        entregables: [],
        presupuestoTopeClienteUSD: -500
    });

    const reporteLimite = servicioLimite.obtenerReporteFinal();
    mostrarReporteCotizadorArquitectura(
        reporteLimite,
        'Caso Límite - Tope Presupuestario Excedido, Duplicados y DTO Corrupto'
    );
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));