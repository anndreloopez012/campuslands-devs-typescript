
// 1. CAPA DE DOMINIO Y DTOs (Data Transfer Objects)

export type TipoHerramientaDibujo =
    | 'PincelLibre'
    | 'LineaRecta'
    | 'Rectangulo'
    | 'Circulo'
    | 'Borrador';

export type EstadoCapaCanvas =
    | 'Visible'
    | 'Oculta'
    | 'Bloqueada';

export interface Punto2D {
    readonly x: number;
    readonly y: number;
}

export interface ConfiguracionLienzo {
    readonly nombreProyecto: string;
    readonly anchoPx: number;
    readonly altoPx: number;
    readonly colorFondoHex: string;
    readonly maxCapasPermitidas: number;
}

// Unión discriminada para modelar la geometría específica de cada trazo
export type GeometriaTrazo =
    | {
        readonly tipo: 'LineaRecta';
        readonly inicio: Punto2D;
        readonly fin: Punto2D;
    }
    | {
        readonly tipo: 'Rectangulo';
        readonly origen: Punto2D;
        readonly ancho: number;
        readonly alto: number;
        readonly relleno: boolean;
    }
    | {
        readonly tipo: 'Circulo';
        readonly centro: Punto2D;
        readonly radio: number;
        readonly relleno: boolean;
    }
    | {
        readonly tipo: 'PincelLibre' | 'Borrador';
        readonly puntos: readonly Punto2D[];
    };

export interface CapaCanvasDominio {
    readonly id: string;
    readonly codigoCapa: string;
    readonly nombre: string;
    readonly ordenZ: number;
    readonly opacidad: number;
    readonly estado: EstadoCapaCanvas;
}

export interface TrazoCanvasDominio {
    readonly id: string;
    readonly codigoTrazo: string;
    readonly codigoCapa: string;
    readonly herramienta: TipoHerramientaDibujo;
    readonly colorHex: string;
    readonly grosorPx: number;
    readonly opacidad: number;
    readonly geometria: GeometriaTrazo;
    readonly longitudTrazoPx: number;
    readonly areaCubiertaPx2: number;
    readonly eliminadoPorUndo: boolean;
}

// DTO de entrada para crear una nueva capa en el lienzo
export interface CrearCapaDTO {
    readonly codigoCapa: string;
    readonly nombre: string;
    readonly ordenZ: number;
    readonly opacidad?: number;
    readonly estadoInicial?: EstadoCapaCanvas;
}

// DTO de entrada para dibujar un nuevo trazo o figura geométrica
export interface AgregarTrazoDTO {
    readonly codigoTrazo: string;
    readonly codigoCapa: string;
    readonly colorHex: string;
    readonly grosorPx: number;
    readonly opacidad?: number;
    readonly geometria: GeometriaTrazo;
}

// DTO para cambiar visibilidad, bloqueo u opacidad de una capa
export interface ActualizarCapaDTO {
    readonly codigoCapa: string;
    readonly nuevoEstado?: EstadoCapaCanvas;
    readonly nuevaOpacidad?: number;
}

export type ResultadoOperacion<T> =
    | { readonly ok: true; readonly valor: T }
    | { readonly ok: false; readonly errores: readonly string[] };

export interface ResumenHerramientaDibujo {
    readonly cantidadTrazosActivos: number;
    readonly longitudTotalPx: number;
    readonly areaTotalPx2: number;
    readonly grosorPromedioPx: number;
}

