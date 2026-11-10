
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Promises)

export type PosicionJugador =
    | 'Portero'
    | 'Defensa'
    | 'Centrocampista'
    | 'Delantero';

export type TipoOperacion = 'Traspaso' | 'Cesion' | 'AgenteLibre';

export type EstadoOperacion =
    | 'Completado'
    | 'EnNegociacion'
    | 'Caido'
    | 'Rechazado';

export interface JugadorFutbol {
    readonly id: string;
    readonly nombre: string;
    readonly edad: number;
    readonly nacionalidad: string;
    readonly posicion: PosicionJugador;
    readonly valorMercadoUSD: number;
}

export interface OperacionFichaje {
    readonly id: string;
    readonly codigoOperacion: string;
    readonly jugador: JugadorFutbol;
    readonly clubOrigen: string;
    readonly clubDestino: string;
    readonly montoAcordadoUSD: number;
    readonly salarioAnualUSD: number;
    readonly duracionContratoAnos: number;
    readonly tipoOperacion: TipoOperacion;
    readonly estado: EstadoOperacion;
}

export interface MercadoFichajesRaw {
    readonly id: string;
    readonly codigoVentana: string;
    readonly nombreVentana: string; // e.g., "Ventana de Verano 2026"
    readonly ligaPrincipal: string;
    readonly operacionList: readonly OperacionFichaje[];
}

export interface MetricasMercadoFichajes {
    readonly totalOperaciones: number;
    readonly operacionesCompletadasCount: number;
    readonly porcentajeExito: number;
    readonly volumenTotalInvertidoUSD: number;
    readonly promedioFichajeUSD: number;
    readonly salarioTotalComprometidoUSD: number;
    readonly fichajeMasCostoso: OperacionFichaje | null;
    readonly desglosePorPosicion: Readonly<Record<PosicionJugador, number>>;
    readonly desglosePorTipo: Readonly<Record<TipoOperacion, number>>;
}

