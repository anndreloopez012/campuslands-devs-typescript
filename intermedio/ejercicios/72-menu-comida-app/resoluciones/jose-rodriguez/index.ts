
// 1. CAPA DE DOMINIO Y DTOs (Data Transfer Objects)

export type CategoriaMenu =
    | 'Entradas'
    | 'PlatosFuertes'
    | 'HamburguesasYWraps'
    | 'Postres'
    | 'BebidasArtesanales';

export type EtiquetaDietetica =
    | 'Estandar'
    | 'Vegetariano'
    | 'Vegano'
    | 'SinGluten'
    | 'Picante';

export type EstadoPlatillo =
    | 'Disponible'
    | 'AgotadoTemporalmente'
    | 'FueraDeTemporada';

export interface PlatilloDominio {
    readonly id: string;
    readonly sku: string;
    readonly nombre: string;
    readonly descripcion: string;
    readonly categoria: CategoriaMenu;
    readonly etiquetaDietetica: EtiquetaDietetica;
    readonly precioBaseUSD: number;
    readonly porcentajeDescuento: number;
    readonly precioFinalUSD: number;
    readonly caloriasKcal: number;
    readonly tiempoPreparacionMin: number;
    readonly estado: EstadoPlatillo;
    readonly unidadesVendidas: number;
}

// DTO de entrada para registrar un nuevo platillo en el menú
export interface CrearPlatilloDTO {
    readonly sku: string;
    readonly nombre: string;
    readonly descripcion: string;
    readonly categoria: CategoriaMenu;
    readonly etiquetaDietetica: EtiquetaDietetica;
    readonly precioBaseUSD: number;
    readonly porcentajeDescuento?: number;
    readonly caloriasKcal: number;
    readonly tiempoPreparacionMin: number;
    readonly disponibleInicial?: boolean;
}

// DTO de entrada para procesar una orden/pedido interactivo del cliente
export interface ItemOrdenDTO {
    readonly sku: string;
    readonly cantidad: number;
    readonly notaCocina?: string;
}

export interface CrearOrdenMenuDTO {
    readonly codigoOrden: string;
    readonly mesaONombreCliente: string;
    readonly filtroDieteticoCliente: EtiquetaDietetica | 'Todas';
    readonly items: readonly ItemOrdenDTO[];
    readonly propinaPorcentaje?: number;
}

export interface LineaOrdenConfirmada {
    readonly sku: string;
    readonly nombrePlatillo: string;
    readonly cantidad: number;
    readonly precioUnitarioUSD: number;
    readonly subtotalLineaUSD: number;
    readonly tiempoEstimadoMin: number;
}

export interface OrdenProcesadaDominio {
    readonly id: string;
    readonly codigoOrden: string;
    readonly mesaONombreCliente: string;
    readonly lineas: readonly LineaOrdenConfirmada[];
    readonly subtotalUSD: number;
    readonly impuestoUSD: number;
    readonly propinaUSD: number;
    readonly totalFinalUSD: number;
    readonly tiempoMaximoCocinaMin: number;
    readonly caloriasTotalesOrden: number;
}

export type ResultadoOperacion<T> =
    | { readonly ok: true; readonly valor: T }
    | { readonly ok: false; readonly errores: readonly string[] };

export interface ResumenCategoriaMenu {
    readonly totalPlatillos: number;
    readonly disponiblesCount: number;
    readonly precioPromedioUSD: number;
    readonly ingresosGeneradosUSD: number;
}

export interface ReporteMenuInteractivo {
    readonly reporteId: string;
    readonly nombreRestaurante: string;
    readonly totalPlatillosCatalogo: number;
    readonly platillosDisponiblesCount: number;
    readonly totalOrdenesProcesadas: number;
    readonly ingresosTotalesUSD: number;
    readonly ticketPromedioOrdenUSD: number;
    readonly platilloMasVendido: PlatilloDominio | null;
    readonly platilloMenorCalorias: PlatilloDominio | null;
    readonly desglosePorCategoria: Readonly<Record<CategoriaMenu, ResumenCategoriaMenu>>;
    readonly catalogoActual: readonly PlatilloDominio[];
    readonly ordenesConfirmadas: readonly OrdenProcesadaDominio[];
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

    public filtrar(predicado: (item: T) => boolean): readonly T[] {
        return Array.from(this.registros.values()).filter(predicado);
    }