export interface ReporteCanvasDibujo {
    readonly reporteId: string;
    readonly configuracionLienzo: ConfiguracionLienzo;
    readonly totalCapas: number;
    readonly capasVisiblesCount: number;
    readonly totalTrazosActivos: number;
    readonly trazosDeshechosCount: number;
    readonly longitudTotalDibujadaPx: number;
    readonly areaTotalCubiertaPx2: number;
    readonly porcentajeCoberturaLienzo: number;
    readonly trazoMayorLongitud: TrazoCanvasDominio | null;
    readonly desglosePorHerramienta: Readonly<Record<TipoHerramientaDibujo, ResumenHerramientaDibujo>>;
    readonly capasOrdenadasZ: readonly CapaCanvasDominio[];
    readonly trazosActivos: readonly TrazoCanvasDominio[];
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

// 3. VALIDACIONES, CÁLCULOS GEOMÉTRICOS Y TRANSFORMACIONES DTO <-> DOMINIO

const HERRAMIENTAS_DIBUJO: readonly TipoHerramientaDibujo[] = [
    'PincelLibre',
    'LineaRecta',
    'Rectangulo',
    'Circulo',
    'Borrador'
];

const PATRON_COLOR_HEX = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

export function calcularDistancia2D(p1: Punto2D, p2: Punto2D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.hypot(dx, dy);
}

export function puntoDentroDeLienzo(
    punto: Punto2D,
    lienzo: ConfiguracionLienzo
): boolean {
    return (
        Number.isFinite(punto.x) &&
        Number.isFinite(punto.y) &&
        punto.x >= 0 &&
        punto.x <= lienzo.anchoPx &&
        punto.y >= 0 &&
        punto.y <= lienzo.altoPx
    );
}

export function calcularMetricasGeometricas(
    geometria: GeometriaTrazo,
    grosorPx: number
): { readonly longitudTrazoPx: number; readonly areaCubiertaPx2: number } {
    switch (geometria.tipo) {
        case 'LineaRecta': {
            const longitud = calcularDistancia2D(geometria.inicio, geometria.fin);
            return {
                longitudTrazoPx: Number(longitud.toFixed(2)),
                areaCubiertaPx2: Number((longitud * grosorPx).toFixed(2))
            };
        }
        case 'Rectangulo': {
            const perimetro = 2 * (geometria.ancho + geometria.alto);
            const area = geometria.relleno
                ? geometria.ancho * geometria.alto
                : perimetro * grosorPx;
            return {
                longitudTrazoPx: Number(perimetro.toFixed(2)),
                areaCubiertaPx2: Number(area.toFixed(2))
            };
        }
        case 'Circulo': {
            const circunferencia = 2 * Math.PI * geometria.radio;
            const area = geometria.relleno
                ? Math.PI * geometria.radio * geometria.radio
                : circunferencia * grosorPx;
            return {
                longitudTrazoPx: Number(circunferencia.toFixed(2)),
                areaCubiertaPx2: Number(area.toFixed(2))
            };
        }
        case 'PincelLibre':
        case 'Borrador': {
            let longitudAcumulada = 0;
            for (let i = 1; i < geometria.puntos.length; i++) {
                longitudAcumulada += calcularDistancia2D(
                    geometria.puntos[i - 1],
                    geometria.puntos[i]
                );
            }
            return {
                longitudTrazoPx: Number(longitudAcumulada.toFixed(2)),
                areaCubiertaPx2: Number((longitudAcumulada * grosorPx).toFixed(2))
            };
        }
    }
}

export function validarCrearCapaDTO(
    dto: CrearCapaDTO
): ResultadoOperacion<CrearCapaDTO> {
    const errores: string[] = [];

    if (dto.codigoCapa.trim().length < 3) {
        errores.push(`Código de capa inválido ("${dto.codigoCapa}"): mínimo 3 caracteres.`);
    }

    if (dto.nombre.trim().length < 2) {
        errores.push(`El nombre de la capa ("${dto.nombre}") es obligatorio.`);
    }

    if (!Number.isInteger(dto.ordenZ) || dto.ordenZ < 0 || dto.ordenZ > 100) {
        errores.push(`Orden Z inválido (${dto.ordenZ}) en capa "${dto.nombre}".`);
    }

    const opacidad = dto.opacidad ?? 1;
    if (opacidad < 0 || opacidad > 1) {
        errores.push(`Opacidad de capa fuera de rango [0..1] (${opacidad}) en "${dto.nombre}".`);
    }

    return errores.length === 0
        ? { ok: true, valor: dto }
        : { ok: false, errores };
}

export function validarAgregarTrazoDTO(
    dto: AgregarTrazoDTO,
    lienzo: ConfiguracionLienzo
): ResultadoOperacion<AgregarTrazoDTO> {
    const errores: string[] = [];

    if (dto.codigoTrazo.trim().length < 3) {
        errores.push(`Código de trazo inválido ("${dto.codigoTrazo}").`);
    }

    if (!PATRON_COLOR_HEX.test(dto.colorHex.trim())) {
        errores.push(
            `Color hexadecimal inválido ("${dto.colorHex}") en trazo "${dto.codigoTrazo}": use formato #RRGGBB o #RGB.`
        );
    }

    if (dto.grosorPx < 1 || dto.grosorPx > 120) {
        errores.push(
            `Grosor de pincel fuera de rango (${dto.grosorPx} px) en trazo "${dto.codigoTrazo}".`
        );
    }

    const opacidad = dto.opacidad ?? 1;
    if (opacidad <= 0 || opacidad > 1) {
        errores.push(
            `Opacidad de trazo fuera de rango (0..1] (${opacidad}) en "${dto.codigoTrazo}".`
        );
    }

    const { geometria } = dto;
    switch (geometria.tipo) {
        case 'LineaRecta': {
            if (
                !puntoDentroDeLienzo(geometria.inicio, lienzo) ||
                !puntoDentroDeLienzo(geometria.fin, lienzo)
            ) {
                errores.push(
                    `Coordenadas de LineaRecta fuera de los límites del lienzo (${lienzo.anchoPx}x${lienzo.altoPx}) en "${dto.codigoTrazo}".`
                );
            }
            break;
        }
        case 'Rectangulo': {
            if (geometria.ancho <= 0 || geometria.alto <= 0) {
                errores.push(
                    `Dimensiones de Rectángulo inválidas (${geometria.ancho}x${geometria.alto}) en "${dto.codigoTrazo}".`
                );
            }
            const esquinaInferiorDerecha: Punto2D = {
                x: geometria.origen.x + geometria.ancho,
                y: geometria.origen.y + geometria.alto
            };
            if (
                !puntoDentroDeLienzo(geometria.origen, lienzo) ||
                !puntoDentroDeLienzo(esquinaInferiorDerecha, lienzo)
            ) {
                errores.push(
                    `El Rectángulo en "${dto.codigoTrazo}" desborda los límites del lienzo (${lienzo.anchoPx}x${lienzo.altoPx}).`
                );
            }
            break;
        }
        case 'Circulo': {
            if (geometria.radio <= 0) {
                errores.push(
                    `Radio de Círculo inválido (${geometria.radio} px) en "${dto.codigoTrazo}".`
                );
            }
            const dentroHorizontal =
                geometria.centro.x - geometria.radio >= 0 &&
                geometria.centro.x + geometria.radio <= lienzo.anchoPx;
            const dentroVertical =
                geometria.centro.y - geometria.radio >= 0 &&
                geometria.centro.y + geometria.radio <= lienzo.altoPx;
            if (!dentroHorizontal || !dentroVertical) {
                errores.push(
                    `El Círculo en "${dto.codigoTrazo}" sobresale del área del lienzo (${lienzo.anchoPx}x${lienzo.altoPx}).`
                );
            }
            break;
        }
        case 'PincelLibre':
        case 'Borrador': {
            if (geometria.puntos.length < 2) {
                errores.push(
                    `El trazo "${dto.codigoTrazo}" (${geometria.tipo}) requiere al menos 2 puntos.`
                );
            }
            const fueraDeRango = geometria.puntos.some(
                (pt) => !puntoDentroDeLienzo(pt, lienzo)
            );
            if (fueraDeRango) {
                errores.push(
                    `Uno o más puntos del trazo "${dto.codigoTrazo}" exceden el lienzo (${lienzo.anchoPx}x${lienzo.altoPx}).`
                );
            }
            break;
        }
    }

    return errores.length === 0
        ? { ok: true, valor: dto }
        : { ok: false, errores };
}

export function mapearCapaDTOADominio(
    dto: CrearCapaDTO,
    secuencia: number
): CapaCanvasDominio {
    const codigoLimpio = dto.codigoCapa.trim().toUpperCase();
    return {
        id: `lay-${codigoLimpio}-${secuencia}`,
        codigoCapa: codigoLimpio,
        nombre: dto.nombre.trim(),
        ordenZ: dto.ordenZ,
        opacidad: Number((dto.opacidad ?? 1).toFixed(2)),
        estado: dto.estadoInicial ?? 'Visible'
    };
}

export function mapearTrazoDTOADominio(
    dto: AgregarTrazoDTO,
    secuencia: number
): TrazoCanvasDominio {
    const codigoLimpio = dto.codigoTrazo.trim().toUpperCase();
    const metricas = calcularMetricasGeometricas(dto.geometria, dto.grosorPx);

    return {
        id: `str-${codigoLimpio}-${secuencia}`,
        codigoTrazo: codigoLimpio,
        codigoCapa: dto.codigoCapa.trim().toUpperCase(),
        herramienta: dto.geometria.tipo,
        colorHex:
            dto.geometria.tipo === 'Borrador'
                ? '#TRANSPARENTE'
                : dto.colorHex.trim().toUpperCase(),
        grosorPx: dto.grosorPx,
        opacidad: Number((dto.opacidad ?? 1).toFixed(2)),
        geometria: dto.geometria,
        longitudTrazoPx: metricas.longitudTrazoPx,
        areaCubiertaPx2: metricas.areaCubiertaPx2,
        eliminadoPorUndo: false
    };
}

// 4. GENERACIÓN DE REPORTES Y SERVICIO DE CANVAS DE DIBUJO BÁSICO

export function generarReporteCanvasDibujo(
    lienzo: ConfiguracionLienzo,
    capas: readonly CapaCanvasDominio[],
    trazos: readonly TrazoCanvasDominio[],
    advertencias: readonly string[]
): ReporteCanvasDibujo {
    const capasOrdenadasZ = [...capas].sort((a, b) => a.ordenZ - b.ordenZ);
    const capasVisiblesCount = capas.filter((c) => c.estado === 'Visible').length;

    const trazosActivos = trazos.filter((t) => !t.eliminadoPorUndo);
    const trazosDeshechosCount = trazos.filter((t) => t.eliminadoPorUndo).length;

    const longitudTotalDibujadaPx = Number(
        trazosActivos.reduce((acc, t) => acc + t.longitudTrazoPx, 0).toFixed(2)
    );

    const areaTotalCubiertaPx2 = Number(
        trazosActivos
            .filter((t) => t.herramienta !== 'Borrador')
            .reduce((acc, t) => acc + t.areaCubiertaPx2, 0)
            .toFixed(2)
    );

    const areaTotalLienzoPx2 = lienzo.anchoPx * lienzo.altoPx;
    const porcentajeCoberturaLienzo =
        areaTotalLienzoPx2 > 0
            ? Number(
                Math.min(100, (areaTotalCubiertaPx2 / areaTotalLienzoPx2) * 100).toFixed(2)
            )
            : 0;

    const trazoMayorLongitud =
        [...trazosActivos].sort((a, b) => b.longitudTrazoPx - a.longitudTrazoPx)[0] ??
        null;

    const desglosePorHerramienta = HERRAMIENTAS_DIBUJO.reduce((acc, herr) => {
        const delGrupo = trazosActivos.filter((t) => t.herramienta === herr);
        const longitudTotalPx = Number(
            delGrupo.reduce((s, t) => s + t.longitudTrazoPx, 0).toFixed(2)
        );
        const areaTotalPx2 = Number(
            delGrupo.reduce((s, t) => s + t.areaCubiertaPx2, 0).toFixed(2)
        );
        const grosorPromedioPx =
            delGrupo.length > 0
                ? Number(
                    (
                        delGrupo.reduce((s, t) => s + t.grosorPx, 0) / delGrupo.length
                    ).toFixed(1)
                )
                : 0;

        acc[herr] = {
            cantidadTrazosActivos: delGrupo.length,
            longitudTotalPx,
            areaTotalPx2,
            grosorPromedioPx
        };
        return acc;
    }, {} as Record<TipoHerramientaDibujo, ResumenHerramientaDibujo>);

    return {
        reporteId: `REP-CANVAS-${Date.now()}`,
        configuracionLienzo: lienzo,
        totalCapas: capas.length,
        capasVisiblesCount,
        totalTrazosActivos: trazosActivos.length,
        trazosDeshechosCount,
        longitudTotalDibujadaPx,
        areaTotalCubiertaPx2,
        porcentajeCoberturaLienzo,
        trazoMayorLongitud,
        desglosePorHerramienta,
        capasOrdenadasZ,
        trazosActivos,
        advertencias
    };
}

export class ServicioCanvasDibujo {
    private readonly repoCapas = new RepositorioEnMemoria<CapaCanvasDominio>();
    private readonly repoTrazos = new RepositorioEnMemoria<TrazoCanvasDominio>();
    private readonly pilaHistorialIds: string[] = [];
    private readonly pilaRehacerIds: string[] = [];
    private readonly advertencias: string[] = [];
    private secuenciaCapa = 1;
    private secuenciaTrazo = 1;

