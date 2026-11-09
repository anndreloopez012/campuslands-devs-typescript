
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Clases)

export type CategoriaGasto =
    | 'Alojamiento'
    | 'Transporte'
    | 'Comida'
    | 'Actividades'
    | 'SeguroViaje'
    | 'Imprevistos';

export type TipoAlojamiento =
    | 'HostalDormitorio'
    | 'HostalHabitacionPrivada'
    | 'Camping'
    | 'AirbnbEconomico'
    | 'Voluntariado';

export type EstadoGasto = 'Planificado' | 'Pagado' | 'Pendiente' | 'Excedido';

export interface GastoBackpacking {
    readonly id: string;
    readonly concepto: string;
    readonly categoria: CategoriaGasto;
    readonly montoUSD: number;
    readonly diaViaje: number;
    readonly estado: EstadoGasto;
    readonly pais: string;
    readonly esEsencial: boolean;
}

export interface DestinoViaje {
    readonly id: string;
    readonly ciudad: string;
    readonly pais: string;
    readonly diasEstancia: number;
    readonly presupuestoDiarioEstimadoUSD: number;
    readonly tipoAlojamiento: TipoAlojamiento;
}

export interface PlanViajeBackpacking {
    readonly id: string;
    readonly codigoViaje: string;
    readonly nombreMochilero: string;
    readonly duracionTotalDias: number;
    readonly presupuestoMaximoUSD: number;
    readonly destinos: readonly DestinoViaje[];
    readonly gastos: readonly GastoBackpacking[];
}

export interface MetricasPresupuesto {
    readonly totalGastos: number;
    readonly gastosPagadosCount: number;
    readonly gastoTotalUSD: number;
    readonly presupuestoRestanteUSD: number;
    readonly gastoPromedioDiarioUSD: number;
    readonly porcentajePresupuestoConsumido: number;
    readonly gastoMasCostoso: GastoBackpacking | null;
    readonly desglosePorCategoria: Readonly<Record<CategoriaGasto, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoGasto, number>>;
}