    public obtenerTodos(): readonly T[] {
        return Array.from(this.registros.values());
    }

    public contar(): number {
        return this.registros.size;
    }
}

// 3. VALIDACIONES Y TRANSFORMACIONES DE DTO <-> DOMINIO

const CATEGORIAS_MENU: readonly CategoriaMenu[] = [
    'Entradas',
    'PlatosFuertes',
    'HamburguesasYWraps',
    'Postres',
    'BebidasArtesanales'
];

export function calcularPrecioFinal(precioBaseUSD: number, porcentajeDescuento: number): number {
    const factor = 1 - porcentajeDescuento / 100;
    return Number((precioBaseUSD * factor).toFixed(2));
}

export function validarCrearPlatilloDTO(
    dto: CrearPlatilloDTO
): ResultadoOperacion<CrearPlatilloDTO> {
    const errores: string[] = [];

    if (dto.sku.trim().length < 3) {
        errores.push(`SKU inválido ("${dto.sku}"): debe contener al menos 3 caracteres.`);
    }

    if (dto.nombre.trim().length < 2) {
        errores.push(`El nombre del platillo ("${dto.nombre}") es obligatorio.`);
    }

    if (dto.precioBaseUSD <= 0 || dto.precioBaseUSD > 500) {
        errores.push(
            `Precio base fuera de rango ($${dto.precioBaseUSD}) en "${dto.nombre}" (${dto.sku}).`
        );
    }

    const descuento = dto.porcentajeDescuento ?? 0;
    if (descuento < 0 || descuento > 80) {
        errores.push(
            `Porcentaje de descuento no permitido (${descuento}%) en "${dto.nombre}" (${dto.sku}).`
        );
    }

    if (dto.caloriasKcal < 0 || dto.caloriasKcal > 5000) {
        errores.push(
            `Valor calórico inválido (${dto.caloriasKcal} kcal) en "${dto.nombre}".`
        );
    }

    if (dto.tiempoPreparacionMin <= 0 || dto.tiempoPreparacionMin > 120) {
        errores.push(
            `Tiempo de preparación fuera de rango (${dto.tiempoPreparacionMin} min) en "${dto.nombre}".`
        );
    }

    return errores.length === 0
        ? { ok: true, valor: dto }
        : { ok: false, errores };
}

export function mapearPlatilloDTOADominio(
    dto: CrearPlatilloDTO,
    secuencia: number
): PlatilloDominio {
    const skuLimpio = dto.sku.trim().toUpperCase();
    const descuento = dto.porcentajeDescuento ?? 0;

    return {
        id: `plt-${skuLimpio}-${secuencia}`,
        sku: skuLimpio,
        nombre: dto.nombre.trim(),
        descripcion: dto.descripcion.trim(),
        categoria: dto.categoria,
        etiquetaDietetica: dto.etiquetaDietetica,
        precioBaseUSD: Number(dto.precioBaseUSD.toFixed(2)),
        porcentajeDescuento: descuento,
        precioFinalUSD: calcularPrecioFinal(dto.precioBaseUSD, descuento),
        caloriasKcal: dto.caloriasKcal,
        tiempoPreparacionMin: dto.tiempoPreparacionMin,
        estado: dto.disponibleInicial === false ? 'AgotadoTemporalmente' : 'Disponible',
        unidadesVendidas: 0
    };
}

export function esCompatibleConDieta(
    etiquetaPlatillo: EtiquetaDietetica,
    filtroCliente: EtiquetaDietetica | 'Todas'
): boolean {
    if (filtroCliente === 'Todas') return true;
    if (filtroCliente === 'Vegetariano') {
        return etiquetaPlatillo === 'Vegetariano' || etiquetaPlatillo === 'Vegano';
    }
    return etiquetaPlatillo === filtroCliente;
}

// 4. GENERACIÓN DE REPORTES Y SERVICIO DE MENÚ INTERACTIVO

