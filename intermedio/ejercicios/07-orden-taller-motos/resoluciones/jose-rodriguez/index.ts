// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)
export type TipoServicio =
    | 'MantenimientoGeneral'
    | 'CambioAceite'
    | 'ReparacionMotor'
    | 'SistemaElectrico'
    | 'FrenosYSuspension';

export type EstadoOrden =
    | 'Ingresado'
    | 'EnDiagnostico'
    | 'EnReparacion'
    | 'Completado'
    | 'Entregado'
    | 'Cancelado';

export type CategoriaRepuesto =
    | 'FiltroAceite'
    | 'PastillasFreno'
    | 'Bujia'
    | 'CadenaTransmision'
    | 'AceiteSintetico'
    | 'Neumatico'
    | 'Bateria';

export interface RepuestoTaller {
    readonly id: string;
    readonly nombre: string;
    readonly categoria: CategoriaRepuesto;
    readonly precioUnitario: number;
    readonly cantidad: number;
}

export interface ServicioMecanico {
    readonly id: string;
    readonly descripcion: string;
    readonly tipo: TipoServicio;
    readonly horasEstimadas: number;
    readonly costoHoraManoObra: number;
}

export interface OrdenTaller {
    readonly id: string;
    readonly clienteNombre: string;
    readonly motoModelo: string;
    readonly placa: string;
    readonly kilometraje: number;
    readonly estado: EstadoOrden;
    readonly servicios: readonly ServicioMecanico[];
    readonly repuestos: readonly RepuestoTaller[];
    readonly descuentoPct: number; // Porcentaje de descuento (0 - 100)
    readonly aplicaIva: boolean;
}

export interface MetricasOrden {
    readonly subtotalServicios: number;
    readonly subtotalRepuestos: number;
    readonly subtotalGeneral: number;
    readonly montoDescuento: number;
    readonly montoIva: number;
    readonly costoTotal: number;
    readonly horasTotalesManoObra: number;
}

export interface ResumenOrdenTaller {
    readonly ordenId: string;
    readonly clienteNombre: string;
    readonly motoModelo: string;
    readonly placa: string;
    readonly estado: EstadoOrden;
    readonly totalServiciosValidos: number;
    readonly totalRepuestosValidos: number;
    readonly metricas: MetricasOrden;
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };
// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO
export function validarServicio(servicio: ServicioMecanico): ResultadoValidacion<ServicioMecanico> {
    const errores: string[] = [];

    if (servicio.horasEstimadas <= 0) {
        errores.push(`El servicio "${servicio.descripcion}" contiene horas estimadas invalidas (${servicio.horasEstimadas} h).`);
    }

    if (servicio.costoHoraManoObra <= 0) {
        errores.push(`El servicio "${servicio.descripcion}" tiene un costo por hora invalido (${servicio.costoHoraManoObra}).`);
    }

    return errores.length === 0
        ? { esValido: true, datos: servicio }
        : { esValido: false, errores };
}