export interface ResumenPresupuestoBackpacking {
    readonly viajeId: string;
    readonly codigoViaje: string;
    readonly mochileroNombre: string;
    readonly totalGastosValidos: number;
    readonly metricas: MetricasPresupuesto;
    readonly gastosProcesados: readonly GastoBackpacking[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y CLASE DE GESTIÓN (Generics & Encapsulamiento)

export class ContenedorGastos<T extends { readonly id: string }> {
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

export function validarGasto(
    gasto: GastoBackpacking,
    duracionTotalDias: number
): ResultadoValidacion<GastoBackpacking> {
    const errores: string[] = [];

    if (gasto.montoUSD <= 0) {
        errores.push(`Monto de gasto invalido ($${gasto.montoUSD}) en "${gasto.concepto}".`);
    }

    if (gasto.diaViaje <= 0 || gasto.diaViaje > duracionTotalDias) {
        errores.push(
            `Dia de viaje fuera de rango (Dia ${gasto.diaViaje}) para "${gasto.concepto}". Debe estar entre 1 y ${duracionTotalDias}.`
        );
    }

    if (gasto.concepto.trim().length === 0) {
        errores.push('El gasto debe registrar un concepto valido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: gasto }
        : { esValido: false, errores };
}

export function validarDestino(destino: DestinoViaje): ResultadoValidacion<DestinoViaje> {
    const errores: string[] = [];

    if (destino.diasEstancia <= 0) {
        errores.push(`Dias de estancia invalidos (${destino.diasEstancia}) en ${destino.ciudad}.`);
    }

    if (destino.presupuestoDiarioEstimadoUSD <= 0) {
        errores.push(`Presupuesto diario estimado invalido ($${destino.presupuestoDiarioEstimadoUSD}) en ${destino.ciudad}.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: destino }
        : { esValido: false, errores };
}

export function validarPlanViajeRaw(plan: PlanViajeBackpacking): readonly string[] {
    const advertencias: string[] = [];
    const idsGastos = new Set<string>();

    if (plan.presupuestoMaximoUSD <= 0) {
        advertencias.push(`Presupuesto maximo del viaje invalido ($${plan.presupuestoMaximoUSD}).`);
    }

    if (plan.duracionTotalDias <= 0) {
        advertencias.push(`Duracion total del viaje invalida (${plan.duracionTotalDias} dias).`);
    }

    if (plan.destinos.length === 0) {
        advertencias.push(`El plan de viaje "${plan.codigoViaje}" no registra destinos.`);
    }

    for (const g of plan.gastos) {
        if (idsGastos.has(g.id)) {
            advertencias.push(`Gasto duplicado detectado por ID: ${g.id} (${g.concepto}).`);
        }
        idsGastos.add(g.id);
    }

    return advertencias;
}

// 4. TRANSFORMACIÓN Y CÁLCULOS METRICOS (reduce & Record)

const CATEGORIAS_GASTO: readonly CategoriaGasto[] = [
    'Alojamiento',
    'Transporte',
    'Comida',
    'Actividades',
    'SeguroViaje',
    'Imprevistos'
];

const ESTADOS_GASTO: readonly EstadoGasto[] = [
    'Planificado',
    'Pagado',
    'Pendiente',
    'Excedido'
];

export function calcularMetricasPresupuesto(
    gastos: readonly GastoBackpacking[],
    presupuestoMaxUSD: number,
    duracionTotalDias: number
): MetricasPresupuesto {
    if (gastos.length === 0) {
        const desgloseCategoriaVacio = CATEGORIAS_GASTO.reduce((acc, c) => {
            acc[c] = 0;
            return acc;
        }, {} as Record<CategoriaGasto, number>);

        const desgloseEstadoVacio = ESTADOS_GASTO.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstadoGasto, number>);

        return {
            totalGastos: 0,
            gastosPagadosCount: 0,
            gastoTotalUSD: 0,
            presupuestoRestanteUSD: presupuestoMaxUSD,
            gastoPromedioDiarioUSD: 0,
            porcentajePresupuestoConsumido: 0,
            gastoMasCostoso: null,
            desglosePorCategoria: desgloseCategoriaVacio,
            desglosePorEstado: desgloseEstadoVacio
        };
    }

    const gastosPagados = gastos.filter((g) => g.estado === 'Pagado');
    const gastosPagadosCount = gastosPagados.length;

    const gastoTotalUSD = Number(
        gastos.reduce((acc, g) => acc + g.montoUSD, 0).toFixed(2)
    );

    const presupuestoRestanteUSD = Number(
        (presupuestoMaxUSD - gastoTotalUSD).toFixed(2)
    );

    const gastoPromedioDiarioUSD = duracionTotalDias > 0
        ? Number((gastoTotalUSD / duracionTotalDias).toFixed(2))
        : 0;

    const porcentajePresupuestoConsumido = Number(
        ((gastoTotalUSD / presupuestoMaxUSD) * 100).toFixed(1)
    );

    const gastoMasCostoso = [...gastos].sort(
        (a, b) => b.montoUSD - a.montoUSD
    )[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorCategoria = gastos.reduce((acc, g) => {
        acc[g.categoria] = Number(((acc[g.categoria] ?? 0) + g.montoUSD).toFixed(2));
        return acc;
    }, CATEGORIAS_GASTO.reduce((acc, c) => ({ ...acc, [c]: 0 }), {} as Record<CategoriaGasto, number>));

    const desglosePorEstado = gastos.reduce((acc, g) => {
        acc[g.estado] = (acc[g.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_GASTO.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoGasto, number>));

    return {
        totalGastos: gastos.length,
        gastosPagadosCount,
        gastoTotalUSD,
        presupuestoRestanteUSD,
        gastoPromedioDiarioUSD,
        porcentajePresupuestoConsumido,
        gastoMasCostoso,
        desglosePorCategoria,
        desglosePorEstado
    };
}

export class ServicioGestionBackpacking {
    private readonly contenedor = new ContenedorGastos<GastoBackpacking>();
    private readonly advertencias: string[] = [];

    constructor(private readonly planRaw: PlanViajeBackpacking) { }

    public procesarPresupuesto(): ResumenPresupuestoBackpacking {
        this.advertencias.push(...validarPlanViajeRaw(this.planRaw));

        for (const d of this.planRaw.destinos) {
            const resD = validarDestino(d);
            if (!resD.esValido) {
                this.advertencias.push(...resD.errores);
            }
        }

        for (const rawGasto of this.planRaw.gastos) {
            const resG = validarGasto(rawGasto, this.planRaw.duracionTotalDias);

            if (!resG.esValido) {
                this.advertencias.push(...resG.errores);
            } else {
                const agregado = this.contenedor.agregar(resG.datos);
                if (!agregado) {
                    this.advertencias.push(`No se pudo agregar el gasto duplicado por ID: ${rawGasto.id}`);
                }
            }
        }

        const gastosValidos = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasPresupuesto(
            gastosValidos,
            this.planRaw.presupuestoMaximoUSD,
            this.planRaw.duracionTotalDias
        );

        if (metricas.gastoTotalUSD > this.planRaw.presupuestoMaximoUSD) {
            this.advertencias.push(
                `Alerta de sobrecosto: El gasto total ($${metricas.gastoTotalUSD} USD) supera el presupuesto asignado ($${this.planRaw.presupuestoMaximoUSD} USD).`
            );
        }

        return {
            viajeId: this.planRaw.id,
            codigoViaje: this.planRaw.codigoViaje,
            mochileroNombre: this.planRaw.nombreMochilero,
            totalGastosValidos: gastosValidos.length,
            metricas,
            gastosProcesados: gastosValidos,
            advertencias: this.advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenPresupuesto(
    resumen: ResumenPresupuestoBackpacking,
    tituloCaso: string
): void {
    console.log(`\n======================================================================`);
    console.log(` PRESUPUESTO BACKPACKING - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Mochilero           : ${resumen.mochileroNombre}`);
    console.log(`Codigo Viaje        : ${resumen.codigoViaje}`);
    console.log(`Gastos Registrados  : ${resumen.totalGastosValidos}`);
    console.log(`Gasto Total         : $${resumen.metricas.gastoTotalUSD.toLocaleString()} USD (${resumen.metricas.porcentajePresupuestoConsumido}% consumido)`);
    console.log(`Presupuesto Restante: $${resumen.metricas.presupuestoRestanteUSD.toLocaleString()} USD`);
    console.log(`Promedio Diario     : $${resumen.metricas.gastoPromedioDiarioUSD} USD/dia`);
    console.log(`Gasto Mas Costoso   : ${resumen.metricas.gastoMasCostoso ? `"${resumen.metricas.gastoMasCostoso.concepto}" ($${resumen.metricas.gastoMasCostoso.montoUSD} USD - ${resumen.metricas.gastoMasCostoso.categoria})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y SOBRECOSTOS (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE GASTOS POR CATEGORIA (USD):`);
    Object.entries(resumen.metricas.desglosePorCategoria).forEach(([cat, monto]) => {
        console.log(`   - ${cat.padEnd(16)}: $${monto.toLocaleString()} USD`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.gastosProcesados.map((g) => ({
            ID: g.id,
            Concepto: g.concepto,
            Categoría: g.categoria,
            'Día': `Día ${g.diaViaje}`,
            País: g.pais,
            Monto: `$${g.montoUSD}`,
            Esencial: g.esEsencial ? 'Sí' : 'No',
            Estado: g.estado
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const g1: GastoBackpacking = { id: 'exp-01', concepto: 'Cama en Dormitorio Hostal Mad monkey', categoria: 'Alojamiento', montoUSD: 18.0, diaViaje: 2, estado: 'Pagado', pais: 'Tailandia', esEsencial: true };
const g2: GastoBackpacking = { id: 'exp-02', concepto: 'Tren Nocturno Bangkok a Chiang Mai', categoria: 'Transporte', montoUSD: 35.0, diaViaje: 4, estado: 'Pagado', pais: 'Tailandia', esEsencial: true };
const g3: GastoBackpacking = { id: 'exp-03', concepto: 'Street Food Pad Thai & Jugos', categoria: 'Comida', montoUSD: 12.0, diaViaje: 5, estado: 'Pagado', pais: 'Tailandia', esEsencial: true };
const g4: GastoBackpacking = { id: 'exp-04', concepto: 'Trekking en la Jungla 2 dias', categoria: 'Actividades', montoUSD: 85.0, diaViaje: 7, estado: 'Planificado', pais: 'Tailandia', esEsencial: false };
const g5: GastoBackpacking = { id: 'exp-05', concepto: 'Seguro de Viaje World Nomads', categoria: 'SeguroViaje', montoUSD: 120.0, diaViaje: 1, estado: 'Pagado', pais: 'Global', esEsencial: true };

// --- CASO 1: Viaje Backpacking por el Sudeste Asiático (Caso Normal) ---
const planNormal: PlanViajeBackpacking = {
    id: 'TRIP-SEA-2026',
    codigoViaje: 'BACKPACK-ASIA-01',
    nombreMochilero: 'Jose Rodriguez',
    duracionTotalDias: 20,
    presupuestoMaximoUSD: 800,
    destinos: [
        { id: 'dest-01', ciudad: 'Bangkok', pais: 'Tailandia', diasEstancia: 5, presupuestoDiarioEstimadoUSD: 35, tipoAlojamiento: 'HostalDormitorio' },
        { id: 'dest-02', ciudad: 'Chiang Mai', pais: 'Tailandia', diasEstancia: 7, presupuestoDiarioEstimadoUSD: 30, tipoAlojamiento: 'HostalDormitorio' }
    ],
    gastos: [g1, g2, g3, g4, g5]
};

// --- CASO 2: Sobrecosto, Día Fuera de Rango y Gasto Negativo (Caso Límite) ---
const gastoCorrupto: GastoBackpacking = {
    id: 'exp-99',
    concepto: 'Tour Exclusivo Invalido',
    categoria: 'Actividades',
    montoUSD: -50.0, // Monto negativo -> Invalido
    diaViaje: 45, // Dia 45 > 15 -> Fuera de rango
    estado: 'Excedido',
    pais: 'Camboya',
    esEsencial: false
};

const planLimiteCorrupto: PlanViajeBackpacking = {
    id: 'TRIP-FAIL-02',
    codigoViaje: 'BACKPACK-FAIL-02',
    nombreMochilero: 'Jose Rodriguez',
    duracionTotalDias: 15,
    presupuestoMaximoUSD: 200, // Presupuesto ajustado que provocara sobrecosto
    destinos: [
        { id: 'dest-03', ciudad: 'Siem Reap', pais: 'Camboya', diasEstancia: 0, presupuestoDiarioEstimadoUSD: 0, tipoAlojamiento: 'HostalDormitorio' } // Dias 0 -> Invalido
    ],
    gastos: [
        g5, // 120 USD
        gastoCorrupto, // Invalido
        { id: 'exp-06', concepto: 'Alojamiento Lujo No Planificado', categoria: 'Alojamiento', montoUSD: 150.0, diaViaje: 3, estado: 'Pagado', pais: 'Camboya', esEsencial: false }, // 120 + 150 = 270 USD (> 200 USD max)
        g5 // ID duplicado
    ]
};

// Ejecución Caso 1
const servicioNormal = new ServicioGestionBackpacking(planNormal);
const resumenNormal = servicioNormal.procesarPresupuesto();
mostrarResumenPresupuesto(resumenNormal, 'Caso Normal - Sudeste Asiatico Backpacking');

// Ejecución Caso 2
const servicioLimite = new ServicioGestionBackpacking(planLimiteCorrupto);
const resumenLimite = servicioLimite.procesarPresupuesto();
mostrarResumenPresupuesto(resumenLimite, 'Caso Limite - Sobrecosto de Presupuesto y Dias Fuera de Rango');