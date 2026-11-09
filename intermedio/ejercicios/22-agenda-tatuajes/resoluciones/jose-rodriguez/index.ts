
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type EstiloTatuaje =
    | 'Realismo'
    | 'Tradicional'
    | 'Neotradicional'
    | 'FineLine'
    | 'Blackwork'
    | 'Japones'
    | 'Minimalista';

export type ZonaCuerpo =
    | 'Brazo'
    | 'Pierna'
    | 'Espalda'
    | 'Pecho'
    | 'Costillas'
    | 'Cuello'
    | 'Mano';

export type EstadoCita = 'Programada' | 'EnProceso' | 'Completada' | 'Cancelada';

export interface Tatuador {
    readonly id: string;
    readonly nombre: string;
    readonly especialidad: EstiloTatuaje;
    readonly tarifaHoraUSD: number;
}

export interface ClienteTatuaje {
    readonly id: string;
    readonly nombre: string;
    readonly telefono: string;
    readonly esMayorDeEdad: boolean;
}

export interface CitaTatuaje {
    readonly id: string;
    readonly fechaHora: string; // Formato AAAA-MM-DDTHH:mm
    readonly tatuador: Tatuador;
    readonly cliente: ClienteTatuaje;
    readonly estilo: EstiloTatuaje;
    readonly zonaCuerpo: ZonaCuerpo;
    readonly duracionHoras: number;
    readonly depositoUSD: number;
    readonly precioTotalEstimadoUSD: number;
    readonly estado: EstadoCita;
}

export interface MetricasAgenda {
    readonly totalCitas: number;
    readonly citasCompletadas: number;
    readonly ingresosTotalesUSD: number;
    readonly depositosAcumuladosUSD: number;
    readonly duracionPromedioHoras: number;
    readonly tatuadorMasDemandado: { readonly nombre: string; readonly totalCitas: number } | null;
    readonly desglosePorEstilo: Readonly<Record<EstiloTatuaje, number>>;
    readonly desglosePorZona: Readonly<Record<ZonaCuerpo, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoCita, number>>;
}

