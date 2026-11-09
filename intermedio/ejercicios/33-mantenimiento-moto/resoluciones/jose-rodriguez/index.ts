
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions y Literales)

export type TipoMoto =
    | 'Naked'
    | 'Sport'
    | 'Custom'
    | 'Enduro'
    | 'Touring'
    | 'Scooter';

export type TipoServicio =
    | 'AceiteFiltro'
    | 'Frenos'
    | 'CadenaTransmision'
    | 'Bujias'
    | 'FiltroAire'
    | 'Refrigerante'
    | 'RevisionGeneral';

export type EstadoMantenimiento =
    | 'Pendiente'
    | 'EnProceso'
    | 'Completado'
    | 'Vencido'
    | 'Urgente';

export type PrioridadTarea = 'Baja' | 'Media' | 'Alta' | 'Critica';

export interface MecanicoMoto {
    readonly id: string;
    readonly nombre: string;
    readonly especialidad: TipoMoto;
    readonly tarifaHoraUSD: number;
}

export interface TareaMantenimiento {
    readonly id: string;
    readonly codigoTarea: string;
    readonly servicio: TipoServicio;
    readonly intervaloKm: number;
    readonly intervaloMeses: number;
    readonly prioridad: PrioridadTarea;
    readonly costoEstimadoUSD: number;
    readonly duracionMinutos: number;
}

export interface RegistroMantenimientoMoto {
    readonly id: string;
    readonly tarea: TareaMantenimiento;
    readonly kmUltimoServicio: number;
    readonly kmActualMoto: number;
    readonly mecanico: MecanicoMoto;
    readonly fechaProgramada: string;
    readonly estado: EstadoMantenimiento;
}

export interface MotoMantenimiento {
    readonly id: string;
    readonly vin: string;
    readonly marca: string;
    readonly modelo: string;
    readonly cilindradaCc: number;
    readonly kilometrajeActual: number;
    readonly tipo: TipoMoto;
    readonly mantenimientoPlanificado: readonly RegistroMantenimientoMoto[];
}

export interface MetricasPlanMantenimiento {
    readonly totalMantenimientos: number;
    readonly mantenimientosCompletados: number;
    readonly mantenimientosVencidosOUrgentes: number;
    readonly porcentajeCumplimiento: number;
    readonly costoTotalMantenimientoUSD: number;
    readonly costoPromedioPorKmUSD: number;
    readonly tareaMasCostosa: TareaMantenimiento | null;
    readonly desglosePorServicio: Readonly<Record<TipoServicio, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoMantenimiento, number>>;
}