export interface ResumenMercadoFichajes {
    readonly mercadoId: string;
    readonly codigoVentana: string;
    readonly nombreVentana: string;
    readonly totalOperacionesValidas: number;
    readonly metricas: MetricasMercadoFichajes;
    readonly operacionesProcesadas: readonly OperacionFichaje[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y GESTIÓN DE FICHAJES (Generics & Encapsulamiento)

export class ContenedorFichajes<T extends { readonly id: string; readonly codigoOperacion: string }> {
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

// 3. VALIDACIONES Y REGLAS DE NEGOCIO (Async/Promise support)

export function validarJugador(jugador: JugadorFutbol): ResultadoValidacion<JugadorFutbol> {
    const errores: string[] = [];

    if (jugador.edad < 15 || jugador.edad > 45) {
        errores.push(`Edad de jugador fuera de rango profesional (${jugador.edad} anos) para "${jugador.nombre}".`);
    }

    if (jugador.valorMercadoUSD < 0) {
        errores.push(`Valor de mercado negativo ($${jugador.valorMercadoUSD} USD) en "${jugador.nombre}".`);
    }

    if (jugador.nombre.trim().length === 0) {
        errores.push('El jugador registrado debe incluir un nombre valido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: jugador }
        : { esValido: false, errores };
}

export async function validarOperacionAsync(
    operacion: OperacionFichaje
): Promise<ResultadoValidacion<OperacionFichaje>> {
    // Simulacion de verificacion asincrona en el sistema de licencias TMS / FIFA
    await new Promise((resolve) => setTimeout(resolve, 10));

    const errores: string[] = [];

    const resJugador = validarJugador(operacion.jugador);
    if (!resJugador.esValido) {
        errores.push(...resJugador.errores);
    }

    if (operacion.montoAcordadoUSD < 0) {
        errores.push(`Monto de traspaso negativo ($${operacion.montoAcordadoUSD} USD) en "${operacion.codigoOperacion}".`);
    }

    if (operacion.salarioAnualUSD <= 0) {
        errores.push(`Salario anual invalido ($${operacion.salarioAnualUSD} USD) para "${operacion.jugador.nombre}".`);
    }

    if (operacion.duracionContratoAnos <= 0 || operacion.duracionContratoAnos > 8) {
        errores.push(
            `Duracion de contrato fuera de norma FIFA (${operacion.duracionContratoAnos} anos) para "${operacion.jugador.nombre}".`
        );
    }

    if (operacion.tipoOperacion === 'AgenteLibre' && operacion.montoAcordadoUSD > 0) {
        errores.push(
            `Inconsistencia en "${operacion.codigoOperacion}": Agente libre no debe registrar costo de traspaso entre clubes.`
        );
    }

    return errores.length === 0
        ? { esValido: true, datos: operacion }
        : { esValido: false, errores };
}

export async function validarMercadoRawAsync(
    mercado: MercadoFichajesRaw
): Promise<ResultadoValidacion<MercadoFichajesRaw>> {
    await new Promise((resolve) => setTimeout(resolve, 15));

    const errores: string[] = [];

    if (mercado.operacionList.length === 0) {
        errores.push(`La ventana de fichajes "${mercado.nombreVentana}" no registra operaciones.`);
    }

    for (const op of mercado.operacionList) {
        const resVal = await validarOperacionAsync(op);
        if (!resVal.esValido) {
            errores.push(...resVal.errores);
        }
    }

    return errores.length === 0
        ? { esValido: true, datos: mercado }
        : { esValido: false, errores };
}

// 4. TRANSFORMACIÓN Y CÁLCULOS MÉTRICOS (reduce & Record)

const POSICIONES_JUGADOR: readonly PosicionJugador[] = [
    'Portero',
    'Defensa',
    'Centrocampista',
    'Delantero'
];

const TIPOS_OPERACION: readonly TipoOperacion[] = [
    'Traspaso',
    'Cesion',
    'AgenteLibre'
];

export function calcularMetricasMercado(
    operaciones: readonly OperacionFichaje[]
): MetricasMercadoFichajes {
    if (operaciones.length === 0) {
        const desglosePosVacio = POSICIONES_JUGADOR.reduce((acc, p) => {
            acc[p] = 0;
            return acc;
        }, {} as Record<PosicionJugador, number>);

        const desgloseTipoVacio = TIPOS_OPERACION.reduce((acc, t) => {
            acc[t] = 0;
            return acc;
        }, {} as Record<TipoOperacion, number>);

        return {
            totalOperaciones: 0,
            operacionesCompletadasCount: 0,
            porcentajeExito: 0,
            volumenTotalInvertidoUSD: 0,
            promedioFichajeUSD: 0,
            salarioTotalComprometidoUSD: 0,
            fichajeMasCostoso: null,
            desglosePorPosicion: desglosePosVacio,
            desglosePorTipo: desgloseTipoVacio
        };
    }

    const completadas = operaciones.filter((o) => o.estado === 'Completado');
    const operacionesCompletadasCount = completadas.length;
    const porcentajeExito = Number(((operacionesCompletadasCount / operaciones.length) * 100).toFixed(1));

    const volumenTotalInvertidoUSD = Number(
        completadas.reduce((acc, o) => acc + o.montoAcordadoUSD, 0).toFixed(2)
    );

    const promedioFichajeUSD = completadas.length > 0
        ? Number((volumenTotalInvertidoUSD / completadas.length).toFixed(2))
        : 0;

    const salarioTotalComprometidoUSD = Number(
        completadas
            .reduce((acc, o) => acc + o.salarioAnualUSD * o.duracionContratoAnos, 0)
            .toFixed(2)
    );

    const fichajeMasCostoso = [...completadas].sort(
        (a, b) => b.montoAcordadoUSD - a.montoAcordadoUSD
    )[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorPosicion = operaciones.reduce((acc, o) => {
        acc[o.jugador.posicion] = (acc[o.jugador.posicion] ?? 0) + 1;
        return acc;
    }, POSICIONES_JUGADOR.reduce((acc, p) => ({ ...acc, [p]: 0 }), {} as Record<PosicionJugador, number>));

    const desglosePorTipo = operaciones.reduce((acc, o) => {
        acc[o.tipoOperacion] = (acc[o.tipoOperacion] ?? 0) + 1;
        return acc;
    }, TIPOS_OPERACION.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TipoOperacion, number>));

    return {
        totalOperaciones: operaciones.length,
        operacionesCompletadasCount,
        porcentajeExito,
        volumenTotalInvertidoUSD,
        promedioFichajeUSD,
        salarioTotalComprometidoUSD,
        fichajeMasCostoso,
        desglosePorPosicion,
        desglosePorTipo
    };
}

export class ServicioGestionMercadoFichajes {
    private readonly contenedor = new ContenedorFichajes<OperacionFichaje>();

    public async procesarMercadoAsync(
        mercadoRaw: MercadoFichajesRaw
    ): Promise<ResumenMercadoFichajes> {
        const advertencias: string[] = [];
        const valRes = await validarMercadoRawAsync(mercadoRaw);

        if (!valRes.esValido) {
            advertencias.push(...valRes.errores);
        }

        const idsVistos = new Set<string>();
        const codigosVistos = new Set<string>();

        for (const rawOp of mercadoRaw.operacionList) {
            if (idsVistos.has(rawOp.id)) {
                advertencias.push(`Operacion duplicada detectada por ID: ${rawOp.id}.`);
            } else if (codigosVistos.has(rawOp.codigoOperacion)) {
                advertencias.push(`Codigo de operacion duplicado: ${rawOp.codigoOperacion}.`);
            } else {
                idsVistos.add(rawOp.id);
                codigosVistos.add(rawOp.codigoOperacion);
                this.contenedor.agregar(rawOp);
            }
        }

        const operacionesValidas = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasMercado(operacionesValidas);

        const caidas = operacionesValidas.filter((o) => o.estado === 'Caido' || o.estado === 'Rechazado');
        if (caidas.length > 0) {
            advertencias.push(
                `Alerta de mercado: Se registraron ${caidas.length} operacion(es) en estado Caido o Rechazado.`
            );
        }

        return {
            mercadoId: mercadoRaw.id,
            codigoVentana: mercadoRaw.codigoVentana,
            nombreVentana: mercadoRaw.nombreVentana,
            totalOperacionesValidas: operacionesValidas.length,
            metricas,
            operacionesProcesadas: operacionesValidas,
            advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenMercado(resumen: ResumenMercadoFichajes, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` MERCADO DE FICHAJES FUTBOL - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Ventana de Fichajes : ${resumen.nombreVentana}`);
    console.log(`Codigo Ventana      : ${resumen.codigoVentana}`);
    console.log(`Operaciones Validas : ${resumen.totalOperacionesValidas}`);
    console.log(`Volumen Invertido   : $${resumen.metricas.volumenTotalInvertidoUSD.toLocaleString()} USD`);
    console.log(`Promedio / Traspaso : $${resumen.metricas.promedioFichajeUSD.toLocaleString()} USD`);
    console.log(`Salarios Totales    : $${resumen.metricas.salarioTotalComprometidoUSD.toLocaleString()} USD comprometidos`);
    console.log(`Tasa de Exito       : ${resumen.metricas.operacionesCompletadasCount} de ${resumen.metricas.totalOperaciones} (${resumen.metricas.porcentajeExito}%)`);
    console.log(`Fichaje Mas Costoso : ${resumen.metricas.fichajeMasCostoso ? `"${resumen.metricas.fichajeMasCostoso.jugador.nombre}" ($${resumen.metricas.fichajeMasCostoso.montoAcordadoUSD.toLocaleString()} USD -> ${resumen.metricas.fichajeMasCostoso.clubDestino})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE REGLAMENTO / MERCADO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR POSICIÓN DE JUGADOR:`);
    Object.entries(resumen.metricas.desglosePorPosicion).forEach(([pos, cantidad]) => {
        console.log(`   - ${pos.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.operacionesProcesadas.map((o) => ({
            Codigo: o.codigoOperacion,
            Jugador: o.jugador.nombre,
            Posicion: o.jugador.posicion,
            'Origen -> Destino': `${o.clubOrigen} -> ${o.clubDestino}`,
            Tipo: o.tipoOperacion,
            Monto: `$${o.montoAcordadoUSD.toLocaleString()} USD`,
            'Salario/Ano': `$${o.salarioAnualUSD.toLocaleString()} USD`,
            Contrato: `${o.duracionContratoAnos} anos`,
            Estado: o.estado
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite Async/Await)

const j1: JugadorFutbol = {
    id: 'ply-01',
    nombre: 'Kylian Mbappe',
    edad: 27,
    nacionalidad: 'Francia',
    posicion: 'Delantero',
    valorMercadoUSD: 180000000
};

const j2: JugadorFutbol = {
    id: 'ply-02',
    nombre: 'Jude Bellingham',
    edad: 23,
    nacionalidad: 'Inglaterra',
    posicion: 'Centrocampista',
    valorMercadoUSD: 150000000
};

const j3: JugadorFutbol = {
    id: 'ply-03',
    nombre: 'Alphonso Davies',
    edad: 26,
    nacionalidad: 'Canada',
    posicion: 'Defensa',
    valorMercadoUSD: 70000000
};

const op1: OperacionFichaje = {
    id: 'trx-01',
    codigoOperacion: 'TRX-SUMMER-01',
    jugador: j1,
    clubOrigen: 'PSG',
    clubDestino: 'Real Madrid',
    montoAcordadoUSD: 120000000,
    salarioAnualUSD: 25000000,
    duracionContratoAnos: 5,
    tipoOperacion: 'Traspaso',
    estado: 'Completado'
};

const op2: OperacionFichaje = {
    id: 'trx-02',
    codigoOperacion: 'TRX-SUMMER-02',
    jugador: j2,
    clubOrigen: 'Borussia Dortmund',
    clubDestino: 'Real Madrid',
    montoAcordadoUSD: 103000000,
    salarioAnualUSD: 15000000,
    duracionContratoAnos: 6,
    tipoOperacion: 'Traspaso',
    estado: 'Completado'
};

const op3: OperacionFichaje = {
    id: 'trx-03',
    codigoOperacion: 'TRX-SUMMER-03',
    jugador: j3,
    clubOrigen: 'Bayern Munchen',
    clubDestino: 'Real Madrid',
    montoAcordadoUSD: 0,
    salarioAnualUSD: 12000000,
    duracionContratoAnos: 4,
    tipoOperacion: 'AgenteLibre',
    estado: 'Completado'
};

// --- CASO 1: Ventana de Verano Mercado Europeo (Caso Normal) ---
const mercadoNormal: MercadoFichajesRaw = {
    id: 'MKT-EUR-2026',
    codigoVentana: 'WIN-SUMMER-2026',
    nombreVentana: 'Mercado de Verano UEFA 2026',
    ligaPrincipal: 'LaLiga / Premier League',
    operacionList: [op1, op2, op3]
};

// --- CASO 2: Agente Libre Con Costo, Duracion Contrato 10 Anos e Inconsistencia (Caso Límite) ---
const jugadorCorrupto: JugadorFutbol = {
    id: 'ply-99',
    nombre: 'Jugador Prueba Invalido',
    edad: 50, // Edad > 45 -> Invalido
    nacionalidad: 'Desconocida',
    posicion: 'Portero',
    valorMercadoUSD: -500000 // Valor negativo -> Invalido
};

const operacionCorrupta: OperacionFichaje = {
    id: 'trx-99',
    codigoOperacion: 'TRX-ERR-999',
    jugador: jugadorCorrupto,
    clubOrigen: 'Club A',
    clubDestino: 'Club B',
    montoAcordadoUSD: 5000000, // Inconsistencia: AgenteLibre con costo > 0
    salarioAnualUSD: 0, // Salario 0 -> Invalido
    duracionContratoAnos: 12, // Duracion 12 anos > 8 -> Invalido FIFA
    tipoOperacion: 'AgenteLibre',
    estado: 'Caido'
};

const mercadoLimiteCorrupto: MercadoFichajesRaw = {
    id: 'MKT-FAIL-02',
    codigoVentana: 'WIN-FAIL-02',
    nombreVentana: 'Mercado Con Violaciones de Reglamento',
    ligaPrincipal: 'Pruebas Limite',
    operacionList: [
        op1,
        operacionCorrupta,
        op1 // Operacion duplicada
    ]
};

async function ejecutarPruebas(): Promise<void> {
    const servicio = new ServicioGestionMercadoFichajes();

    // Ejecución Caso 1
    const resumenNormal = await servicio.procesarMercadoAsync(mercadoNormal);
    mostrarResumenMercado(resumenNormal, 'Caso Normal - Mercado de Verano UEFA 2026');

    // Ejecución Caso 2
    const resumenLimite = await servicio.procesarMercadoAsync(mercadoLimiteCorrupto);
    mostrarResumenMercado(resumenLimite, 'Caso Limite - Agente Libre Invalido y Contrato Excesivo');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecucion:', err));