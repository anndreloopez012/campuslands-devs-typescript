
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type CategoriaComida =
    | 'Hamburguesas'
    | 'Tacos'
    | 'Bebidas'
    | 'Postres'
    | 'Acompanamientos';

export type EstadoPedido = 'Pendiente' | 'EnPreparacion' | 'Entregado' | 'Cancelado';
export type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Transferencia';

export interface ItemMenu {
    readonly id: string;
    readonly nombre: string;
    readonly categoria: CategoriaComida;
    readonly precioUnitarioUSD: number;
}

export interface DetalleItemPedido {
    readonly item: ItemMenu;
    readonly cantidad: number;
    readonly notasEspeciales?: string;
}

export interface PedidoFoodTruck {
    readonly id: string;
    readonly clienteNombre: string;
    readonly estado: EstadoPedido;
    readonly metodoPago: MetodoPago;
    readonly items: readonly DetalleItemPedido[];
    readonly propinaUSD: number;
    readonly descuentoPct: number;
}

export interface MetricasPedidos {
    readonly totalPedidos: number;
    readonly totalPedidosEntregados: number;
    readonly ingresosTotalesUSD: number;
    readonly ticketPromedioUSD: number;
    readonly propinasTotalesUSD: number;
    readonly itemMasVendido: { readonly nombre: string; readonly cantidadTotal: number } | null;
    readonly desglosePorCategoria: Readonly<Record<CategoriaComida, number>>;
}

