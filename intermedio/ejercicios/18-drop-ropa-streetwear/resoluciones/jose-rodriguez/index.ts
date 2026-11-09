
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type CategoriaPrenda =
    | 'Hoodie'
    | 'TShirt'
    | 'Pants'
    | 'Sneakers'
    | 'Accessory'
    | 'Jacket';

export type TallaPrenda = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Unique';
export type EstadoDrop = 'Programado' | 'Activo' | 'Agotado' | 'Finalizado';

export interface InventarioTalla {
    readonly talla: TallaPrenda;
    readonly stockInicial: number;
    readonly unidadesVendidas: number;
}

export interface PrendaStreetwear {
    readonly id: string;
    readonly nombre: string;
    readonly categoria: CategoriaPrenda;
    readonly precioUSD: number;
    readonly costoProduccionUSD: number;
    readonly edicionLimitada: boolean;
    readonly inventarioTallas: readonly InventarioTalla[];
}

export interface DropStreetwear {
    readonly id: string;
    readonly nombreColeccion: string;
    readonly marca: string;
    readonly fechaLanzamiento: string;
    readonly estado: EstadoDrop;
    readonly prendas: readonly PrendaStreetwear[];
}

export interface MetricasDrop {
    readonly totalPrendas: number;
    readonly totalUnidadesStockInicial: number;
    readonly totalUnidadesVendidas: number;
    readonly porcentajeVentaAgotada: number;
    readonly ingresosTotalesUSD: number;
    readonly costoTotalProduccionUSD: number;
    readonly gananciaNetaUSD: number;
    readonly margenGananciaPct: number;
    readonly prendaMasVendida: { readonly nombre: string; readonly unidadesVendidas: number } | null;
    readonly desglosePorCategoria: Readonly<Record<CategoriaPrenda, number>>;
}