export function generarReporteMenu(
    nombreRestaurante: string,
    platillos: readonly PlatilloDominio[],
    ordenes: readonly OrdenProcesadaDominio[],
    advertencias: readonly string[]
): ReporteMenuInteractivo {
    const platillosDisponiblesCount = platillos.filter(
        (p) => p.estado === 'Disponible'
    ).length;

    const ingresosTotalesUSD = Number(
        ordenes.reduce((acc, ord) => acc + ord.totalFinalUSD, 0).toFixed(2)
    );

    const ticketPromedioOrdenUSD =
        ordenes.length > 0
            ? Number((ingresosTotalesUSD / ordenes.length).toFixed(2))
            : 0;

    const platilloMasVendido =
        [...platillos]
            .filter((p) => p.unidadesVendidas > 0)
            .sort((a, b) => b.unidadesVendidas - a.unidadesVendidas)[0] ?? null;

    const platilloMenorCalorias =
        [...platillos]
            .filter((p) => p.estado === 'Disponible' && p.caloriasKcal > 0)
            .sort((a, b) => a.caloriasKcal - b.caloriasKcal)[0] ?? null;

    const desglosePorCategoria = CATEGORIAS_MENU.reduce((acc, cat) => {
        const delGrupo = platillos.filter((p) => p.categoria === cat);
        const disponibles = delGrupo.filter((p) => p.estado === 'Disponible').length;
        const sumaPrecios = delGrupo.reduce((s, p) => s + p.precioFinalUSD, 0);
        const precioPromedioUSD =
            delGrupo.length > 0 ? Number((sumaPrecios / delGrupo.length).toFixed(2)) : 0;
        const ingresosGeneradosUSD = Number(
            delGrupo
                .reduce((s, p) => s + p.precioFinalUSD * p.unidadesVendidas, 0)
                .toFixed(2)
        );

        acc[cat] = {
            totalPlatillos: delGrupo.length,
            disponiblesCount: disponibles,
            precioPromedioUSD,
            ingresosGeneradosUSD
        };
        return acc;
    }, {} as Record<CategoriaMenu, ResumenCategoriaMenu>);

    return {
        reporteId: `REP-MENU-${Date.now()}`,
        nombreRestaurante,
        totalPlatillosCatalogo: platillos.length,
        platillosDisponiblesCount,
        totalOrdenesProcesadas: ordenes.length,
        ingresosTotalesUSD,
        ticketPromedioOrdenUSD,
        platilloMasVendido,
        platilloMenorCalorias,
        desglosePorCategoria,
        catalogoActual: platillos,
        ordenesConfirmadas: ordenes,
        advertencias
    };
}

export class ServicioMenuInteractivoComida {
    private readonly repoPlatillos = new RepositorioEnMemoria<PlatilloDominio>();
    private readonly repoOrdenes = new RepositorioEnMemoria<OrdenProcesadaDominio>();
    private readonly advertencias: string[] = [];
    private secuenciaPlatillo = 1;
    private secuenciaOrden = 1;

    constructor(private readonly nombreRestaurante: string) { }

