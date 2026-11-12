
// 1. CAPA DE DOMINIO Y DTOs (Data Transfer Objects)

export type CategoriaPrenda =
    | 'Camisetas'
    | 'Pantalones'
    | 'Chaquetas'
    | 'Calzado'
    | 'Accesorios';

export type TallaRopa = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'Unica';

export type GeneroPrenda = 'Hombre' | 'Mujer' | 'Unisex';

export type TemporadaColeccion =
    | 'PrimaveraVerano'
    | 'OtonoInvierno'
    | 'Atemporal';

export type EstadoInventarioPrenda =
    | 'EnStock'
    | 'PocasUnidades'
    | 'Agotado'
    | 'Descontinuado';

export type CriterioOrdenRopa =
    | 'PrecioAscendente'
    | 'PrecioDescendente'
    | 'MasVendidos'
    | 'MayorDescuento';

export interface PrendaDominio {
    readonly id: string;
    readonly sku: string;
    readonly nombre: string;
    readonly marca: string;
    readonly categoria: CategoriaPrenda;
    readonly genero: GeneroPrenda;
    readonly colorPrincipal: string;
    readonly temporada: TemporadaColeccion;
    readonly stockPorTalla: Readonly<Record<TallaRopa, number>>;
    readonly stockTotal: number;
    readonly precioBaseUSD: number;
    readonly porcentajeDescuento: number;
    readonly precioFinalUSD: number;
    readonly estadoInventario: EstadoInventarioPrenda;
    readonly unidadesVendidas: number;
}

// DTO de entrada para registrar una nueva prenda en el catálogo
export interface CrearPrendaDTO {
    readonly sku: string;
    readonly nombre: string;
    readonly marca: string;
    readonly categoria: CategoriaPrenda;
    readonly genero: GeneroPrenda;
    readonly colorPrincipal: string;
    readonly temporada: TemporadaColeccion;
    readonly stockPorTalla: Partial<Record<TallaRopa, number>>;
    readonly precioBaseUSD: number;
    readonly porcentajeDescuento?: number;
    readonly descontinuado?: boolean;
}

// DTO de criterios de búsqueda y filtrado multicriterio
export interface FiltroCatalogoRopaDTO {
    readonly textoBusqueda?: string;
    readonly categoria?: CategoriaPrenda;
    readonly genero?: GeneroPrenda;
    readonly tallaRequerida?: TallaRopa;
    readonly temporada?: TemporadaColeccion;
    readonly precioMinUSD?: number;
    readonly precioMaxUSD?: number;
    readonly soloDisponibles?: boolean;
    readonly ordenarPor?: CriterioOrdenRopa;
}

// DTO para simular una compra de prenda por talla
export interface CompraPrendaDTO {
    readonly sku: string;
    readonly talla: TallaRopa;
    readonly cantidad: number;
}

export type ResultadoOperacion<T> =
    | { readonly ok: true; readonly valor: T }
    | { readonly ok: false; readonly errores: readonly string[] };

export interface ResumenCategoriaRopa {
    readonly totalModelos: number;
    readonly stockUnidades: number;
    readonly precioPromedioUSD: number;
    readonly valorInventarioUSD: number;
}