export interface ResumenAgendaTatuajes {
    readonly totalCitasValidas: number;
    readonly metricas: MetricasAgenda;
    readonly citasProcesadas: readonly CitaTatuaje[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarCitaTatuaje(cita: CitaTatuaje): ResultadoValidacion<CitaTatuaje> {
    const errores: string[] = [];

    if (!cita.cliente.esMayorDeEdad) {
        errores.push(`El cliente "${cita.cliente.nombre}" es menor de edad. Se requiere mayoria de edad por ley.`);
    }

    if (cita.duracionHoras <= 0 || cita.duracionHoras > 12) {
        errores.push(`La duracion de la sesion (${cita.duracionHoras}h) esta fuera del limite permitido (1 a 12 horas).`);
    }

    if (cita.precioTotalEstimadoUSD <= 0) {
        errores.push(`El precio estimado del tatuaje debe ser mayor a 0 USD ($${cita.precioTotalEstimadoUSD}).`);
    }

    if (cita.depositoUSD < 0 || cita.depositoUSD > cita.precioTotalEstimadoUSD) {
        errores.push(`Monto de deposito invalido ($${cita.depositoUSD}) respecto al precio total ($${cita.precioTotalEstimadoUSD}).`);
    }

    if (cita.tatuador.tarifaHoraUSD <= 0) {
        errores.push(`La tarifa por hora del tatuador ${cita.tatuador.nombre} es invalida ($${cita.tatuador.tarifaHoraUSD}).`);
    }

    return errores.length === 0
        ? { esValido: true, datos: cita }
        : { esValido: false, errores };
}

export function validarAgendaRaw(citas: readonly CitaTatuaje[]): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();

    if (citas.length === 0) {
        advertencias.push('La agenda del estudio de tatuajes no contiene citas registradas.');
    }

    for (const cita of citas) {
        if (idsVistos.has(cita.id)) {
            advertencias.push(`Cita duplicada detectada: ID ${cita.id} (${cita.cliente.nombre}).`);
        }
        idsVistos.add(cita.id);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce y Record)

const ESTILOS_TATUAJE: readonly EstiloTatuaje[] = [
    'Realismo',
    'Tradicional',
    'Neotradicional',
    'FineLine',
    'Blackwork',
    'Japones',
    'Minimalista'
];

const ZONAS_CUERPO: readonly ZonaCuerpo[] = [
    'Brazo',
    'Pierna',
    'Espalda',
    'Pecho',
    'Costillas',
    'Cuello',
    'Mano'
];

const ESTADOS_CITA: readonly EstadoCita[] = [
    'Programada',
    'EnProceso',
    'Completada',
    'Cancelada'
];

export function calcularMetricasAgenda(citas: readonly CitaTatuaje[]): MetricasAgenda {
    if (citas.length === 0) {
        const desgloseEstiloVacio = ESTILOS_TATUAJE.reduce((acc, est) => {
            acc[est] = 0;
            return acc;
        }, {} as Record<EstiloTatuaje, number>);

        const desgloseZonaVacio = ZONAS_CUERPO.reduce((acc, zona) => {
            acc[zona] = 0;
            return acc;
        }, {} as Record<ZonaCuerpo, number>);

        const desgloseEstadoVacio = ESTADOS_CITA.reduce((acc, est) => {
            acc[est] = 0;
            return acc;
        }, {} as Record<EstadoCita, number>);

        return {
            totalCitas: 0,
            citasCompletadas: 0,
            ingresosTotalesUSD: 0,
            depositosAcumuladosUSD: 0,
            duracionPromedioHoras: 0,
            tatuadorMasDemandado: null,
            desglosePorEstilo: desgloseEstiloVacio,
            desglosePorZona: desgloseZonaVacio,
            desglosePorEstado: desgloseEstadoVacio
        };
    }

    const citasValidasSinCancelar = citas.filter((c) => c.estado !== 'Cancelada');
    const citasCompletadas = citas.filter((c) => c.estado === 'Completada').length;

    const ingresosTotalesUSD = Number(
        citas
            .filter((c) => c.estado === 'Completada')
            .reduce((acc, c) => acc + c.precioTotalEstimadoUSD, 0)
            .toFixed(2)
    );

    const depositosAcumuladosUSD = Number(
        citasValidasSinCancelar.reduce((acc, c) => acc + c.depositoUSD, 0).toFixed(2)
    );

    const sumaHoras = citasValidasSinCancelar.reduce((acc, c) => acc + c.duracionHoras, 0);
    const duracionPromedioHoras = citasValidasSinCancelar.length > 0
        ? Number((sumaHoras / citasValidasSinCancelar.length).toFixed(1))
        : 0;

    // Conteo de citas por tatuador con reduce
    const conteoTatuadores = citasValidasSinCancelar.reduce((acc, c) => {
        acc[c.tatuador.nombre] = (acc[c.tatuador.nombre] ?? 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    let tatuadorMasDemandado: { nombre: string; totalCitas: number } | null = null;
    let maxCitas = 0;
    Object.entries(conteoTatuadores).forEach(([nombre, total]) => {
        if (total > maxCitas) {
            maxCitas = total;
            tatuadorMasDemandado = { nombre, totalCitas: total };
        }
    });

    // Agrupaciones mediante reduce y Record
    const desglosePorEstilo = citasValidasSinCancelar.reduce((acc, c) => {
        acc[c.estilo] = (acc[c.estilo] ?? 0) + 1;
        return acc;
    }, ESTILOS_TATUAJE.reduce((acc, est) => ({ ...acc, [est]: 0 }), {} as Record<EstiloTatuaje, number>));

    const desglosePorZona = citasValidasSinCancelar.reduce((acc, c) => {
        acc[c.zonaCuerpo] = (acc[c.zonaCuerpo] ?? 0) + 1;
        return acc;
    }, ZONAS_CUERPO.reduce((acc, zona) => ({ ...acc, [zona]: 0 }), {} as Record<ZonaCuerpo, number>));

    const desglosePorEstado = citas.reduce((acc, c) => {
        acc[c.estado] = (acc[c.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_CITA.reduce((acc, est) => ({ ...acc, [est]: 0 }), {} as Record<EstadoCita, number>));

    return {
        totalCitas: citas.length,
        citasCompletadas,
        ingresosTotalesUSD,
        depositosAcumuladosUSD,
        duracionPromedioHoras,
        tatuadorMasDemandado,
        desglosePorEstilo,
        desglosePorZona,
        desglosePorEstado
    };
}

export function procesarAgendaTatuajes(citasRaw: readonly CitaTatuaje[]): ResumenAgendaTatuajes {
    const advertencias: string[] = [...validarAgendaRaw(citasRaw)];
    const citasValidas: CitaTatuaje[] = [];

    for (const raw of citasRaw) {
        const res = validarCitaTatuaje(raw);
        if (res.esValido) {
            citasValidas.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const metricas = calcularMetricasAgenda(citasValidas);

    return {
        totalCitasValidas: citasValidas.length,
        metricas,
        citasProcesadas: citasValidas,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenAgenda(resumen: ResumenAgendaTatuajes, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` AGENDA DE ESTUDIO DE TATUAJES - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Citas Validadas     : ${resumen.totalCitasValidas}`);
    console.log(`Citas Completadas   : ${resumen.metricas.citasCompletadas} / ${resumen.metricas.totalCitas}`);
    console.log(`Ingresos Totales    : $${resumen.metricas.ingresosTotalesUSD.toLocaleString()} USD`);
    console.log(`Depositos Guardados : $${resumen.metricas.depositosAcumuladosUSD.toLocaleString()} USD`);
    console.log(`Duracion Prom. Sesion: ${resumen.metricas.duracionPromedioHoras} horas`);
    console.log(`Tatuador Mas Solicitado: ${resumen.metricas.tatuadorMasDemandado ? `${resumen.metricas.tatuadorMasDemandado.nombre} (${resumen.metricas.tatuadorMasDemandado.totalCitas} citas)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE REGISTRO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR ESTILO DE TATUAJE:`);
    Object.entries(resumen.metricas.desglosePorEstilo).forEach(([estilo, cantidad]) => {
        console.log(`   - ${estilo.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.citasProcesadas.map((c) => ({
            ID: c.id,
            Fecha: c.fechaHora,
            Cliente: c.cliente.nombre,
            Tatuador: c.tatuador.nombre,
            Estilo: c.estilo,
            Zona: c.zonaCuerpo,
            Duracion: `${c.duracionHoras}h`,
            Deposito: `$${c.depositoUSD}`,
            Total: `$${c.precioTotalEstimadoUSD}`,
            Estado: c.estado
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const tatuador1: Tatuador = { id: 'tat-01', nombre: 'Horishin', especialidad: 'Japones', tarifaHoraUSD: 150 };
const tatuador2: Tatuador = { id: 'tat-02', nombre: 'Kat Von D', especialidad: 'Realismo', tarifaHoraUSD: 200 };

const cliente1: ClienteTatuaje = { id: 'cli-01', nombre: 'Carlos Gomez', telefono: '+502 5555-1111', esMayorDeEdad: true };
const cliente2: ClienteTatuaje = { id: 'cli-02', nombre: 'Maria Hernandez', telefono: '+502 5555-2222', esMayorDeEdad: true };
const clienteMenor: ClienteTatuaje = { id: 'cli-03', nombre: 'Juanito Perez', telefono: '+502 5555-3333', esMayorDeEdad: false };

// --- CASO 1: Agenda Semanal del Estudio (Caso Normal) ---
const agendaNormal: readonly CitaTatuaje[] = [
    {
        id: 'CIT-001',
        fechaHora: '2026-11-12T10:00',
        tatuador: tatuador1,
        cliente: cliente1,
        estilo: 'Japones',
        zonaCuerpo: 'Espalda',
        duracionHoras: 4,
        depositoUSD: 150,
        precioTotalEstimadoUSD: 600,
        estado: 'Completada'
    },
    {
        id: 'CIT-002',
        fechaHora: '2026-11-13T14:00',
        tatuador: tatuador2,
        cliente: cliente2,
        estilo: 'Realismo',
        zonaCuerpo: 'Brazo',
        duracionHoras: 5,
        depositoUSD: 200,
        precioTotalEstimadoUSD: 1000,
        estado: 'Completada'
    },
    {
        id: 'CIT-003',
        fechaHora: '2026-11-14T11:00',
        tatuador: tatuador1,
        cliente: cliente2,
        estilo: 'Blackwork',
        zonaCuerpo: 'Pierna',
        duracionHoras: 3,
        depositoUSD: 100,
        precioTotalEstimadoUSD: 450,
        estado: 'Programada'
    }
];

// --- CASO 2: Cliente Menor de Edad, Duración Excesiva y Depósito Inválido (Caso Límite) ---
const agendaLimiteCorrupta: readonly CitaTatuaje[] = [
    {
        id: 'CIT-004',
        fechaHora: '2026-11-15T09:00',
        tatuador: tatuador1,
        cliente: clienteMenor, // Menor de edad -> Invalido por ley
        estilo: 'FineLine',
        zonaCuerpo: 'Mano',
        duracionHoras: 2,
        depositoUSD: 50,
        precioTotalEstimadoUSD: 200,
        estado: 'Programada'
    },
    {
        id: 'CIT-005',
        fechaHora: '2026-11-15T15:00',
        tatuador: tatuador2,
        cliente: cliente1,
        estilo: 'Neotradicional',
        zonaCuerpo: 'Pecho',
        duracionHoras: 16, // Duracion > 12h -> Invalida
        depositoUSD: 800, // Deposito > precio total -> Invalido
        precioTotalEstimadoUSD: 500,
        estado: 'Programada'
    },
    {
        id: 'CIT-001', // ID Duplicado con CIT-001
        fechaHora: '2026-11-12T10:00',
        tatuador: tatuador1,
        cliente: cliente1,
        estilo: 'Japones',
        zonaCuerpo: 'Espalda',
        duracionHoras: 4,
        depositoUSD: 150,
        precioTotalEstimadoUSD: 600,
        estado: 'Completada'
    }
];

// Ejecución
const resumenNormal = procesarAgendaTatuajes(agendaNormal);
mostrarResumenAgenda(resumenNormal, 'Caso Normal - Citas Semanales del Estudio');

const resumenLimite = procesarAgendaTatuajes(agendaLimiteCorrupta);
mostrarResumenAgenda(resumenLimite, 'Caso Limite - Cliente Menor de Edad y Sesiones Invalidas');