    public registrarPlatillo(dto: CrearPlatilloDTO): ResultadoOperacion<PlatilloDominio> {
        const validacion = validarCrearPlatilloDTO(dto);
        if (!validacion.ok) {
            this.advertencias.push(...validacion.errores);
            return validacion;
        }

        const skuNormalizado = dto.sku.trim().toUpperCase();
        const existente = this.repoPlatillos.buscarUno((p) => p.sku === skuNormalizado);
        if (existente) {
            const msg = `SKU duplicado en menú: "${skuNormalizado}" ("${dto.nombre}") ya está registrado.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const dominio = mapearPlatilloDTOADominio(dto, this.secuenciaPlatillo++);
        this.repoPlatillos.guardar(dominio);
        return { ok: true, valor: dominio };
    }

    public actualizarEstadoPlatillo(
        sku: string,
        nuevoEstado: EstadoPlatillo
    ): ResultadoOperacion<PlatilloDominio> {
        const skuNormalizado = sku.trim().toUpperCase();
        const platillo = this.repoPlatillos.buscarUno((p) => p.sku === skuNormalizado);

        if (!platillo) {
            const msg = `No se encontró platillo con SKU "${skuNormalizado}" para cambiar estado.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const actualizado: PlatilloDominio = {
            ...platillo,
            estado: nuevoEstado
        };
        this.repoPlatillos.guardar(actualizado);
        return { ok: true, valor: actualizado };
    }

    public procesarOrdenInteractiva(
        dto: CrearOrdenMenuDTO
    ): ResultadoOperacion<OrdenProcesadaDominio> {
        const erroresOrden: string[] = [];

        if (dto.items.length === 0) {
            const msg = `La orden "${dto.codigoOrden}" no contiene platillos seleccionados.`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const propinaPct = dto.propinaPorcentaje ?? 10;
        if (propinaPct < 0 || propinaPct > 50) {
            const msg = `Porcentaje de propina fuera de rango (${propinaPct}%) en orden "${dto.codigoOrden}".`;
            this.advertencias.push(msg);
            return { ok: false, errores: [msg] };
        }

        const lineasConfirmadas: LineaOrdenConfirmada[] = [];
        const actualizacionesVentas: { platillo: PlatilloDominio; cantidad: number }[] = [];
        let caloriasTotalesOrden = 0;

        for (const item of dto.items) {
            if (item.cantidad <= 0 || item.cantidad > 20) {
                erroresOrden.push(
                    `Cantidad inválida (${item.cantidad}) para SKU "${item.sku}" en orden "${dto.codigoOrden}".`
                );
                continue;
            }

            const skuBuscado = item.sku.trim().toUpperCase();
            const platillo = this.repoPlatillos.buscarUno((p) => p.sku === skuBuscado);

            if (!platillo) {
                erroresOrden.push(
                    `Platillo inexistente "${skuBuscado}" solicitado en orden "${dto.codigoOrden}".`
                );
                continue;
            }

            if (platillo.estado !== 'Disponible') {
                erroresOrden.push(
                    `Platillo "${platillo.nombre}" (${platillo.sku}) no disponible (${platillo.estado}) en orden "${dto.codigoOrden}".`
                );
                continue;
            }

            if (!esCompatibleConDieta(platillo.etiquetaDietetica, dto.filtroDieteticoCliente)) {
                erroresOrden.push(
                    `Alerta dietética en "${dto.codigoOrden}": "${platillo.nombre}" (${platillo.etiquetaDietetica}) no cumple preferencia "${dto.filtroDieteticoCliente}".`
                );
                continue;
            }

            const subtotalLineaUSD = Number((platillo.precioFinalUSD * item.cantidad).toFixed(2));
            lineasConfirmadas.push({
                sku: platillo.sku,
                nombrePlatillo: platillo.nombre,
                cantidad: item.cantidad,
                precioUnitarioUSD: platillo.precioFinalUSD,
                subtotalLineaUSD,
                tiempoEstimadoMin: platillo.tiempoPreparacionMin
            });

            caloriasTotalesOrden += platillo.caloriasKcal * item.cantidad;
            actualizacionesVentas.push({ platillo, cantidad: item.cantidad });
        }

        if (erroresOrden.length > 0 || lineasConfirmadas.length === 0) {
            this.advertencias.push(...erroresOrden);
            return { ok: false, errores: erroresOrden };
        }

        // Actualizar contadores de ventas en el repositorio en memoria
        for (const act of actualizacionesVentas) {
            const actualEnRepo = this.repoPlatillos.obtenerPorId(act.platillo.id) ?? act.platillo;
            this.repoPlatillos.guardar({
                ...actualEnRepo,
                unidadesVendidas: actualEnRepo.unidadesVendidas + act.cantidad
            });
        }

        const subtotalUSD = Number(
            lineasConfirmadas.reduce((acc, l) => acc + l.subtotalLineaUSD, 0).toFixed(2)
        );
        const impuestoUSD = Number((subtotalUSD * 0.12).toFixed(2));
        const propinaUSD = Number((subtotalUSD * (propinaPct / 100)).toFixed(2));
        const totalFinalUSD = Number((subtotalUSD + impuestoUSD + propinaUSD).toFixed(2));
        const tiempoMaximoCocinaMin = Math.max(
            ...lineasConfirmadas.map((l) => l.tiempoEstimadoMin)
        );

        const ordenConfirmada: OrdenProcesadaDominio = {
            id: `ord-${dto.codigoOrden}-${this.secuenciaOrden++}`,
            codigoOrden: dto.codigoOrden,
            mesaONombreCliente: dto.mesaONombreCliente,
            lineas: lineasConfirmadas,
            subtotalUSD,
            impuestoUSD,
            propinaUSD,
            totalFinalUSD,
            tiempoMaximoCocinaMin,
            caloriasTotalesOrden
        };

        this.repoOrdenes.guardar(ordenConfirmada);
        return { ok: true, valor: ordenConfirmada };
    }

    public obtenerReporteFinal(): ReporteMenuInteractivo {
        return generarReporteMenu(
            this.nombreRestaurante,
            this.repoPlatillos.obtenerTodos(),
            this.repoOrdenes.obtenerTodos(),
            this.advertencias
        );
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarReporteMenuInteractivo(
    reporte: ReporteMenuInteractivo,
    tituloCaso: string
): void {
    console.log(`\n======================================================================`);
    console.log(` MENÚ INTERACTIVO DE COMIDA - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Restaurante         : ${reporte.nombreRestaurante}`);
    console.log(`Reporte ID          : ${reporte.reporteId}`);
    console.log(`Catálogo Platillos  : ${reporte.totalPlatillosCatalogo} (${reporte.platillosDisponiblesCount} disponibles)`);
    console.log(`Órdenes Procesadas  : ${reporte.totalOrdenesProcesadas}`);
    console.log(`Ingresos Totales    : $${reporte.ingresosTotalesUSD.toFixed(2)} USD (Ticket Prom: $${reporte.ticketPromedioOrdenUSD.toFixed(2)} USD)`);
    console.log(`Platillo Estrella   : ${reporte.platilloMasVendido ? `"${reporte.platilloMasVendido.nombre}" (${reporte.platilloMasVendido.unidadesVendidas} uds)` : 'N/A'}`);
    console.log(`Opción Más Ligera   : ${reporte.platilloMenorCalorias ? `"${reporte.platilloMenorCalorias.nombre}" (${reporte.platilloMenorCalorias.caloriasKcal} kcal)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (reporte.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y VALIDACIONES DE COCINA/MENÚ (${reporte.advertencias.length}):`);
        reporte.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`RESUMEN POR CATEGORÍA DEL MENÚ:`);
    Object.entries(reporte.desglosePorCategoria).forEach(([cat, info]) => {
        console.log(
            `   - ${cat.padEnd(20)}: ${info.totalPlatillos} platillos | Prom: $${info.precioPromedioUSD.toFixed(2)} | Ingresos: $${info.ingresosGeneradosUSD.toFixed(2)}`
        );
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        reporte.catalogoActual.map((p) => ({
            SKU: p.sku,
            Platillo: p.nombre,
            Categoría: p.categoria,
            Dieta: p.etiquetaDietetica,
            'Precio Final': `$${p.precioFinalUSD.toFixed(2)}${p.porcentajeDescuento > 0 ? ` (-${p.porcentajeDescuento}%)` : ''}`,
            Calorías: `${p.caloriasKcal} kcal`,
            Estado: p.estado,
            Vendidos: p.unidadesVendidas
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

async function ejecutarPruebas(): Promise<void> {
    // Simulación de latencia de carga de menú digital en mesa
    await new Promise((resolve) => setTimeout(resolve, 10));

    // --- CASO 1: Servicio en Restaurante con Descuentos y Órdenes Múltiples (Caso Normal) ---
    const servicioNormal = new ServicioMenuInteractivoComida('Bistró Tech & Grill');

    servicioNormal.registrarPlatillo({
        sku: 'ENT-001',
        nombre: 'Carpaccio de Portobello Trufado',
        descripcion: 'Láminas de hongos portobello con aceite de trufa blanca y rúcula',
        categoria: 'Entradas',
        etiquetaDietetica: 'Vegano',
        precioBaseUSD: 11.5,
        caloriasKcal: 240,
        tiempoPreparacionMin: 10
    });

    servicioNormal.registrarPlatillo({
        sku: 'BUR-002',
        nombre: 'Smash Burger Doble Wagyu',
        descripcion: 'Doble carne Wagyu, queso cheddar madurado y salsa secreta de la casa',
        categoria: 'HamburguesasYWraps',
        etiquetaDietetica: 'Estandar',
        precioBaseUSD: 18.0,
        porcentajeDescuento: 10,
        caloriasKcal: 890,
        tiempoPreparacionMin: 16
    });

    servicioNormal.registrarPlatillo({
        sku: 'PLT-003',
        nombre: 'Salmón Glaseado al Miso',
        descripcion: 'Filete de salmón sellado con vegetales salteados al wok',
        categoria: 'PlatosFuertes',
        etiquetaDietetica: 'SinGluten',
        precioBaseUSD: 22.5,
        caloriasKcal: 610,
        tiempoPreparacionMin: 20
    });

    servicioNormal.registrarPlatillo({
        sku: 'BEB-004',
        nombre: 'Limonada de Hierbabuena y Jengibre',
        descripcion: 'Infusión fría natural sin azúcar refinada',
        categoria: 'BebidasArtesanales',
        etiquetaDietetica: 'Vegano',
        precioBaseUSD: 4.5,
        caloriasKcal: 75,
        tiempoPreparacionMin: 4
    });

    servicioNormal.procesarOrdenInteractiva({
        codigoOrden: 'ORD-MESA-04',
        mesaONombreCliente: 'Mesa 4 - José Rodríguez',
        filtroDieteticoCliente: 'Todas',
        items: [
            { sku: 'ENT-001', cantidad: 1 },
            { sku: 'BUR-002', cantidad: 2, notaCocina: 'Término medio' },
            { sku: 'BEB-004', cantidad: 2 }
        ],
        propinaPorcentaje: 15
    });

    servicioNormal.procesarOrdenInteractiva({
        codigoOrden: 'ORD-MESA-09',
        mesaONombreCliente: 'Mesa 9 - Clienta Vegana',
        filtroDieteticoCliente: 'Vegano',
        items: [
            { sku: 'ENT-001', cantidad: 2 },
            { sku: 'BEB-004', cantidad: 2 }
        ],
        propinaPorcentaje: 10
    });

    const reporteNormal = servicioNormal.obtenerReporteFinal();
    mostrarReporteMenuInteractivo(reporteNormal, 'Caso Normal - Operación de Salón y Órdenes Digitales');

    // --- CASO 2: Platillo Agotado, Incompatibilidad Dietética, SKU Duplicado y DTO Inválido (Caso Límite) ---
    const servicioLimite = new ServicioMenuInteractivoComida('Bistró Tech & Grill (Auditoría)');

    servicioLimite.registrarPlatillo({
        sku: 'PLT-010',
        nombre: 'Costillas BBQ Ahumadas',
        descripcion: 'Costillar de cerdo ahumado por 8 horas en leña de nogal',
        categoria: 'PlatosFuertes',
        etiquetaDietetica: 'Estandar',
        precioBaseUSD: 24.0,
        caloriasKcal: 1150,
        tiempoPreparacionMin: 25
    });

    servicioLimite.registrarPlatillo({
        sku: 'POS-011',
        nombre: 'Volcán de Chocolate 70%',
        descripcion: 'Bizcocho tibio con centro líquido y helado artesanal',
        categoria: 'Postres',
        etiquetaDietetica: 'Vegetariano',
        precioBaseUSD: 9.0,
        caloriasKcal: 540,
        tiempoPreparacionMin: 14
    });

    // Marcamos el postre como agotado temporalmente
    servicioLimite.actualizarEstadoPlatillo('POS-011', 'AgotadoTemporalmente');

    // Intento de registrar SKU duplicado
    servicioLimite.registrarPlatillo({
        sku: 'PLT-010',
        nombre: 'Costillas BBQ Duplicadas',
        descripcion: 'Duplicado',
        categoria: 'PlatosFuertes',
        etiquetaDietetica: 'Estandar',
        precioBaseUSD: 24.0,
        caloriasKcal: 1150,
        tiempoPreparacionMin: 25
    });

    // Intento de registrar DTO con múltiples valores corruptos
    servicioLimite.registrarPlatillo({
        sku: 'X',
        nombre: '',
        descripcion: 'Sin datos',
        categoria: 'Entradas',
        etiquetaDietetica: 'Picante',
        precioBaseUSD: -15,
        porcentajeDescuento: 95,
        caloriasKcal: -200,
        tiempoPreparacionMin: 0
    });

    // Intento de ordenar platillo incompatible con dieta Vegana y platillo agotado
    servicioLimite.procesarOrdenInteractiva({
        codigoOrden: 'ORD-ERR-01',
        mesaONombreCliente: 'Mesa 2 - Pedido Conflictivo',
        filtroDieteticoCliente: 'Vegano',
        items: [
            { sku: 'PLT-010', cantidad: 1 }, // Incompatible con filtro Vegano
            { sku: 'POS-011', cantidad: 1 }, // AgotadoTemporalmente
            { sku: 'SKU-NO-EXISTE', cantidad: 2 } // Inexistente
        ]
    });

    const reporteLimite = servicioLimite.obtenerReporteFinal();
    mostrarReporteMenuInteractivo(reporteLimite, 'Caso Límite - Conflictos Dietéticos, Agotados y DTO Corrupto');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecución:', err));