export interface ReporteTiendaRopa {
    readonly reporteId: string;
    readonly nombreTienda: string;
    readonly totalModelosCatalogo: number;
    readonly totalUnidadesStock: number;
    readonly valorTotalInventarioUSD: number;
    readonly ingresosPorVentasUSD: number;
    readonly modelosFiltradosCount: number;
    readonly prendaMasVendida: PrendaDominio | null;
    readonly prendaMayorDescuento: PrendaDominio | null;
    readonly desglosePorCategoria: Readonly<Record<CategoriaPrenda, ResumenCategoriaRopa>>;
    readonly resultadosFiltroActivo: readonly PrendaDominio[];
    readonly catalogoCompleto: readonly PrendaDominio[];
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

const CATEGORIAS_PRENDA: readonly CategoriaPrenda[] = [
    'Camisetas',
    'Pantalones',
    'Chaquetas',
    'Calzado',
    'Accesorios'
];

const TALLAS_ROPA: readonly TallaRopa[] = ['XS', 'S', 'M', 'L', 'XL', 'Unica'];

export function calcularPrecioFinalPrenda(
    precioBaseUSD: number,
    porcentajeDescuento: number
): number {
    const factor = 1 - porcentajeDescuento / 100;
    return Number((precioBaseUSD * factor).toFixed(2));
}

export function determinarEstadoInventario(
    stockTotal: number,
    descontinuado: boolean = false
): EstadoInventarioPrenda {
    if (descontinuado) return 'Descontinuado';
    if (stockTotal <= 0) return 'Agotado';
    if (stockTotal <= 5) return 'PocasUnidades';
    return 'EnStock';
}

export function validarCrearPrendaDTO(
    dto: CrearPrendaDTO
): ResultadoOperacion<CrearPrendaDTO> {
    const errores: string[] = [];

    if (dto.sku.trim().length < 4) {
        errores.push(`SKU inválido ("${dto.sku}"): debe tener al menos 4 caracteres.`);
    }

    if (dto.nombre.trim().length < 3) {
        errores.push(`Nombre de prenda inválido ("${dto.nombre}") en SKU "${dto.sku}".`);
    }

    if (dto.marca.trim().length < 2) {
        errores.push(`La marca es obligatoria para "${dto.nombre}".`);
    }

    if (dto.precioBaseUSD <= 0 || dto.precioBaseUSD > 2500) {
        errores.push(
            `Precio base fuera de rango ($${dto.precioBaseUSD}) en "${dto.nombre}" (${dto.sku}).`
        );
    }

    const descuento = dto.porcentajeDescuento ?? 0;
    if (descuento < 0 || descuento > 85) {
        errores.push(
            `Porcentaje de descuento no permitido (${descuento}%) en "${dto.nombre}" (${dto.sku}).`
        );
    }

    for (const talla of TALLAS_ROPA) {
        const cantidad = dto.stockPorTalla[talla];
        if (cantidad !== undefined && (cantidad < 0 || !Number.isInteger(cantidad))) {
            errores.push(
                `Stock inválido (${cantidad}) para talla ${talla} en "${dto.nombre}" (${dto.sku}).`
            );
        }
    }

    return errores.length === 0
        ? { ok: true, valor: dto }
        : { ok: false, errores };
}

export function validarFiltroRopaDTO(
    filtro: FiltroCatalogoRopaDTO
): ResultadoOperacion<FiltroCatalogoRopaDTO> {
    const errores: string[] = [];

    if (filtro.precioMinUSD !== undefined && filtro.precioMinUSD < 0) {
        errores.push(`El precio mínimo de filtro ($${filtro.precioMinUSD}) no puede ser negativo.`);
    }

    if (filtro.precioMaxUSD !== undefined && filtro.precioMaxUSD < 0) {
        errores.push(`El precio máximo de filtro ($${filtro.precioMaxUSD}) no puede ser negativo.`);
    }

    if (
        filtro.precioMinUSD !== undefined &&
        filtro.precioMaxUSD !== undefined &&
        filtro.precioMinUSD > filtro.precioMaxUSD
    ) {
        errores.push(
            `Rango de precios incoherente: mínimo ($${filtro.precioMinUSD}) mayor que máximo ($${filtro.precioMaxUSD}).`
        );
    }

    return errores.length === 0
        ? { ok: true, valor: filtro }
        : { ok: false, errores };
}

export function mapearPrendaDTOADominio(
    dto: CrearPrendaDTO,
    secuencia: number
): PrendaDominio {
    const skuNormalizado = dto.sku.trim().toUpperCase();
    const descuento = dto.porcentajeDescuento ?? 0;

    const stockPorTalla = TALLAS_ROPA.reduce(
        (acc, talla) => {
            acc[talla] = dto.stockPorTalla[talla] ?? 0;
            return acc;
        },
        {} as Record<TallaRopa, number>
    );

    const stockTotal = TALLAS_ROPA.reduce((sum, talla) => sum + stockPorTalla[talla], 0);
    const estadoInventario = determinarEstadoInventario(
        stockTotal,
        dto.descontinuado ?? false
    );

    return {
        id: `prd-${skuNormalizado}-${secuencia}`,
        sku: skuNormalizado,
        nombre: dto.nombre.trim(),
        marca: dto.marca.trim(),
        categoria: dto.categoria,
        genero: dto.genero,
        colorPrincipal: dto.colorPrincipal.trim(),
        temporada: dto.temporada,
        stockPorTalla,
        stockTotal,
        precioBaseUSD: Number(dto.precioBaseUSD.toFixed(2)),
        porcentajeDescuento: descuento,
        precioFinalUSD: calcularPrecioFinalPrenda(dto.precioBaseUSD, descuento),
        estadoInventario,
        unidadesVendidas: 0
    };
}

// 4. MOTOR DE FILTRADO Y ORDENAMIENTO INMUTABLE

export function aplicarFiltrosYOrdenamientoRopa(
    catalogo: readonly PrendaDominio[],
    filtro: FiltroCatalogoRopaDTO
): readonly PrendaDominio[] {
    const filtradas = catalogo.filter((prenda) => {
        if (filtro.textoBusqueda && filtro.textoBusqueda.trim().length > 0) {
            const termino = filtro.textoBusqueda.trim().toLowerCase();
            const coincideTexto =
                prenda.nombre.toLowerCase().includes(termino) ||
                prenda.marca.toLowerCase().includes(termino) ||
                prenda.colorPrincipal.toLowerCase().includes(termino) ||
                prenda.sku.toLowerCase().includes(termino);
            if (!coincideTexto) return false;
        }

        if (filtro.categoria && prenda.categoria !== filtro.categoria) {
            return false;
        }

        if (filtro.genero) {
            const compatibleGenero =
                prenda.genero === filtro.genero || prenda.genero === 'Unisex';
            if (!compatibleGenero) return false;
        }

        if (filtro.tallaRequerida) {
            if (prenda.stockPorTalla[filtro.tallaRequerida] <= 0) {
                return false;
            }
        }

        if (filtro.temporada && prenda.temporada !== filtro.temporada) {
            return false;
        }

        if (filtro.precioMinUSD !== undefined && prenda.precioFinalUSD < filtro.precioMinUSD) {
            return false;
        }

        if (filtro.precioMaxUSD !== undefined && prenda.precioFinalUSD > filtro.precioMaxUSD) {
            return false;
        }

        if (filtro.soloDisponibles) {
            if (
                prenda.estadoInventario === 'Agotado' ||
                prenda.estadoInventario === 'Descontinuado' ||
                prenda.stockTotal <= 0
            ) {
                return false;
            }
        }

        return true;
    });

    if (!filtro.ordenarPor) {
        return filtradas;
    }

    // Copia inmutable antes de ordenar numéricamente
    const copiaOrdenable = [...filtradas];

    switch (filtro.ordenarPor) {
        case 'PrecioAscendente':
            return copiaOrdenable.sort((a, b) => a.precioFinalUSD - b.precioFinalUSD);
        case 'PrecioDescendente':
            return copiaOrdenable.sort((a, b) => b.precioFinalUSD - a.precioFinalUSD);
        case 'MasVendidos':
            return copiaOrdenable.sort((a, b) => b.unidadesVendidas - a.unidadesVendidas);
        case 'MayorDescuento':
            return copiaOrdenable.sort((a, b) => b.porcentajeDescuento - a.porcentajeDescuento);
    }
}

// 5. GENERACIÓN DE REPORTES Y SERVICIO DE TIENDA DE ROPA

export function generarReporteTiendaRopa(
    nombreTienda: string,
    catalogo: readonly PrendaDominio[],
    resultadosFiltro: readonly PrendaDominio[],
    advertencias: readonly string[]
): ReporteTiendaRopa {
    const totalUnidadesStock = catalogo.reduce((acc, p) => acc + p.stockTotal, 0);

    const valorTotalInventarioUSD = Number(
        catalogo
            .reduce((acc, p) => acc + p.precioFinalUSD * p.stockTotal, 0)
            .toFixed(2)
    );

    const ingresosPorVentasUSD = Number(
        catalogo
            .reduce((acc, p) => acc + p.precioFinalUSD * p.unidadesVendidas, 0)
            .toFixed(2)
    );

    const prendaMasVendida =
        [...catalogo]
            .filter((p) => p.unidadesVendidas > 0)
            .sort((a, b) => b.unidadesVendidas - a.unidadesVendidas)[0] ?? null;

    const prendaMayorDescuento =
        [...catalogo]
            .filter((p) => p.porcentajeDescuento > 0)
            .sort((a, b) => b.porcentajeDescuento - a.porcentajeDescuento)[0] ?? null;

    const desglosePorCategoria = CATEGORIAS_PRENDA.reduce((acc, cat) => {
        const delGrupo = catalogo.filter((p) => p.categoria === cat);
        const stockUnidades = delGrupo.reduce((s, p) => s + p.stockTotal, 0);
        const sumaPrecios = delGrupo.reduce((s, p) => s + p.precioFinalUSD, 0);
        const precioPromedioUSD =
            delGrupo.length > 0 ? Number((sumaPrecios / delGrupo.length).toFixed(2)) : 0;
        const valorInventarioUSD = Number(
            delGrupo
                .reduce((s, p) => s + p.precioFinalUSD * p.stockTotal, 0)
                .toFixed(2)
        );

        acc[cat] = {
            totalModelos: delGrupo.length,
            stockUnidades,
            precioPromedioUSD,
            valorInventarioUSD
        };
        return acc;
    }, {} as Record<CategoriaPrenda, ResumenCategoriaRopa>);

    return {
        reporteId: `REP-ROPA-${Date.now()}`,
        nombreTienda,
        totalModelosCatalogo: catalogo.length,
        totalUnidadesStock,
        valorTotalInventarioUSD,
        ingresosPorVentasUSD,
        modelosFiltradosCount: resultadosFiltro.length,
        prendaMasVendida,
        prendaMayorDescuento,
        desglosePorCategoria,
        resultadosFiltroActivo: resultadosFiltro,
        catalogoCompleto: catalogo,
        advertencias
    };
}

export class ServicioTiendaRopa {
    private readonly repoPrendas = new RepositorioEnMemoria<PrendaDominio>();
    private readonly advertencias: string[] = [];
    private secuenciaPrenda = 1;
    private filtroActivo: FiltroCatalogoRopaDTO = {};

