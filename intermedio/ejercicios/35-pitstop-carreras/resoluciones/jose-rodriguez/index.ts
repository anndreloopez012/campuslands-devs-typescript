
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions y Literales)

export type TipoNeumatico =
    | 'Blando'
    | 'Medio'
    | 'Duro'
    | 'LluviaIntermedia'
    | 'LluviaExtrema';

export type EstadoPitStop =
    | 'Programado'
    | 'EnEjecucion'
    | 'Completado'
    | 'Fallido'
    | 'Cancelado';

export type RazonPitStop =
    | 'CambioNeumaticos'
    | 'DanioAleron'
    | 'EstrategiaClima'
    | 'Penalizacion'
    | 'DesgasteExcesivo';

export interface PilotoCarrera {
    readonly id: string;
    readonly nombre: string;
    readonly numeroAuto: number;
    readonly escuderia: string;
}

export interface ParadaPitStop {
    readonly id: string;
    readonly vueltaEntrada: number;
    readonly neumaticoEntrante: TipoNeumatico;
    readonly neumaticoSaliente: TipoNeumatico;
    readonly tiempoEstacionadoSegundos: number; // Tiempo detenido cambiando llantas
    readonly tiempoTotalPitLaneSegundos: number; // Tiempo total de transito en pits
    readonly razon: RazonPitStop;
    readonly estado: EstadoPitStop;
    readonly ajusteAleronMm: number;
}

export interface EstrategiaCarrera {
    readonly id: string;
    readonly codigoEstrategia: string;
    readonly piloto: PilotoCarrera;
    readonly circuitoNombre: string;
    readonly vueltasTotalesCarrera: number;
    readonly paradas: readonly ParadaPitStop[];
}

export interface MetricasEstrategiaPitStop {
    readonly totalParadas: number;
    readonly paradasCompletadas: number;
    readonly tiempoTotalEnPitLaneSegundos: number;
    readonly tiempoPromedioEstacionadoSegundos: number;
    readonly paradaMasRapida: ParadaPitStop | null;
    readonly desglosePorNeumatico: Readonly<Record<TipoNeumatico, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoPitStop, number>>;
    readonly desglosePorRazon: Readonly<Record<RazonPitStop, number>>;
}