    constructor(private readonly lienzo: ConfiguracionLienzo) { }

    public crearCapa(dto: CrearCapaDTO): ResultadoOperacion<CapaCanvasDominio> {
        if (this.repoCapas.contar() >= this.lienzo.maxCapasPermitidas) {
            const msg = `Límite de capas alcanzado (${this.lienzo.maxCapasPermitidas}): no se puede crear "${dto.nombre}".`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const validacion = validarCrearCapaDTO(dto);
        if (!validacion.ok) {
            this.advertencias.push(...validacion.errores);
            return validacion;
        }

        const codigoNormalizado = dto.codigoCapa.trim().toUpperCase();
        const duplicada = this.repoCapas.buscarUno(
            (c) => c.codigoCapa === codigoNormalizado
        );
        if (duplicada) {
            const msg = `Código de capa duplicado: "${codigoNormalizado}" ("${dto.nombre}") ya existe.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const capa = mapearCapaDTOADominio(dto, this.secuenciaCapa++);
        this.repoCapas.guardar(capa);
        return { ok: true, valor: capa };
    }

    public actualizarCapa(
        dto: ActualizarCapaDTO
    ): ResultadoOperacion<CapaCanvasDominio> {
        const codigoNormalizado = dto.codigoCapa.trim().toUpperCase();
        const capa = this.repoCapas.buscarUno(
            (c) => c.codigoCapa === codigoNormalizado
        );

        if (!capa) {
            const msg = `No se encontró la capa "${codigoNormalizado}" para actualizar.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        if (
            dto.nuevaOpacidad !== undefined &&
            (dto.nuevaOpacidad < 0 || dto.nuevaOpacidad > 1)
        ) {
            const msg = `Opacidad inválida (${dto.nuevaOpacidad}) al actualizar capa "${codigoNormalizado}".`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const actualizada: CapaCanvasDominio = {
            ...capa,
            estado: dto.nuevoEstado ?? capa.estado,
            opacidad:
                dto.nuevaOpacidad !== undefined
                    ? Number(dto.nuevaOpacidad.toFixed(2))
                    : capa.opacidad
        };
        this.repoCapas.guardar(actualizada);
        return { ok: true, valor: actualizada };
    }

    public dibujarTrazo(
        dto: AgregarTrazoDTO
    ): ResultadoOperacion<TrazoCanvasDominio> {
        const validacion = validarAgregarTrazoDTO(dto, this.lienzo);
        if (!validacion.ok) {
            this.advertencias.push(...validacion.errores);
            return validacion;
        }

        const codigoTrazoNorm = dto.codigoTrazo.trim().toUpperCase();
        const trazoDuplicado = this.repoTrazos.buscarUno(
            (t) => t.codigoTrazo === codigoTrazoNorm
        );
        if (trazoDuplicado) {
            const msg = `Código de trazo duplicado: "${codigoTrazoNorm}" ya existe en el lienzo.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const codigoCapaNorm = dto.codigoCapa.trim().toUpperCase();
        const capa = this.repoCapas.buscarUno((c) => c.codigoCapa === codigoCapaNorm);
        if (!capa) {
            const msg = `Capa destino "${codigoCapaNorm}" inexistente para el trazo "${codigoTrazoNorm}".`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        if (capa.estado === 'Bloqueada') {
            const msg = `Capa "${capa.nombre}" (${capa.codigoCapa}) está Bloqueada: no se permite dibujar "${codigoTrazoNorm}".`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        if (capa.estado === 'Oculta') {
            this.advertencias.push(
                `Aviso: el trazo "${codigoTrazoNorm}" se dibujó sobre la capa "${capa.nombre}" mientras está Oculta.`
            );
        }

        const trazo = mapearTrazoDTOADominio(dto, this.secuenciaTrazo++);
        this.repoTrazos.guardar(trazo);
        this.pilaHistorialIds.push(trazo.id);
        this.pilaRehacerIds.length = 0;

        return { ok: true, valor: trazo };
    }

    public deshacerUltimoTrazo(): ResultadoOperacion<TrazoCanvasDominio> {
        const ultimoId = this.pilaHistorialIds.pop();
        if (!ultimoId) {
            const msg = 'Historial vacío: no hay trazos disponibles para deshacer (Undo).';
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const trazo = this.repoTrazos.obtenerPorId(ultimoId);
        if (!trazo) {
            const msg = `No se encontró el trazo "${ultimoId}" en el repositorio.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const trazoDeshecho: TrazoCanvasDominio = {
            ...trazo,
            eliminadoPorUndo: true
        };
        this.repoTrazos.guardar(trazoDeshecho);
        this.pilaRehacerIds.push(trazo.id);
        return { ok: true, valor: trazoDeshecho };
    }

    public rehacerTrazo(): ResultadoOperacion<TrazoCanvasDominio> {
        const idRehacer = this.pilaRehacerIds.pop();
        if (!idRehacer) {
            const msg = 'No hay acciones pendientes para rehacer (Redo).';
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const trazo = this.repoTrazos.obtenerPorId(idRehacer);
        if (!trazo) {
            const msg = `No se encontró el trazo "${idRehacer}" para rehacer.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const trazoRestaurado: TrazoCanvasDominio = {
            ...trazo,
            eliminadoPorUndo: false
        };
        this.repoTrazos.guardar(trazoRestaurado);
        this.pilaHistorialIds.push(trazo.id);
        return { ok: true, valor: trazoRestaurado };
    }

    public obtenerReporteFinal(): ReporteCanvasDibujo {
        return generarReporteCanvasDibujo(
            this.lienzo,
            this.repoCapas.obtenerTodos(),
            this.repoTrazos.obtenerTodos(),
            this.advertencias
        );
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarReporteCanvasDibujo(
    reporte: ReporteCanvasDibujo,
    tituloCaso: string
): void {
    const { configuracionLienzo: lienzo } = reporte;
    console.log(`\n======================================================================`);
    console.log(` CANVAS DE DIBUJO BÁSICO - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Proyecto / Lienzo   : ${lienzo.nombreProyecto} (${lienzo.anchoPx}x${lienzo.altoPx} px | Fondo: ${lienzo.colorFondoHex})`);
    console.log(`Reporte ID          : ${reporte.reporteId}`);
    console.log(`Capas               : ${reporte.totalCapas} creadas (${reporte.capasVisiblesCount} visibles / máx ${lienzo.maxCapasPermitidas})`);
    console.log(`Trazos              : ${reporte.totalTrazosActivos} activos | ${reporte.trazosDeshechosCount} en papelera Undo`);
    console.log(`Métricas Lienzo     : Longitud Total: ${reporte.longitudTotalDibujadaPx} px | Área Cubierta: ${reporte.areaTotalCubiertaPx2} px² (${reporte.porcentajeCoberturaLienzo}%)`);
    console.log(`Trazo Más Extenso   : ${reporte.trazoMayorLongitud ? `"${reporte.trazoMayorLongitud.codigoTrazo}" (${reporte.trazoMayorLongitud.herramienta} - ${reporte.trazoMayorLongitud.longitudTrazoPx} px)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (reporte.advertencias.length > 0) {
        console.log(`ALERTAS DE GEOMETRÍA, CAPAS E HISTORIAL (${reporte.advertencias.length}):`);
        reporte.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR HERRAMIENTA DE DIBUJO:`);
    Object.entries(reporte.desglosePorHerramienta).forEach(([herr, info]) => {
        console.log(
            `   - ${herr.padEnd(14)}: ${info.cantidadTrazosActivos} trazos | Long: ${String(info.longitudTotalPx).padStart(7)} px | Área: ${String(info.areaTotalPx2).padStart(9)} px²`
        );
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        reporte.trazosActivos.map((t) => ({
            Trazo: t.codigoTrazo,
            Capa: t.codigoCapa,
            Herramienta: t.herramienta,
            Color: t.colorHex,
            Grosor: `${t.grosorPx} px`,
            Opacidad: `${Math.round(t.opacidad * 100)}%`,
            'Longitud (px)': t.longitudTrazoPx,
            'Área (px²)': t.areaCubiertaPx2
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

async function ejecutarPruebas(): Promise<void> {
    // Simulación de inicialización del contexto gráfico 2D
    await new Promise((resolve) => setTimeout(resolve, 10));

    // --- CASO 1: Ilustración Vectorial Multicapa con Undo/Redo (Caso Normal) ---
    const lienzoNormal: ConfiguracionLienzo = {
        nombreProyecto: 'Paisaje Nocturno Minimalista',
        anchoPx: 1280,
        altoPx: 720,
        colorFondoHex: '#0F172A',
        maxCapasPermitidas: 5
    };

    const canvasNormal = new ServicioCanvasDibujo(lienzoNormal);

    canvasNormal.crearCapa({
        codigoCapa: 'CAP-FND',
        nombre: 'Cielo y Luna',
        ordenZ: 1,
        opacidad: 1.0
    });

    canvasNormal.crearCapa({
        codigoCapa: 'CAP-ARQ',
        nombre: 'Silueta Urbana',
        ordenZ: 2,
        opacidad: 0.95
    });

    canvasNormal.crearCapa({
        codigoCapa: 'CAP-DET',
        nombre: 'Trazos Artísticos',
        ordenZ: 3,
        opacidad: 0.85
    });

    // Dibujo de Luna llena (Círculo con relleno)
    canvasNormal.dibujarTrazo({
        codigoTrazo: 'TRZ-LUNA-01',
        codigoCapa: 'CAP-FND',
        colorHex: '#FDE047',
        grosorPx: 2,
        geometria: {
            tipo: 'Circulo',
            centro: { x: 980, y: 160 },
            radio: 65,
            relleno: true
        }
    });

    // Dibujo de Edificio Principal (Rectángulo con relleno)
    canvasNormal.dibujarTrazo({
        codigoTrazo: 'TRZ-EDIF-02',
        codigoCapa: 'CAP-ARQ',
        colorHex: '#1E293B',
        grosorPx: 3,
        geometria: {
            tipo: 'Rectangulo',
            origen: { x: 220, y: 320 },
            ancho: 260,
            alto: 400,
            relleno: true
        }
    });

    // Dibujo de Línea de Horizonte
    canvasNormal.dibujarTrazo({
        codigoTrazo: 'TRZ-HOR-03',
        codigoCapa: 'CAP-ARQ',
        colorHex: '#38BDF8',
        grosorPx: 4,
        geometria: {
            tipo: 'LineaRecta',
            inicio: { x: 0, y: 680 },
            fin: { x: 1280, y: 680 }
        }
    });

    // Dibujo a mano alzada con PincelLibre
    canvasNormal.dibujarTrazo({
        codigoTrazo: 'TRZ-EST-04',
        codigoCapa: 'CAP-DET',
        colorHex: '#F8FAFC',
        grosorPx: 3,
        geometria: {
            tipo: 'PincelLibre',
            puntos: [
                { x: 120, y: 110 },
                { x: 160, y: 135 },
                { x: 210, y: 120 },
                { x: 255, y: 150 }
            ]
        }
    });

    // Trazo temporal que se deshace con Undo
    canvasNormal.dibujarTrazo({
        codigoTrazo: 'TRZ-TMP-05',
        codigoCapa: 'CAP-DET',
        colorHex: '#EF4444',
        grosorPx: 10,
        geometria: {
            tipo: 'LineaRecta',
            inicio: { x: 50, y: 50 },
            fin: { x: 300, y: 300 }
        }
    });

    canvasNormal.deshacerUltimoTrazo();

    const reporteNormal = canvasNormal.obtenerReporteFinal();
    mostrarReporteCanvasDibujo(reporteNormal, 'Caso Normal - Composición Multicapa y Geometría 2D');

    // --- CASO 2: Coordenadas Fuera de Lienzo, Capa Bloqueada, Límite de Capas y Undo Vacío (Caso Límite) ---
    const lienzoLimite: ConfiguracionLienzo = {
        nombreProyecto: 'Prueba Estrés Lienzo 800x600',
        anchoPx: 800,
        altoPx: 600,
        colorFondoHex: '#FFFFFF',
        maxCapasPermitidas: 1
    };

    const canvasLimite = new ServicioCanvasDibujo(lienzoLimite);

    // Intentar deshacer cuando el historial está vacío
    canvasLimite.deshacerUltimoTrazo();

    // Crear primera capa (ocupa el máximo de 1 capa permitida)
    canvasLimite.crearCapa({
        codigoCapa: 'CAP-BASE',
        nombre: 'Capa Única',
        ordenZ: 1
    });

    // Intentar crear segunda capa excediendo maxCapasPermitidas
    canvasLimite.crearCapa({
        codigoCapa: 'CAP-EXTRA',
        nombre: 'Capa Excedente',
        ordenZ: 2
    });

    // Bloquear capa base e intentar dibujar sobre ella
    canvasLimite.actualizarCapa({
        codigoCapa: 'CAP-BASE',
        nuevoEstado: 'Bloqueada'
    });

    canvasLimite.dibujarTrazo({
        codigoTrazo: 'TRZ-BLQ-01',
        codigoCapa: 'CAP-BASE',
        colorHex: '#000000',
        grosorPx: 2,
        geometria: {
            tipo: 'LineaRecta',
            inicio: { x: 10, y: 10 },
            fin: { x: 100, y: 100 }
        }
    });

    // Desbloquear capa para probar errores geométricos y de color
    canvasLimite.actualizarCapa({
        codigoCapa: 'CAP-BASE',
        nuevoEstado: 'Visible'
    });

    // Círculo que desborda el borde derecho (750 + 100 = 850 > 800) y color inválido
    canvasLimite.dibujarTrazo({
        codigoTrazo: 'TRZ-ERR-02',
        codigoCapa: 'CAP-BASE',
        colorHex: 'AZUL-INVALIDO',
        grosorPx: 0,
        geometria: {
            tipo: 'Circulo',
            centro: { x: 750, y: 300 },
            radio: 100,
            relleno: false
        }
    });

    // Rectángulo con dimensiones negativas fuera del lienzo
    canvasLimite.dibujarTrazo({
        codigoTrazo: 'TRZ-ERR-03',
        codigoCapa: 'CAP-BASE',
        colorHex: '#10B981',
        grosorPx: 4,
        geometria: {
            tipo: 'Rectangulo',
            origen: { x: 700, y: 500 },
            ancho: 250,
            alto: 200,
            relleno: true
        }
    });

    const reporteLimite = canvasLimite.obtenerReporteFinal();
    mostrarReporteCanvasDibujo(reporteLimite, 'Caso Límite - Desbordes de Lienzo, Capa Bloqueada y Undo Vacío');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));