export interface ResumenDropStreetwear {
    readonly dropId: string;
    readonly nombreColeccion: string;
    readonly marca: string;
    readonly totalPrendasValidas: number;
    readonly metricas: MetricasDrop;
    readonly prendasProcesadas: readonly PrendaStreetwear[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarInventarioTalla(inv: InventarioTalla): ResultadoValidacion<InventarioTalla> {
    const errores: string[] = [];

    if (inv.stockInicial < 0) {
        errores.push(`El stock inicial para la talla ${inv.talla} no puede ser negativo (${inv.stockInicial}).`);
    }

    if (inv.unidadesVendidas < 0) {
        errores.push(`Las unidades vendidas para la talla ${inv.talla} no pueden ser negativas (${inv.unidadesVendidas}).`);
    }

    if (inv.unidadesVendidas > inv.stockInicial) {
        errores.push(`Incoherencia de stock en talla ${inv.talla}: Unidades vendidas (${inv.unidadesVendidas}) superan al stock inicial (${inv.stockInicial}).`);
    }

    return errores.length === 0
        ? { esValido: true, datos: inv }
        : { esValido: false, errores };
}

export function validarPrendaStreetwear(prenda: PrendaStreetwear): readonly string[] {
    const errores: string[] = [];

    if (prenda.precioUSD <= 0) {
        errores.push(`El precio de venta de "${prenda.nombre}" debe ser mayor a 0 USD ($${prenda.precioUSD}).`);
    }

    if (prenda.costoProduccionUSD <= 0) {
        errores.push(`El costo de produccion de "${prenda.nombre}" debe ser mayor a 0 USD ($${prenda.costoProduccionUSD}).`);
    }

    if (prenda.nombre.trim().length === 0) {
        errores.push('La prenda debe registrar un nombre valido.');
    }

    if (prenda.inventarioTallas.length === 0) {
        errores.push(`La prenda "${prenda.nombre}" no contiene inventario por talla registrado.`);
    }

    return errores;
}

export function validarDropStreetwear(drop: DropStreetwear): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();

    if (drop.prendas.length === 0) {
        advertencias.push(`El drop "${drop.nombreColeccion}" no contiene prendas asignadas.`);
    }

    for (const prenda of drop.prendas) {
        if (idsVistos.has(prenda.id)) {
            advertencias.push(`Prenda duplicada detectada en la coleccion: "${prenda.nombre}" (ID: ${prenda.id}).`);
        }
        idsVistos.add(prenda.id);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS DE DROPS Y FINANZAS

const CATEGORIAS_PRENDA: readonly CategoriaPrenda[] = [
    'Hoodie',
    'TShirt',
    'Pants',
    'Sneakers',
    'Accessory',
    'Jacket'
];

export function calcularMetricasDrop(prendas: readonly PrendaStreetwear[]): MetricasDrop {
    if (prendas.length === 0) {
        const desgloseVacio = CATEGORIAS_PRENDA.reduce((acc, cat) => {
            acc[cat] = 0;
            return acc;
        }, {} as Record<CategoriaPrenda, number>);

        return {
            totalPrendas: 0,
            totalUnidadesStockInicial: 0,
            totalUnidadesVendidas: 0,
            porcentajeVentaAgotada: 0,
            ingresosTotalesUSD: 0,
            costoTotalProduccionUSD: 0,
            gananciaNetaUSD: 0,
            margenGananciaPct: 0,
            prendaMasVendida: null,
            desglosePorCategoria: desgloseVacio
        };
    }

    let totalUnidadesStockInicial = 0;
    let totalUnidadesVendidas = 0;
    let ingresosTotalesUSD = 0;
    let costoTotalProduccionUSD = 0;

    let maxVendidasPrenda = 0;
    let prendaMasVendida: { nombre: string; unidadesVendidas: number } | null = null;

    for (const prenda of prendas) {
        const stockPrenda = prenda.inventarioTallas.reduce((acc, t) => acc + t.stockInicial, 0);
        const ventasPrenda = prenda.inventarioTallas.reduce((acc, t) => acc + t.unidadesVendidas, 0);

        totalUnidadesStockInicial += stockPrenda;
        totalUnidadesVendidas += ventasPrenda;

        ingresosTotalesUSD += ventasPrenda * prenda.precioUSD;
        costoTotalProduccionUSD += stockPrenda * prenda.costoProduccionUSD;

        if (ventasPrenda > maxVendidasPrenda) {
            maxVendidasPrenda = ventasPrenda;
            prendaMasVendida = { nombre: prenda.nombre, unidadesVendidas: ventasPrenda };
        }
    }

    ingresosTotalesUSD = Number(ingresosTotalesUSD.toFixed(2));
    costoTotalProduccionUSD = Number(costoTotalProduccionUSD.toFixed(2));

    const gananciaNetaUSD = Number((ingresosTotalesUSD - costoTotalProduccionUSD).toFixed(2));

    const porcentajeVentaAgotada = totalUnidadesStockInicial > 0
        ? Number(((totalUnidadesVendidas / totalUnidadesStockInicial) * 100).toFixed(1))
        : 0;

    const margenGananciaPct = ingresosTotalesUSD > 0
        ? Number(((gananciaNetaUSD / ingresosTotalesUSD) * 100).toFixed(1))
        : 0;

    const desglosePorCategoria = prendas.reduce((acc, p) => {
        acc[p.categoria] = (acc[p.categoria] ?? 0) + 1;
        return acc;
    }, CATEGORIAS_PRENDA.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {} as Record<CategoriaPrenda, number>));

    return {
        totalPrendas: prendas.length,
        totalUnidadesStockInicial,
        totalUnidadesVendidas,
        porcentajeVentaAgotada,
        ingresosTotalesUSD,
        costoTotalProduccionUSD,
        gananciaNetaUSD,
        margenGananciaPct,
        prendaMasVendida,
        desglosePorCategoria
    };
}

export function procesarDropStreetwear(dropRaw: DropStreetwear): ResumenDropStreetwear {
    const advertencias: string[] = [...validarDropStreetwear(dropRaw)];
    const prendasValidas: PrendaStreetwear[] = [];

    for (const raw of dropRaw.prendas) {
        const erroresPrenda = validarPrendaStreetwear(raw);
        advertencias.push(...erroresPrenda.map((err) => `Drop ${dropRaw.id}: ${err}`));

        let inventarioValido = true;
        for (const inv of raw.inventarioTallas) {
            const resInv = validarInventarioTalla(inv);
            if (!resInv.esValido) {
                inventarioValido = false;
                advertencias.push(...resInv.errores.map((err) => `${raw.nombre}: ${err}`));
            }
        }

        if (erroresPrenda.length === 0 && inventarioValido) {
            prendasValidas.push(raw);
        }
    }

    const metricas = calcularMetricasDrop(prendasValidas);

    return {
        dropId: dropRaw.id,
        nombreColeccion: dropRaw.nombreColeccion,
        marca: dropRaw.marca,
        totalPrendasValidas: prendasValidas.length,
        metricas,
        prendasProcesadas: prendasValidas,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenDrop(resumen: ResumenDropStreetwear, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` DROP DE ROPA STREETWEAR - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Coleccion           : ${resumen.nombreColeccion} (${resumen.marca})`);
    console.log(`Prendas Validadas   : ${resumen.totalPrendasValidas}`);
    console.log(`Stock Vendido       : ${resumen.metricas.totalUnidadesVendidas} / ${resumen.metricas.totalUnidadesStockInicial} unidades (${resumen.metricas.porcentajeVentaAgotada}%)`);
    console.log(`Ingresos Totales    : $${resumen.metricas.ingresosTotalesUSD.toLocaleString()} USD`);
    console.log(`Costo Produccion    : $${resumen.metricas.costoTotalProduccionUSD.toLocaleString()} USD`);
    console.log(`Ganancia Neta       : $${resumen.metricas.gananciaNetaUSD.toLocaleString()} USD (Margen: ${resumen.metricas.margenGananciaPct}%)`);
    console.log(`Prenda Mas Vendida  : ${resumen.metricas.prendaMasVendida ? `${resumen.metricas.prendaMasVendida.nombre} (${resumen.metricas.prendaMasVendida.unidadesVendidas} uds)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE INVENTARIO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE PRENDAS POR CATEGORIA:`);
    Object.entries(resumen.metricas.desglosePorCategoria).forEach(([categoria, cantidad]) => {
        console.log(`   - ${categoria.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.prendasProcesadas.map((p) => {
            const stockTotal = p.inventarioTallas.reduce((acc, t) => acc + t.stockInicial, 0);
            const ventasTotal = p.inventarioTallas.reduce((acc, t) => acc + t.unidadesVendidas, 0);
            return {
                ID: p.id,
                Nombre: p.nombre,
                Categoria: p.categoria,
                Precio: `$${p.precioUSD}`,
                Costo: `$${p.costoProduccionUSD}`,
                Edicion: p.edicionLimitada ? 'Limitada' : 'Standard',
                Stock: stockTotal,
                Vendidas: ventasTotal,
                VendidoPct: `${((ventasTotal / stockTotal) * 100).toFixed(0)}%`
            };
        })
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

// --- CASO 1: Drop Exclusivo de Temporada (Caso Normal) ---
const dropStreetwearNormal: DropStreetwear = {
    id: 'DROP-2026-FW',
    nombreColeccion: 'Cyberpunk Underground FW26',
    marca: 'Neo Tokyo Wear',
    fechaLanzamiento: '2026-11-01',
    estado: 'Activo',
    prendas: [
        {
            id: 'SW-001',
            nombre: 'Over-Sized Heavyweight Hoodie',
            categoria: 'Hoodie',
            precioUSD: 120.0,
            costoProduccionUSD: 35.0,
            edicionLimitada: true,
            inventarioTallas: [
                { talla: 'M', stockInicial: 50, unidadesVendidas: 48 },
                { talla: 'L', stockInicial: 60, unidadesVendidas: 60 },
                { talla: 'XL', stockInicial: 40, unidadesVendidas: 38 }
            ]
        },
        {
            id: 'SW-002',
            nombre: 'Acid Wash Graphic Tee',
            categoria: 'TShirt',
            precioUSD: 55.0,
            costoProduccionUSD: 14.0,
            edicionLimitada: false,
            inventarioTallas: [
                { talla: 'S', stockInicial: 30, unidadesVendidas: 25 },
                { talla: 'M', stockInicial: 80, unidadesVendidas: 75 },
                { talla: 'L', stockInicial: 80, unidadesVendidas: 80 }
            ]
        },
        {
            id: 'SW-003',
            nombre: 'Tactical Cargo Pants',
            categoria: 'Pants',
            precioUSD: 140.0,
            costoProduccionUSD: 42.0,
            edicionLimitada: true,
            inventarioTallas: [
                { talla: 'M', stockInicial: 40, unidadesVendidas: 35 },
                { talla: 'L', stockInicial: 40, unidadesVendidas: 39 }
            ]
        }
    ]
};

// --- CASO 2: Precios Inválidos, Stock Excedido y Prenda Duplicada (Caso Límite) ---
const dropStreetwearLimite: DropStreetwear = {
    id: 'DROP-FAIL-02',
    nombreColeccion: 'Drop Erroneo Test',
    marca: 'Fake Brand',
    fechaLanzamiento: '2026-11-05',
    estado: 'Programado',
    prendas: [
        {
            id: 'SW-004',
            nombre: 'Prenda Precio Negativo',
            categoria: 'Jacket',
            precioUSD: -20.0, // Precio negativo -> Invalido
            costoProduccionUSD: 10.0,
            edicionLimitada: false,
            inventarioTallas: [
                { talla: 'M', stockInicial: 20, unidadesVendidas: 5 }
            ]
        },
        {
            id: 'SW-005',
            nombre: 'Tee Stock Incoherente',
            categoria: 'TShirt',
            precioUSD: 45.0,
            costoProduccionUSD: 12.0,
            edicionLimitada: false,
            inventarioTallas: [
                { talla: 'L', stockInicial: 10, unidadesVendidas: 25 } // Vendidas > Stock -> Invalido
            ]
        },
        {
            id: 'SW-001', // ID Duplicado con SW-001
            nombre: 'Over-Sized Heavyweight Hoodie Copia',
            categoria: 'Hoodie',
            precioUSD: 120.0,
            costoProduccionUSD: 35.0,
            edicionLimitada: true,
            inventarioTallas: [
                { talla: 'M', stockInicial: 10, unidadesVendidas: 5 }
            ]
        }
    ]
};

// Ejecución
const resumenNormal = procesarDropStreetwear(dropStreetwearNormal);
mostrarResumenDrop(resumenNormal, 'Caso Normal - Cyberpunk Underground FW26');

const resumenLimite = procesarDropStreetwear(dropStreetwearLimite);
mostrarResumenDrop(resumenLimite, 'Caso Limite - Stock Incoherente y Prenda Duplicada');