export interface ResumenEstrategiaPitStop {
    readonly estrategiaId: string;
    readonly circuitoNombre: string;
    readonly pilotoNombre: string;
    readonly totalParadasValidas: number;
    readonly metricas: MetricasEstrategiaPitStop;
    readonly paradasProcesadas: readonly ParadaPitStop[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. TYPE GUARDS Y FUNCIONES DE VALIDACIÓN DE DOMINIO

export function esPitStopOptimo(parada: ParadaPitStop): boolean {
    return parada.estado === 'Completado' && parada.tiempoEstacionadoSegundos <= 2.8;
}

export function validarParadaPitStop(
    parada: ParadaPitStop,
    vueltasTotalesCarrera: number
): ResultadoValidacion<ParadaPitStop> {
    const errores: string[] = [];

    if (parada.vueltaEntrada <= 0 || parada.vueltaEntrada > vueltasTotalesCarrera) {
        errores.push(
            `Vuelta de entrada invalida (${parada.vueltaEntrada}) para parada ${parada.id}. Debe estar entre 1 y ${vueltasTotalesCarrera}.`
        );
    }

    if (parada.tiempoEstacionadoSegundos <= 0 || parada.tiempoEstacionadoSegundos > 60) {
        errores.push(
            `Tiempo detenido fuera de rango (${parada.tiempoEstacionadoSegundos}s) en la parada ${parada.id}.`
        );
    }

    if (parada.tiempoTotalPitLaneSegundos < parada.tiempoEstacionadoSegundos) {
        errores.push(
            `Inconsistencia en parada ${parada.id}: Tiempo total en pit lane (${parada.tiempoTotalPitLaneSegundos}s) no puede ser menor al tiempo detenido (${parada.tiempoEstacionadoSegundos}s).`
        );
    }

    if (parada.ajusteAleronMm < -20 || parada.ajusteAleronMm > 20) {
        errores.push(`Ajuste de aleron fuera de tolerancia (${parada.ajusteAleronMm} mm) en parada ${parada.id}.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: parada }
        : { esValido: false, errores };
}

export function validarEstrategiaRaw(estrategia: EstrategiaCarrera): readonly string[] {
    const advertencias: string[] = [];
    const idsParadas = new Set<string>();
    const vueltasRegistradas = new Set<number>();

    if (estrategia.vueltasTotalesCarrera <= 0 || estrategia.vueltasTotalesCarrera > 100) {
        advertencias.push(`Numero total de vueltas del circuito invalido (${estrategia.vueltasTotalesCarrera}).`);
    }

    if (estrategia.paradas.length === 0) {
        advertencias.push(`La estrategia "${estrategia.codigoEstrategia}" no registra paradas en boxes.`);
    }

    for (const p of estrategia.paradas) {
        if (idsParadas.has(p.id)) {
            advertencias.push(`Parada duplicada detectada por ID: ${p.id}.`);
        }
        if (vueltasRegistradas.has(p.vueltaEntrada)) {
            advertencias.push(`Multiples paradas registradas en la misma vuelta: Vuelta ${p.vueltaEntrada}.`);
        }
        idsParadas.add(p.id);
        vueltasRegistradas.add(p.vueltaEntrada);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce, Record y Union Types)

const TIPOS_NEUMATICO: readonly TipoNeumatico[] = [
    'Blando',
    'Medio',
    'Duro',
    'LluviaIntermedia',
    'LluviaExtrema'
];

const ESTADOS_PITSTOP: readonly EstadoPitStop[] = [
    'Programado',
    'EnEjecucion',
    'Completado',
    'Fallido',
    'Cancelado'
];

const RAZONES_PITSTOP: readonly RazonPitStop[] = [
    'CambioNeumaticos',
    'DanioAleron',
    'EstrategiaClima',
    'Penalizacion',
    'DesgasteExcesivo'
];

export function calcularMetricasEstrategia(paradas: readonly ParadaPitStop[]): MetricasEstrategiaPitStop {
    if (paradas.length === 0) {
        const desgloseNeumaticoVacio = TIPOS_NEUMATICO.reduce((acc, t) => {
            acc[t] = 0;
            return acc;
        }, {} as Record<TipoNeumatico, number>);

        const desgloseEstadoVacio = ESTADOS_PITSTOP.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstadoPitStop, number>);

        const desgloseRazonVacio = RAZONES_PITSTOP.reduce((acc, r) => {
            acc[r] = 0;
            return acc;
        }, {} as Record<RazonPitStop, number>);

        return {
            totalParadas: 0,
            paradasCompletadas: 0,
            tiempoTotalEnPitLaneSegundos: 0,
            tiempoPromedioEstacionadoSegundos: 0,
            paradaMasRapida: null,
            desglosePorNeumatico: desgloseNeumaticoVacio,
            desglosePorEstado: desgloseEstadoVacio,
            desglosePorRazon: desgloseRazonVacio
        };
    }

    const paradasCompletadas = paradas.filter((p) => p.estado === 'Completado');
    const cantidadCompletadas = paradasCompletadas.length;

    const tiempoTotalEnPitLaneSegundos = Number(
        paradas.reduce((acc, p) => acc + p.tiempoTotalPitLaneSegundos, 0).toFixed(3)
    );

    const sumaTiempoDetenido = paradasCompletadas.reduce((acc, p) => acc + p.tiempoEstacionadoSegundos, 0);
    const tiempoPromedioEstacionadoSegundos = cantidadCompletadas > 0
        ? Number((sumaTiempoDetenido / cantidadCompletadas).toFixed(3))
        : 0;

    const paradaMasRapida = [...paradasCompletadas].sort(
        (a, b) => a.tiempoEstacionadoSegundos - b.tiempoEstacionadoSegundos
    )[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorNeumatico = paradas.reduce((acc, p) => {
        acc[p.neumaticoEntrante] = (acc[p.neumaticoEntrante] ?? 0) + 1;
        return acc;
    }, TIPOS_NEUMATICO.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TipoNeumatico, number>));

    const desglosePorEstado = paradas.reduce((acc, p) => {
        acc[p.estado] = (acc[p.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_PITSTOP.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoPitStop, number>));

    const desglosePorRazon = paradas.reduce((acc, p) => {
        acc[p.razon] = (acc[p.razon] ?? 0) + 1;
        return acc;
    }, RAZONES_PITSTOP.reduce((acc, r) => ({ ...acc, [r]: 0 }), {} as Record<RazonPitStop, number>));

    return {
        totalParadas: paradas.length,
        paradasCompletadas: cantidadCompletadas,
        tiempoTotalEnPitLaneSegundos,
        tiempoPromedioEstacionadoSegundos,
        paradaMasRapida,
        desglosePorNeumatico,
        desglosePorEstado,
        desglosePorRazon
    };
}

export function procesarEstrategiaCarrera(estrategiaRaw: EstrategiaCarrera): ResumenEstrategiaPitStop {
    const advertencias: string[] = [...validarEstrategiaRaw(estrategiaRaw)];
    const paradasValidas: ParadaPitStop[] = [];

    for (const rawParada of estrategiaRaw.paradas) {
        const resParada = validarParadaPitStop(rawParada, estrategiaRaw.vueltasTotalesCarrera);
        if (resParada.esValido) {
            paradasValidas.push(resParada.datos);
        } else {
            advertencias.push(...resParada.errores);
        }
    }

    const metricas = calcularMetricasEstrategia(paradasValidas);

    return {
        estrategiaId: estrategiaRaw.id,
        circuitoNombre: estrategiaRaw.circuitoNombre,
        pilotoNombre: estrategiaRaw.piloto.nombre,
        totalParadasValidas: paradasValidas.length,
        metricas,
        paradasProcesadas: paradasValidas,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenPitStop(resumen: ResumenEstrategiaPitStop, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` ESTRATEGIA DE PIT STOP - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Circuito            : ${resumen.circuitoNombre}`);
    console.log(`Piloto              : ${resumen.pilotoNombre}`);
    console.log(`Paradas Validadas   : ${resumen.totalParadasValidas}`);
    console.log(`Paradas Completadas : ${resumen.metricas.paradasCompletadas} de ${resumen.metricas.totalParadas}`);
    console.log(`Tiempo Total Pits   : ${resumen.metricas.tiempoTotalEnPitLaneSegundos} s`);
    console.log(`Promedio Estacionado: ${resumen.metricas.tiempoPromedioEstacionadoSegundos} s`);
    console.log(`Parada Mas Rapida   : ${resumen.metricas.paradaMasRapida ? `${resumen.metricas.paradaMasRapida.tiempoEstacionadoSegundos}s (Vuelta ${resumen.metricas.paradaMasRapida.vueltaEntrada} - ${resumen.metricas.paradaMasRapida.neumaticoEntrante})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE ESTRATEGIA (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR TIPO DE NEUMATICO INSTALADO:`);
    Object.entries(resumen.metricas.desglosePorNeumatico).forEach(([neumatico, cantidad]) => {
        console.log(`   - ${neumatico.padEnd(20)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.paradasProcesadas.map((p) => ({
            ID: p.id,
            Vuelta: p.vueltaEntrada,
            'Neum. Entrante': p.neumaticoEntrante,
            'Neum. Saliente': p.neumaticoSaliente,
            'Tiempo Detenido': `${p.tiempoEstacionadoSegundos}s`,
            'Tiempo Total Pit': `${p.tiempoTotalPitLaneSegundos}s`,
            Razon: p.razon,
            Estado: p.estado
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const pilotoF1: PilotoCarrera = {
    id: 'driver-01',
    nombre: 'Jose Rodriguez',
    numeroAuto: 1,
    escuderia: 'Red Bull Racing'
};

// --- CASO 1: Gran Premio de Silverstone (Caso Normal) ---
const estrategiaSilverstone: EstrategiaCarrera = {
    id: 'STRAT-SILVERSTONE-01',
    codigoEstrategia: '2-STOP-SOFT-MEDIUM-HARD',
    piloto: pilotoF1,
    circuitoNombre: 'Silverstone Circuit',
    vueltasTotalesCarrera: 52,
    paradas: [
        {
            id: 'pit-01',
            vueltaEntrada: 18,
            neumaticoSaliente: 'Blando',
            neumaticoEntrante: 'Medio',
            tiempoEstacionadoSegundos: 2.3,
            tiempoTotalPitLaneSegundos: 21.4,
            razon: 'CambioNeumaticos',
            estado: 'Completado',
            ajusteAleronMm: 0
        },
        {
            id: 'pit-02',
            vueltaEntrada: 38,
            neumaticoSaliente: 'Medio',
            neumaticoEntrante: 'Duro',
            tiempoEstacionadoSegundos: 2.15,
            tiempoTotalPitLaneSegundos: 20.9,
            razon: 'DesgasteExcesivo',
            estado: 'Completado',
            ajusteAleronMm: 2
        }
    ]
};

// --- CASO 2: Vuelta Inexistente, Tiempos Incoherentes y Vueltas Repetidas (Caso Límite) ---
const estrategiaLimiteCorrupta: EstrategiaCarrera = {
    id: 'STRAT-FAIL-02',
    codigoEstrategia: 'STRAT_ERR_02',
    piloto: pilotoF1,
    circuitoNombre: 'Monaco GP',
    vueltasTotalesCarrera: 78,
    paradas: [
        {
            id: 'pit-03',
            vueltaEntrada: 85, // Vuelta > 78 -> Invalido
            neumaticoSaliente: 'Blando',
            neumaticoEntrante: 'LluviaIntermedia',
            tiempoEstacionadoSegundos: 25.0,
            tiempoTotalPitLaneSegundos: 15.0, // Tiempo total < detenido -> Incoherente
            razon: 'EstrategiaClima',
            estado: 'Fallido',
            ajusteAleronMm: 35 // Ajuste > 20 mm -> Invalido
        },
        {
            id: 'pit-01', // ID duplicado
            vueltaEntrada: 18,
            neumaticoSaliente: 'Blando',
            neumaticoEntrante: 'Medio',
            tiempoEstacionadoSegundos: 2.3,
            tiempoTotalPitLaneSegundos: 21.4,
            razon: 'CambioNeumaticos',
            estado: 'Completado',
            ajusteAleronMm: 0
        }
    ]
};

// Ejecución
const resumenNormal = procesarEstrategiaCarrera(estrategiaSilverstone);
mostrarResumenPitStop(resumenNormal, 'Caso Normal - GP de Silverstone 2 Stop Strategy');

const resumenLimite = procesarEstrategiaCarrera(estrategiaLimiteCorrupta);
mostrarResumenPitStop(resumenLimite, 'Caso Limite - Vuelta Fuera de Rango y Tiempos Incoherentes');