export interface ResumenPedidosFoodTruck {
    readonly totalPedidosValidos: number;
    readonly metricas: MetricasPedidos;
    readonly pedidosProcesados: readonly PedidoFoodTruck[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarDetalleItem(detalle: DetalleItemPedido): ResultadoValidacion<DetalleItemPedido> {
    const errores: string[] = [];

    if (detalle.cantidad <= 0) {
        errores.push(`Cantidad invalida (${detalle.cantidad}) para el item "${detalle.item.nombre}".`);
    }

    if (detalle.item.precioUnitarioUSD <= 0) {
        errores.push(`Precio unitario invalido ($${detalle.item.precioUnitarioUSD}) para "${detalle.item.nombre}".`);
    }

    if (detalle.item.nombre.trim().length === 0) {
        errores.push('El nombre del item de comida no puede estar vacio.');
    }

    return errores.length === 0
        ? { esValido: true, datos: detalle }
        : { esValido: false, errores };
}

export function validarPedidoFoodTruck(pedido: PedidoFoodTruck): readonly string[] {
    const advertencias: string[] = [];

    if (pedido.clienteNombre.trim().length === 0) {
        advertencias.push(`El pedido ${pedido.id} debe incluir el nombre del cliente.`);
    }

    if (pedido.items.length === 0) {
        advertencias.push(`El pedido ${pedido.id} no contiene items de comida registrados.`);
    }

    if (pedido.propinaUSD < 0) {
        advertencias.push(`Monto de propina negativo ($${pedido.propinaUSD}) en el pedido ${pedido.id}.`);
    }

    if (pedido.descuentoPct < 0 || pedido.descuentoPct > 100) {
        advertencias.push(`Porcentaje de descuento fuera de rango (${pedido.descuentoPct}%) en el pedido ${pedido.id}.`);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS FINANCIEROS Y DE VENTAS

const CATEGORIAS_COMIDA: readonly CategoriaComida[] = [
    'Hamburguesas',
    'Tacos',
    'Bebidas',
    'Postres',
    'Acompanamientos'
];

export function calcularSubtotalPedido(items: readonly DetalleItemPedido[]): number {
    return Number(
        items.reduce((acc, d) => acc + d.item.precioUnitarioUSD * d.cantidad, 0).toFixed(2)
    );
}

export function calcularTotalPedido(pedido: PedidoFoodTruck): number {
    const subtotal = calcularSubtotalPedido(pedido.items);
    const descuento = (subtotal * Math.max(0, Math.min(100, pedido.descuentoPct))) / 100;
    const totalSinPropina = subtotal - descuento;
    return Number((totalSinPropina + Math.max(0, pedido.propinaUSD)).toFixed(2));
}

export function calcularMetricasPedidos(pedidos: readonly PedidoFoodTruck[]): MetricasPedidos {
    if (pedidos.length === 0) {
        const desgloseVacio = CATEGORIAS_COMIDA.reduce((acc, cat) => {
            acc[cat] = 0;
            return acc;
        }, {} as Record<CategoriaComida, number>);

        return {
            totalPedidos: 0,
            totalPedidosEntregados: 0,
            ingresosTotalesUSD: 0,
            ticketPromedioUSD: 0,
            propinasTotalesUSD: 0,
            itemMasVendido: null,
            desglosePorCategoria: desgloseVacio
        };
    }

    const pedidosEntregados = pedidos.filter((p) => p.estado === 'Entregado');
    const totalPedidosEntregados = pedidosEntregados.length;

    const ingresosTotalesUSD = Number(
        pedidosEntregados.reduce((acc, p) => acc + calcularTotalPedido(p), 0).toFixed(2)
    );

    const ticketPromedioUSD = totalPedidosEntregados > 0
        ? Number((ingresosTotalesUSD / totalPedidosEntregados).toFixed(2))
        : 0;

    const propinasTotalesUSD = Number(
        pedidosEntregados.reduce((acc, p) => acc + Math.max(0, p.propinaUSD), 0).toFixed(2)
    );

    // Conteo de cantidades por item e identificacion del mas vendido
    const mapaConteoItems = new Map<string, number>();
    pedidosEntregados.forEach((p) => {
        p.items.forEach((d) => {
            const actual = mapaConteoItems.get(d.item.nombre) ?? 0;
            mapaConteoItems.set(d.item.nombre, actual + d.cantidad);
        });
    });

    let itemMasVendido: { nombre: string; cantidadTotal: number } | null = null;
    let maxCantidad = 0;
    mapaConteoItems.forEach((cantidad, nombre) => {
        if (cantidad > maxCantidad) {
            maxCantidad = cantidad;
            itemMasVendido = { nombre, cantidadTotal: cantidad };
        }
    });

    // Desglose de unidades vendidas por categoría de comida
    const desglosePorCategoria = pedidosEntregados.reduce((acc, p) => {
        p.items.forEach((d) => {
            acc[d.item.categoria] = (acc[d.item.categoria] ?? 0) + d.cantidad;
        });
        return acc;
    }, CATEGORIAS_COMIDA.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {} as Record<CategoriaComida, number>));

    return {
        totalPedidos: pedidos.length,
        totalPedidosEntregados,
        ingresosTotalesUSD,
        ticketPromedioUSD,
        propinasTotalesUSD,
        itemMasVendido,
        desglosePorCategoria
    };
}

export function procesarPedidosFoodTruck(pedidosRaw: readonly PedidoFoodTruck[]): ResumenPedidosFoodTruck {
    const advertencias: string[] = [];
    const pedidosValidos: PedidoFoodTruck[] = [];

    for (const raw of pedidosRaw) {
        const advPedido = validarPedidoFoodTruck(raw);
        advertencias.push(...advPedido);

        let itemsValidos = true;
        for (const d of raw.items) {
            const resItem = validarDetalleItem(d);
            if (!resItem.esValido) {
                itemsValidos = false;
                advertencias.push(...resItem.errores.map((err) => `Pedido ${raw.id}: ${err}`));
            }
        }

        if (advPedido.length === 0 && itemsValidos) {
            pedidosValidos.push(raw);
        }
    }

    const metricas = calcularMetricasPedidos(pedidosValidos);

    return {
        totalPedidosValidos: pedidosValidos.length,
        metricas,
        pedidosProcesados: pedidosValidos,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenFoodTruck(resumen: ResumenPedidosFoodTruck, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` PEDIDOS DE FOOD TRUCK - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Pedidos Validados   : ${resumen.totalPedidosValidos}`);
    console.log(`Pedidos Entregados  : ${resumen.metricas.totalPedidosEntregados}`);
    console.log(`Ingresos Totales    : $${resumen.metricas.ingresosTotalesUSD.toLocaleString()} USD`);
    console.log(`Ticket Promedio     : $${resumen.metricas.ticketPromedioUSD} USD`);
    console.log(`Propinas Recaudadas : $${resumen.metricas.propinasTotalesUSD} USD`);
    console.log(`Item Mas Vendido    : ${resumen.metricas.itemMasVendido ? `${resumen.metricas.itemMasVendido.nombre} (${resumen.metricas.itemMasVendido.cantidadTotal} unidades)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE PEDIDOS (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE UNIDADES POR CATEGORIA:`);
    Object.entries(resumen.metricas.desglosePorCategoria).forEach(([categoria, cantidad]) => {
        console.log(`   - ${categoria.padEnd(18)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.pedidosProcesados.map((p) => ({
            ID: p.id,
            Cliente: p.clienteNombre,
            Estado: p.estado,
            Pago: p.metodoPago,
            Items: p.items.length,
            Subtotal: `$${calcularSubtotalPedido(p.items)}`,
            Descuento: `${p.descuentoPct}%`,
            Propina: `$${p.propinaUSD}`,
            Total: `$${calcularTotalPedido(p)}`
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const burgerDoble: ItemMenu = { id: 'it-01', nombre: 'Smash Burger Doble', categoria: 'Hamburguesas', precioUnitarioUSD: 10.5 };
const tacosPastor: ItemMenu = { id: 'it-02', nombre: 'Orden Tacos al Pastor', categoria: 'Tacos', precioUnitarioUSD: 8.0 };
const papasTruffle: ItemMenu = { id: 'it-03', nombre: 'Papas Trufadas', categoria: 'Acompanamientos', precioUnitarioUSD: 4.5 };
const horchata: ItemMenu = { id: 'it-04', nombre: 'Agua de Horchata Grande', categoria: 'Bebidas', precioUnitarioUSD: 3.0 };

// --- CASO 1: Turno Nocturno de Pedidos (Caso Normal) ---
const pedidosNormales: readonly PedidoFoodTruck[] = [
    {
        id: 'ORD-FT-001',
        clienteNombre: 'Sofia Lopez',
        estado: 'Entregado',
        metodoPago: 'Tarjeta',
        items: [
            { item: burgerDoble, cantidad: 2, notasEspeciales: 'Sin cebolla' },
            { item: papasTruffle, cantidad: 1 },
            { item: horchata, cantidad: 2 }
        ],
        propinaUSD: 3.0,
        descuentoPct: 0
    },
    {
        id: 'ORD-FT-002',
        clienteNombre: 'Diego Martinez',
        estado: 'Entregado',
        metodoPago: 'Efectivo',
        items: [
            { item: tacosPastor, cantidad: 3 },
            { item: horchata, cantidad: 1 }
        ],
        propinaUSD: 2.0,
        descuentoPct: 10 // 10% de descuento de promocion
    },
    {
        id: 'ORD-FT-003',
        clienteNombre: 'Elena Torres',
        estado: 'EnPreparacion',
        metodoPago: 'Transferencia',
        items: [
            { item: burgerDoble, cantidad: 1 },
            { item: papasTruffle, cantidad: 1 }
        ],
        propinaUSD: 1.5,
        descuentoPct: 0
    }
];

// --- CASO 2: Cliente Vacio, Cantidad Negativa e Items Corruptos (Caso Límite) ---
const pedidosLimiteCorruptos: readonly PedidoFoodTruck[] = [
    {
        id: 'ORD-FT-004',
        clienteNombre: '', // Nombre vacio -> Invalido
        estado: 'Pendiente',
        metodoPago: 'Efectivo',
        items: [
            { item: burgerDoble, cantidad: 1 }
        ],
        propinaUSD: 0,
        descuentoPct: 0
    },
    {
        id: 'ORD-FT-005',
        clienteNombre: 'Cliente Error',
        estado: 'Entregado',
        metodoPago: 'Tarjeta',
        items: [
            { item: burgerDoble, cantidad: -2 } // Cantidad negativa -> Invalido
        ],
        propinaUSD: -5.0, // Propina negativa -> Advertencia
        descuentoPct: 150 // Descuento fuera de rango -> Advertencia
    }
];

// Ejecución
const resumenNormal = procesarPedidosFoodTruck(pedidosNormales);
mostrarResumenFoodTruck(resumenNormal, 'Caso Normal - Ventas de Turno Nocturno');

const resumenLimite = procesarPedidosFoodTruck(pedidosLimiteCorruptos);
mostrarResumenFoodTruck(resumenLimite, 'Caso Limite - Registros Incompletos y Cantidades Negativas');