    constructor(private readonly nombreTienda: string) { }

    public registrarPrenda(dto: CrearPrendaDTO): ResultadoOperacion<PrendaDominio> {
        const validacion = validarCrearPrendaDTO(dto);
        if (!validacion.ok) {
            this.advertencias.push(...validacion.errores);
            return validacion;
        }

        const skuNormalizado = dto.sku.trim().toUpperCase();
        const duplicada = this.repoPrendas.buscarUno((p) => p.sku === skuNormalizado);
        if (duplicada) {
            const msg = `SKU duplicado en tienda: "${skuNormalizado}" ("${dto.nombre}") ya existe.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const prenda = mapearPrendaDTOADominio(dto, this.secuenciaPrenda++);
        this.repoPrendas.guardar(prenda);
        return { ok: true, valor: prenda };
    }

    public registrarVentaPrenda(dto: CompraPrendaDTO): ResultadoOperacion<PrendaDominio> {
        if (dto.cantidad <= 0 || !Number.isInteger(dto.cantidad)) {
            const msg = `Cantidad de compra inválida (${dto.cantidad}) para SKU "${dto.sku}".`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const skuNormalizado = dto.sku.trim().toUpperCase();
        const prenda = this.repoPrendas.buscarUno((p) => p.sku === skuNormalizado);
        if (!prenda) {
            const msg = `Prenda con SKU "${skuNormalizado}" no encontrada en inventario.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        if (prenda.estadoInventario === 'Descontinuado') {
            const msg = `La prenda "${prenda.nombre}" (${prenda.sku}) está descontinuada y no admite ventas.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const stockDisponibleTalla = prenda.stockPorTalla[dto.talla];
        if (stockDisponibleTalla < dto.cantidad) {
            const msg = `Stock insuficiente para "${prenda.nombre}" en talla ${dto.talla} (Solicitado: ${dto.cantidad}, Disponible: ${stockDisponibleTalla}).`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const nuevoStockPorTalla: Record<TallaRopa, number> = {
            ...prenda.stockPorTalla,
            [dto.talla]: stockDisponibleTalla - dto.cantidad
        };
        const nuevoStockTotal = prenda.stockTotal - dto.cantidad;

        const prendaActualizada: PrendaDominio = {
            ...prenda,
            stockPorTalla: nuevoStockPorTalla,
            stockTotal: nuevoStockTotal,
            estadoInventario: determinarEstadoInventario(nuevoStockTotal, false),
            unidadesVendidas: prenda.unidadesVendidas + dto.cantidad
        };

        this.repoPrendas.guardar(prendaActualizada);
        return { ok: true, valor: prendaActualizada };
    }

    public consultarCatalogoFiltrado(
        filtro: FiltroCatalogoRopaDTO
    ): ResultadoOperacion<readonly PrendaDominio[]> {
        const validacionFiltro = validarFiltroRopaDTO(filtro);
        if (!validacionFiltro.ok) {
            this.advertencias.push(...validacionFiltro.errores);
            return validacionFiltro;
        }

        this.filtroActivo = filtro;
        const resultados = aplicarFiltrosYOrdenamientoRopa(
            this.repoPrendas.obtenerTodos(),
            filtro
        );

        if (resultados.length === 0) {
            this.advertencias.push(
                'La búsqueda multicriterio no arrojó prendas coincidentes con los filtros aplicados.'
            );
        }

        return { ok: true, valor: resultados };
    }

    public obtenerReporteFinal(): ReporteTiendaRopa {
        const catalogo = this.repoPrendas.obtenerTodos();
        const resultadosFiltro = aplicarFiltrosYOrdenamientoRopa(
            catalogo,
            this.filtroActivo
        );

        return generarReporteTiendaRopa(
            this.nombreTienda,
            catalogo,
            resultadosFiltro,
            this.advertencias
        );
    }
}

// 6. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarReporteTiendaRopa(
    reporte: ReporteTiendaRopa,
    tituloCaso: string
): void {
    console.log(`\n======================================================================`);
    console.log(` TIENDA DE ROPA CON FILTROS - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Tienda              : ${reporte.nombreTienda}`);
    console.log(`Reporte ID          : ${reporte.reporteId}`);
    console.log(`Catálogo Total      : ${reporte.totalModelosCatalogo} modelos (${reporte.totalUnidadesStock} unidades en stock)`);
    console.log(`Valor Inventario    : $${reporte.valorTotalInventarioUSD.toFixed(2)} USD`);
    console.log(`Ingresos por Ventas : $${reporte.ingresosPorVentasUSD.toFixed(2)} USD`);
    console.log(`Prenda Más Vendida  : ${reporte.prendaMasVendida ? `"${reporte.prendaMasVendida.nombre}" (${reporte.prendaMasVendida.unidadesVendidas} uds)` : 'N/A'}`);
    console.log(`Mayor Descuento     : ${reporte.prendaMayorDescuento ? `"${reporte.prendaMayorDescuento.nombre}" (-${reporte.prendaMayorDescuento.porcentajeDescuento}%)` : 'N/A'}`);
    console.log(`Resultados Filtro   : ${reporte.modelosFiltradosCount} prenda(s) coincidente(s)`);
    console.log(`----------------------------------------------------------------------`);

    if (reporte.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE INVENTARIO Y FILTROS (${reporte.advertencias.length}):`);
        reporte.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR CATEGORÍA:`);
    Object.entries(reporte.desglosePorCategoria).forEach(([cat, resumen]) => {
        console.log(
            `   - ${cat.padEnd(14)}: ${resumen.totalModelos} modelos | Stock: ${String(resumen.stockUnidades).padStart(3)} uds | Valor: $${resumen.valorInventarioUSD.toFixed(2)}`
        );
    });
    console.log(`----------------------------------------------------------------------`);

    console.log(`PRENDAS RESULTANTES DEL FILTRO ACTIVO:`);
    console.table(
        reporte.resultadosFiltroActivo.map((p) => ({
            SKU: p.sku,
            Prenda: p.nombre,
            Marca: p.marca,
            Categoría: p.categoria,
            Género: p.genero,
            'Precio Final': `$${p.precioFinalUSD.toFixed(2)}${p.porcentajeDescuento > 0 ? ` (-${p.porcentajeDescuento}%)` : ''}`,
            'Tallas (S/M/L)': `${p.stockPorTalla.S}/${p.stockPorTalla.M}/${p.stockPorTalla.L}`,
            Estado: p.estadoInventario,
            Vendidas: p.unidadesVendidas
        }))
    );
}

// 7. CASOS DE PRUEBA (Caso Normal y Caso Límite)

async function ejecutarPruebas(): Promise<void> {
    // Simulación de consulta asíncrona a catálogo e inventario
    await new Promise((resolve) => setTimeout(resolve, 10));

    // --- CASO 1: Catálogo Urbano, Ventas por Talla y Filtrado Multicriterio (Caso Normal) ---
    const tiendaNormal = new ServicioTiendaRopa('Urban Thread Studio');

    tiendaNormal.registrarPrenda({
        sku: 'CAM-OVS-001',
        nombre: 'Camiseta Heavyweight Oversized',
        marca: 'Essential Lab',
        categoria: 'Camisetas',
        genero: 'Unisex',
        colorPrincipal: 'Negro Carbón',
        temporada: 'Atemporal',
        stockPorTalla: { S: 6, M: 12, L: 8, XL: 4 },
        precioBaseUSD: 32.0,
        porcentajeDescuento: 15
    });

    tiendaNormal.registrarPrenda({
        sku: 'CHA-BOM-002',
        nombre: 'Chaqueta Bomber Técnica Impermeable',
        marca: 'North Peak',
        categoria: 'Chaquetas',
        genero: 'Hombre',
        colorPrincipal: 'Verde Oliva',
        temporada: 'OtonoInvierno',
        stockPorTalla: { S: 2, M: 5, L: 4 },
        precioBaseUSD: 115.0,
        porcentajeDescuento: 20
    });

    tiendaNormal.registrarPrenda({
        sku: 'PAN-CAR-003',
        nombre: 'Pantalón Cargo Relaxed Fit',
        marca: 'Essential Lab',
        categoria: 'Pantalones',
        genero: 'Unisex',
        colorPrincipal: 'Arena',
        temporada: 'Atemporal',
        stockPorTalla: { S: 4, M: 7, L: 3 },
        precioBaseUSD: 64.0
    });

    tiendaNormal.registrarPrenda({
        sku: 'CAL-RUN-004',
        nombre: 'Sneakers Urban Runner V2',
        marca: 'Kinetix',
        categoria: 'Calzado',
        genero: 'Mujer',
        colorPrincipal: 'Blanco Hueso',
        temporada: 'PrimaveraVerano',
        stockPorTalla: { S: 3, M: 6, L: 2 },
        precioBaseUSD: 98.0,
        porcentajeDescuento: 10
    });

    tiendaNormal.registrarPrenda({
        sku: 'ACC-CAP-005',
        nombre: 'Gorra Minimalista Algodón Orgánico',
        marca: 'Essential Lab',
        categoria: 'Accesorios',
        genero: 'Unisex',
        colorPrincipal: 'Azul Marino',
        temporada: 'Atemporal',
        stockPorTalla: { Unica: 18 },
        precioBaseUSD: 24.0
    });

    // Simulamos ventas reales que actualizan stock y métricas
    tiendaNormal.registrarVentaPrenda({ sku: 'CAM-OVS-001', talla: 'M', cantidad: 4 });
    tiendaNormal.registrarVentaPrenda({ sku: 'CHA-BOM-002', talla: 'M', cantidad: 2 });

    // Aplicamos filtro multicriterio: género Hombre (incluye Unisex), talla M disponible, precio <= $100
    tiendaNormal.consultarCatalogoFiltrado({
        genero: 'Hombre',
        tallaRequerida: 'M',
        precioMaxUSD: 100,
        soloDisponibles: true,
        ordenarPor: 'PrecioAscendente'
    });

    const reporteNormal = tiendaNormal.obtenerReporteFinal();
    mostrarReporteTiendaRopa(reporteNormal, 'Caso Normal - Filtrado Multicriterio y Ventas por Talla');

    // --- CASO 2: Stock Agotado, DTO Inválido, SKU Duplicado y Filtro Incoherente (Caso Límite) ---
    const tiendaLimite = new ServicioTiendaRopa('Urban Thread Outlet (Auditoría)');

    tiendaLimite.registrarPrenda({
        sku: 'CHA-LTD-010',
        nombre: 'Chaqueta Cuero Edición Limitada',
        marca: 'Atelier Noir',
        categoria: 'Chaquetas',
        genero: 'Mujer',
        colorPrincipal: 'Negro',
        temporada: 'OtonoInvierno',
        stockPorTalla: { S: 1 },
        precioBaseUSD: 240.0
    });

    // Agotamos la única unidad disponible
    tiendaLimite.registrarVentaPrenda({ sku: 'CHA-LTD-010', talla: 'S', cantidad: 1 });

    // Intentamos vender una segunda unidad cuando ya está Agotado
    tiendaLimite.registrarVentaPrenda({ sku: 'CHA-LTD-010', talla: 'S', cantidad: 1 });

    // Intentamos registrar SKU duplicado
    tiendaLimite.registrarPrenda({
        sku: 'CHA-LTD-010',
        nombre: 'Chaqueta Duplicada',
        marca: 'Atelier Noir',
        categoria: 'Chaquetas',
        genero: 'Mujer',
        colorPrincipal: 'Negro',
        temporada: 'OtonoInvierno',
        stockPorTalla: { M: 3 },
        precioBaseUSD: 240.0
    });

    // Intentamos registrar DTO corrupto
    tiendaLimite.registrarPrenda({
        sku: 'AB',
        nombre: 'X',
        marca: '',
        categoria: 'Camisetas',
        genero: 'Unisex',
        colorPrincipal: 'Rojo',
        temporada: 'Atemporal',
        stockPorTalla: { M: -5 },
        precioBaseUSD: -30,
        porcentajeDescuento: 95
    });

    // Filtro con rango de precios inválido (mínimo > máximo)
    tiendaLimite.consultarCatalogoFiltrado({
        precioMinUSD: 150,
        precioMaxUSD: 50
    });

    // Filtro válido sin resultados disponibles
    tiendaLimite.consultarCatalogoFiltrado({
        categoria: 'Chaquetas',
        soloDisponibles: true
    });

    const reporteLimite = tiendaLimite.obtenerReporteFinal();
    mostrarReporteTiendaRopa(reporteLimite, 'Caso Límite - Prenda Agotada, DTO Corrupto y Filtros Extremos');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));