export interface ResumenPlanMantenimiento {
    readonly motoId: string;
    readonly motoModelo: string;
    readonly kilometrajeActual: number;
    readonly totalTareasValidas: number;
    readonly metricas: MetricasPlanMantenimiento;
    readonly registrosProcesados: readonly RegistroMantenimientoMoto[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. TYPE GUARDS Y FUNCIONES DE VALIDACIÓN DE DOMINIO

export function esServicioCritico(tarea: TareaMantenimiento): boolean {
    return tarea.prioridad === 'Critica' || tarea.servicio === 'Frenos';
}

export function validarTareaMantenimiento(tarea: TareaMantenimiento): ResultadoValidacion<TareaMantenimiento> {
    const errores: string[] = [];

    if (tarea.intervaloKm <= 0 || tarea.intervaloKm > 50000) {
        errores.push(`Intervalo de kilometraje invalido en tarea "${tarea.codigoTarea}" (${tarea.intervaloKm} km).`);
    }

    if (tarea.intervaloMeses <= 0 || tarea.intervaloMeses > 60) {
        errores.push(`Intervalo en meses fuera de rango (${tarea.intervaloMeses} meses) para "${tarea.codigoTarea}".`);
    }

    if (tarea.costoEstimadoUSD <= 0) {
        errores.push(`El costo estimado debe ser mayor a 0 USD ($${tarea.costoEstimadoUSD}) en "${tarea.codigoTarea}".`);
    }

    if (tarea.duracionMinutos <= 0) {
        errores.push(`La duracion en minutos debe ser mayor a 0 en "${tarea.codigoTarea}".`);
    }

    return errores.length === 0
        ? { esValido: true, datos: tarea }
        : { esValido: false, errores };
}

export function validarRegistroMantenimiento(reg: RegistroMantenimientoMoto): ResultadoValidacion<RegistroMantenimientoMoto> {
    const errores: string[] = [];

    if (reg.kmUltimoServicio < 0) {
        errores.push(`Kilometraje de ultimo servicio no puede ser negativo (${reg.kmUltimoServicio} km) en registro ${reg.id}.`);
    }

    if (reg.kmActualMoto < reg.kmUltimoServicio) {
        errores.push(`Kilometraje actual (${reg.kmActualMoto} km) no puede ser menor al del ultimo servicio (${reg.kmUltimoServicio} km).`);
    }

    if (reg.mecanico.tarifaHoraUSD <= 0) {
        errores.push(`La tarifa del mecanico ${reg.mecanico.nombre} es invalida ($${reg.mecanico.tarifaHoraUSD}).`);
    }

    return errores.length === 0
        ? { esValido: true, datos: reg }
        : { esValido: false, errores };
}

export function validarMotoRaw(moto: MotoMantenimiento): readonly string[] {
    const advertencias: string[] = [];
    const idsRegistros = new Set<string>();
    const codigosTareas = new Set<string>();

    if (moto.cilindradaCc <= 0 || moto.cilindradaCc > 2500) {
        advertencias.push(`Cilindrada fuera de rango para la moto ${moto.modelo} (${moto.cilindradaCc} cc).`);
    }

    if (moto.mantenimientoPlanificado.length === 0) {
        advertencias.push(`La motocicleta "${moto.marca} ${moto.modelo}" no tiene tareas de mantenimiento registradas.`);
    }

    for (const reg of moto.mantenimientoPlanificado) {
        if (idsRegistros.has(reg.id)) {
            advertencias.push(`Registro de mantenimiento duplicado por ID: ${reg.id}.`);
        }
        if (codigosTareas.has(reg.tarea.codigoTarea)) {
            advertencias.push(`Codigo de tarea duplicado en el plan: ${reg.tarea.codigoTarea}.`);
        }
        idsRegistros.add(reg.id);
        codigosTareas.add(reg.tarea.codigoTarea);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce, Record y Union Types)

const TIPOS_SERVICIO: readonly TipoServicio[] = [
    'AceiteFiltro',
    'Frenos',
    'CadenaTransmision',
    'Bujias',
    'FiltroAire',
    'Refrigerante',
    'RevisionGeneral'
];

const ESTADOS_MANTENIMIENTO: readonly EstadoMantenimiento[] = [
    'Pendiente',
    'EnProceso',
    'Completado',
    'Vencido',
    'Urgente'
];

export function calcularMetricasMantenimiento(
    registros: readonly RegistroMantenimientoMoto[],
    kilometrajeActualMoto: number
): MetricasPlanMantenimiento {
    if (registros.length === 0) {
        const desgloseServicioVacio = TIPOS_SERVICIO.reduce((acc, s) => {
            acc[s] = 0;
            return acc;
        }, {} as Record<TipoServicio, number>);

        const desgloseEstadoVacio = ESTADOS_MANTENIMIENTO.reduce((acc, est) => {
            acc[est] = 0;
            return acc;
        }, {} as Record<EstadoMantenimiento, number>);

        return {
            totalMantenimientos: 0,
            mantenimientosCompletados: 0,
            mantenimientosVencidosOUrgentes: 0,
            porcentajeCumplimiento: 0,
            costoTotalMantenimientoUSD: 0,
            costoPromedioPorKmUSD: 0,
            tareaMasCostosa: null,
            desglosePorServicio: desgloseServicioVacio,
            desglosePorEstado: desgloseEstadoVacio
        };
    }

    const mantenimientosCompletados = registros.filter((r) => r.estado === 'Completado').length;
    const mantenimientosVencidosOUrgentes = registros.filter(
        (r) => r.estado === 'Vencido' || r.estado === 'Urgente'
    ).length;

    const porcentajeCumplimiento = Number(
        ((mantenimientosCompletados / registros.length) * 100).toFixed(1)
    );

    const costoTotalMantenimientoUSD = Number(
        registros
            .reduce((acc, r) => {
                const manoDeObra = (r.tarea.duracionMinutos / 60) * r.mecanico.tarifaHoraUSD;
                return acc + r.tarea.costoEstimadoUSD + manoDeObra;
            }, 0)
            .toFixed(2)
    );

    const costoPromedioPorKmUSD = kilometrajeActualMoto > 0
        ? Number((costoTotalMantenimientoUSD / kilometrajeActualMoto).toFixed(4))
        : 0;

    const tareaMasCostosa = [...registros]
        .map((r) => r.tarea)
        .sort((a, b) => b.costoEstimadoUSD - a.costoEstimadoUSD)[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorServicio = registros.reduce((acc, r) => {
        acc[r.tarea.servicio] = (acc[r.tarea.servicio] ?? 0) + 1;
        return acc;
    }, TIPOS_SERVICIO.reduce((acc, s) => ({ ...acc, [s]: 0 }), {} as Record<TipoServicio, number>));

    const desglosePorEstado = registros.reduce((acc, r) => {
        acc[r.estado] = (acc[r.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_MANTENIMIENTO.reduce((acc, est) => ({ ...acc, [est]: 0 }), {} as Record<EstadoMantenimiento, number>));

    return {
        totalMantenimientos: registros.length,
        mantenimientosCompletados,
        mantenimientosVencidosOUrgentes,
        porcentajeCumplimiento,
        costoTotalMantenimientoUSD,
        costoPromedioPorKmUSD,
        tareaMasCostosa,
        desglosePorServicio,
        desglosePorEstado
    };
}

export function procesarPlanMantenimiento(motoRaw: MotoMantenimiento): ResumenPlanMantenimiento {
    const advertencias: string[] = [...validarMotoRaw(motoRaw)];
    const registrosValidos: RegistroMantenimientoMoto[] = [];

    for (const rawReg of motoRaw.mantenimientoPlanificado) {
        const resTarea = validarTareaMantenimiento(rawReg.tarea);
        const resReg = validarRegistroMantenimiento(rawReg);

        if (!resTarea.esValido) {
            advertencias.push(...resTarea.errores.map((err) => `Registro ${rawReg.id}: ${err}`));
        }
        if (!resReg.esValido) {
            advertencias.push(...resReg.errores);
        }

        if (resTarea.esValido && resReg.esValido) {
            registrosValidos.push(rawReg);
        }
    }

    const metricas = calcularMetricasMantenimiento(registrosValidos, motoRaw.kilometrajeActual);

    return {
        motoId: motoRaw.id,
        motoModelo: `${motoRaw.marca} ${motoRaw.modelo}`,
        kilometrajeActual: motoRaw.kilometrajeActual,
        totalTareasValidas: registrosValidos.length,
        metricas,
        registrosProcesados: registrosValidos,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenMantenimiento(resumen: ResumenPlanMantenimiento, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` PLAN DE MANTENIMIENTO MOTO - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Motocicleta         : ${resumen.motoModelo}`);
    console.log(`Kilometraje Actual  : ${resumen.kilometrajeActual.toLocaleString()} km`);
    console.log(`Tareas Validadas    : ${resumen.totalTareasValidas}`);
    console.log(`Cumplimiento        : ${resumen.metricas.mantenimientosCompletados} de ${resumen.metricas.totalMantenimientos} (${resumen.metricas.porcentajeCumplimiento}%)`);
    console.log(`Vencidos o Urgentes : ${resumen.metricas.mantenimientosVencidosOUrgentes}`);
    console.log(`Costo Total Plan USD: $${resumen.metricas.costoTotalMantenimientoUSD.toLocaleString()} USD`);
    console.log(`Costo por Km        : $${resumen.metricas.costoPromedioPorKmUSD} USD/km`);
    console.log(`Tarea Mas Costosa   : ${resumen.metricas.tareaMasCostosa ? `${resumen.metricas.tareaMasCostosa.codigoTarea} ($${resumen.metricas.tareaMasCostosa.costoEstimadoUSD} - ${resumen.metricas.tareaMasCostosa.servicio})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y ALERTAS DE MANTENIMIENTO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE SERVICIOS REGISTRADOS:`);
    Object.entries(resumen.metricas.desglosePorServicio).forEach(([servicio, cantidad]) => {
        console.log(`   - ${servicio.padEnd(20)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.registrosProcesados.map((r) => ({
            ID: r.id,
            Codigo: r.tarea.codigoTarea,
            Servicio: r.tarea.servicio,
            Prioridad: r.tarea.prioridad,
            'Intervalo Km': `${r.tarea.intervaloKm} km`,
            'Km Ult. Serv': `${r.kmUltimoServicio} km`,
            'Duracion (m)': `${r.tarea.duracionMinutos} min`,
            Mecanico: r.mecanico.nombre,
            Estado: r.estado
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const mecanicoLead: MecanicoMoto = { id: 'mec-01', nombre: 'Jose Rodriguez', especialidad: 'Sport', tarifaHoraUSD: 40 };
const mecanicoGral: MecanicoMoto = { id: 'mec-02', nombre: 'Carlos Ruiz', especialidad: 'Naked', tarifaHoraUSD: 30 };

const tareaAceite: TareaMantenimiento = { id: 't-01', codigoTarea: 'MAINT_OIL_01', servicio: 'AceiteFiltro', intervaloKm: 5000, intervaloMeses: 6, prioridad: 'Alta', costoEstimadoUSD: 65, duracionMinutos: 45 };
const tareaFrenos: TareaMantenimiento = { id: 't-02', codigoTarea: 'MAINT_BRAKE_02', servicio: 'Frenos', intervaloKm: 10000, intervaloMeses: 12, prioridad: 'Critica', costoEstimadoUSD: 120, duracionMinutos: 90 };
const tareaCadena: TareaMantenimiento = { id: 't-03', codigoTarea: 'MAINT_CHAIN_03', servicio: 'CadenaTransmision', intervaloKm: 1000, intervaloMeses: 1, prioridad: 'Media', costoEstimadoUSD: 25, duracionMinutos: 30 };

// --- CASO 1: Moto Deportiva con Plan Preventivo Regular (Caso Normal) ---
const motoNormal: MotoMantenimiento = {
    id: 'MOTO-YAM-R6',
    vin: 'JYARJ15E000123456',
    marca: 'Yamaha',
    modelo: 'YZF-R6',
    cilindradaCc: 600,
    kilometrajeActual: 18500,
    tipo: 'Sport',
    mantenimientoPlanificado: [
        {
            id: 'reg-01',
            tarea: tareaAceite,
            kmUltimoServicio: 15000,
            kmActualMoto: 18500,
            mecanico: mecanicoLead,
            fechaProgramada: '2026-10-15',
            estado: 'Completado'
        },
        {
            id: 'reg-02',
            tarea: tareaFrenos,
            kmUltimoServicio: 10000,
            kmActualMoto: 18500,
            mecanico: mecanicoLead,
            fechaProgramada: '2026-11-20',
            estado: 'Urgente'
        },
        {
            id: 'reg-03',
            tarea: tareaCadena,
            kmUltimoServicio: 18000,
            kmActualMoto: 18500,
            mecanico: mecanicoGral,
            fechaProgramada: '2026-11-10',
            estado: 'Pendiente'
        }
    ]
};

// --- CASO 2: Tareas con Costo 0, Kilometraje Incoherente y Tarea Duplicada (Caso Límite) ---
const tareaCorrupta: TareaMantenimiento = { id: 't-99', codigoTarea: 'MAINT_ERR_01', servicio: 'Bujias', intervaloKm: 0, intervaloMeses: 0, prioridad: 'Baja', costoEstimadoUSD: -10, duracionMinutos: 0 };

const motoLimiteCorrupta: MotoMantenimiento = {
    id: 'MOTO-FAIL-02',
    vin: 'VIN_INVALIDO_00',
    marca: 'Moto Generica',
    modelo: 'Custom 250',
    cilindradaCc: 0, // Cilindrada 0 -> Invalido
    kilometrajeActual: 5000,
    tipo: 'Custom',
    mantenimientoPlanificado: [
        {
            id: 'reg-04',
            tarea: tareaCorrupta, // Costos e intervalos invalidos
            kmUltimoServicio: 8000, // Km ultimo servicio > Km actual moto -> Invalido
            kmActualMoto: 5000,
            mecanico: mecanicoGral,
            fechaProgramada: '2026-11-01',
            estado: 'Vencido'
        },
        {
            id: 'reg-01', // ID de registro duplicado con reg-01
            tarea: tareaAceite,
            kmUltimoServicio: 4000,
            kmActualMoto: 5000,
            mecanico: mecanicoGral,
            fechaProgramada: '2026-11-05',
            estado: 'Pendiente'
        }
    ]
};

// Ejecución
const resumenNormal = procesarPlanMantenimiento(motoNormal);
mostrarResumenMantenimiento(resumenNormal, 'Caso Normal - Yamaha YZF-R6 Mantenimiento Regular');

const resumenLimite = procesarPlanMantenimiento(motoLimiteCorrupta);
mostrarResumenMantenimiento(resumenLimite, 'Caso Limite - Kilometraje Incoherente y Costos Negativos');