export function validarRepuesto(repuesto: RepuestoTaller): ResultadoValidacion<RepuestoTaller> {
    const errores: string[] = [];

    if (repuesto.precioUnitario <= 0) {
        errores.push(`El repuesto "${repuesto.nombre}" tiene un precio unitario invalido (${repuesto.precioUnitario}).`);
    }

    if (repuesto.cantidad <= 0) {
        errores.push(`El repuesto "${repuesto.nombre}" requiere una cantidad mayor a 0.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: repuesto }
        : { esValido: false, errores };
}

export function validarOrden(orden: OrdenTaller): readonly string[] {
    const advertencias: string[] = [];

    if (orden.kilometraje < 0) {
        advertencias.push(`Kilometraje invalido para la moto ${orden.motoModelo} (${orden.kilometraje} km).`);
    }

    if (orden.descuentoPct < 0 || orden.descuentoPct > 100) {
        advertencias.push(`El porcentaje de descuento (${orden.descuentoPct}%) esta fuera del rango valido (0 - 100%).`);
    }

    if (orden.placa.trim().length === 0) {
        advertencias.push('La orden debe registrar una placa de identificacion valida.');
    }

    if (orden.servicios.length === 0 && orden.repuestos.length === 0) {
        advertencias.push('La orden de taller no contiene servicios ni repuestos asignados.');
    }

    return advertencias;
}
// 3. TRANSFORMACIÓN Y CÁLCULOS FINANCIEROS
const IVA_PORCENTAJE = 12; // 12% de IVA estandar

export function calcularMetricasOrden(
    servicios: readonly ServicioMecanico[],
    repuestos: readonly RepuestoTaller[],
    descuentoPct: number,
    aplicaIva: boolean
): MetricasOrden {
    const subtotalServicios = Number(
        servicios.reduce((acc, s) => acc + s.horasEstimadas * s.costoHoraManoObra, 0).toFixed(2)
    );

    const subtotalRepuestos = Number(
        repuestos.reduce((acc, r) => acc + r.precioUnitario * r.cantidad, 0).toFixed(2)
    );

    const subtotalGeneral = Number((subtotalServicios + subtotalRepuestos).toFixed(2));

    const porcentajeDescuentoValido = Math.max(0, Math.min(100, descuentoPct));
    const montoDescuento = Number(((subtotalGeneral * porcentajeDescuentoValido) / 100).toFixed(2));

    const baseImponible = subtotalGeneral - montoDescuento;
    const montoIva = aplicaIva ? Number(((baseImponible * IVA_PORCENTAJE) / 100).toFixed(2)) : 0;
    const costoTotal = Number((baseImponible + montoIva).toFixed(2));

    const horasTotalesManoObra = Number(
        servicios.reduce((acc, s) => acc + s.horasEstimadas, 0).toFixed(1)
    );

    return {
        subtotalServicios,
        subtotalRepuestos,
        subtotalGeneral,
        montoDescuento,
        montoIva,
        costoTotal,
        horasTotalesManoObra
    };
}

export function procesarOrdenTaller(ordenRaw: OrdenTaller): ResumenOrdenTaller {
    const advertencias: string[] = [...validarOrden(ordenRaw)];

    const serviciosValidos: ServicioMecanico[] = [];
    for (const s of ordenRaw.servicios) {
        const res = validarServicio(s);
        if (res.esValido) {
            serviciosValidos.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const repuestosValidos: RepuestoTaller[] = [];
    for (const r of ordenRaw.repuestos) {
        const res = validarRepuesto(r);
        if (res.esValido) {
            repuestosValidos.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const metricas = calcularMetricasOrden(
        serviciosValidos,
        repuestosValidos,
        ordenRaw.descuentoPct,
        ordenRaw.aplicaIva
    );

    return {
        ordenId: ordenRaw.id,
        clienteNombre: ordenRaw.clienteNombre,
        motoModelo: ordenRaw.motoModelo,
        placa: ordenRaw.placa,
        estado: ordenRaw.estado,
        totalServiciosValidos: serviciosValidos.length,
        totalRepuestosValidos: repuestosValidos.length,
        metricas,
        advertencias
    };
}
// 4. PRESENTACIÓN Y SALIDA POR CONSOLA
export function mostrarResumenOrden(resumen: ResumenOrdenTaller, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` ORDEN DE TALLER DE MOTOS - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`ID Orden            : ${resumen.ordenId}`);
    console.log(`Cliente             : ${resumen.clienteNombre}`);
    console.log(`Moto                : ${resumen.motoModelo} (Placa: ${resumen.placa})`);
    console.log(`Estado              : ${resumen.estado.toUpperCase()}`);
    console.log(`Mano de Obra Tot.   : ${resumen.metricas.horasTotalesManoObra} horas`);
    console.log(`----------------------------------------------------------------------`);
    console.log(`Subtotal Servicios  : $${resumen.metricas.subtotalServicios}`);
    console.log(`Subtotal Repuestos  : $${resumen.metricas.subtotalRepuestos}`);
    console.log(`Subtotal General    : $${resumen.metricas.subtotalGeneral}`);
    console.log(`Descuento Aplicado  : -$${resumen.metricas.montoDescuento}`);
    console.log(`IVA (${IVA_PORCENTAJE}%)           : +$${resumen.metricas.montoIva}`);
    console.log(`COSTO TOTAL FINAL   : $${resumen.metricas.costoTotal}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE ORDEN (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }
}
// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)
// --- CASO 1: Mantenimiento Mayor y Cambio de Frenos (Caso Normal) ---
const ordenMantenimientoNormal: OrdenTaller = {
    id: 'ORD-2026-089',
    clienteNombre: 'Carlos Mendoza',
    motoModelo: 'Kawasaki Z900',
    placa: 'M-4829XK',
    kilometraje: 24500,
    estado: 'EnReparacion',
    servicios: [
        {
            id: 'srv-01',
            descripcion: 'Mantenimiento General de 24k km',
            tipo: 'MantenimientoGeneral',
            horasEstimadas: 3.5,
            costoHoraManoObra: 25.0
        },
        {
            id: 'srv-02',
            descripcion: 'Sustitucion de pastillas y fluido de freno',
            tipo: 'FrenosYSuspension',
            horasEstimadas: 1.2,
            costoHoraManoObra: 25.0
        }
    ],
    repuestos: [
        {
            id: 'rep-01',
            nombre: 'Aceite Sintetico 10W40 (4L)',
            categoria: 'AceiteSintetico',
            precioUnitario: 48.0,
            cantidad: 1
        },
        {
            id: 'rep-02',
            nombre: 'Filtro de Aceite OEM',
            categoria: 'FiltroAceite',
            precioUnitario: 14.5,
            cantidad: 1
        },
        {
            id: 'rep-03',
            nombre: 'Pastillas de Freno Sinterizadas',
            categoria: 'PastillasFreno',
            precioUnitario: 35.0,
            cantidad: 2
        }
    ],
    descuentoPct: 10, // 10% de descuento por cliente frecuente
    aplicaIva: true
};

// --- CASO 2: Orden Corrupta, Precios Negativos y Descuento Excedido (Caso Límite) ---
const ordenLimiteCorrupta: OrdenTaller = {
    id: 'ORD-2026-090',
    clienteNombre: 'Roberto Gomez',
    motoModelo: 'Ducati Panigale V4',
    placa: '', // Placa vacia
    kilometraje: -1500, // Kilometraje negativo
    estado: 'EnDiagnostico',
    servicios: [
        {
            id: 'srv-03',
            descripcion: 'Revision Electrica Avanzada',
            tipo: 'SistemaElectrico',
            horasEstimadas: -2.0, // Horas negativas invalidas
            costoHoraManoObra: 30.0
        }
    ],
    repuestos: [
        {
            id: 'rep-04',
            nombre: 'Bateria de Litio',
            categoria: 'Bateria',
            precioUnitario: -120.0, // Precio negativo invalido
            cantidad: 0 // Cantidad 0 invalida
        }
    ],
    descuentoPct: 150, // Descuento superior al 100%
    aplicaIva: false
};

// Ejecución
const resumenNormal = procesarOrdenTaller(ordenMantenimientoNormal);
mostrarResumenOrden(resumenNormal, 'Caso Normal - Mantenimiento Mayor Z900');

const resumenLimite = procesarOrdenTaller(ordenLimiteCorrupta);
mostrarResumenOrden(resumenLimite, 'Caso Limite - Datos Corruptos y Valores Negativos');