
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type TipoActividad =
    | 'Vuelo'
    | 'Alojamiento'
    | 'Excursion'
    | 'Transporte'
    | 'Gastronomia';

export type EstadoActividad = 'Confirmado' | 'Pendiente' | 'Cancelado';

export interface ActividadViaje {
    readonly id: string;
    readonly dia: number;
    readonly titulo: string;
    readonly descripcion: string;
    readonly tipo: TipoActividad;
    readonly horaInicio: string; // Formato HH:mm (24h)
    readonly duracionHoras: number;
    readonly costoEstimadoUSD: number;
    readonly ubicacion: string;
    readonly estado: EstadoActividad;
}

export interface DestinoViaje {
    readonly id: string;
    readonly ciudad: string;
    readonly pais: string;
    readonly diasEstancia: number;
}

export interface ItinerarioViaje {
    readonly id: string;
    readonly tituloViaje: string;
    readonly viajeroNombre: string;
    readonly presupuestoTotalUSD: number;
    readonly destinos: readonly DestinoViaje[];
    readonly actividades: readonly ActividadViaje[];
}

export interface MetricasItinerario {
    readonly totalActividades: number;
    readonly totalDias: number;
    readonly costoTotalActividadesUSD: number;
    readonly presupuestoRestanteUSD: number;
    readonly cumplePresupuesto: boolean;
    readonly actividadMasCostosa: ActividadViaje | null;
    readonly desglosePorTipo: Readonly<Record<TipoActividad, number>>;
}

export interface ResumenItinerarioViaje {
    readonly itinerarioId: string;
    readonly tituloViaje: string;
    readonly viajeroNombre: string;
    readonly totalActividadesValidas: number;
    readonly metricas: MetricasItinerario;
    readonly actividadesProcesadas: readonly ActividadViaje[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarActividad(actividad: ActividadViaje): ResultadoValidacion<ActividadViaje> {
    const errores: string[] = [];

    if (actividad.dia <= 0) {
        errores.push(`El dia de la actividad "${actividad.titulo}" debe ser mayor a 0 (Dia ${actividad.dia}).`);
    }

    if (actividad.duracionHoras <= 0 || actividad.duracionHoras > 24) {
        errores.push(`La duracion de "${actividad.titulo}" esta fuera del rango permitido (${actividad.duracionHoras}h).`);
    }

    if (actividad.costoEstimadoUSD < 0) {
        errores.push(`El costo estimado de "${actividad.titulo}" no puede ser negativo ($${actividad.costoEstimadoUSD}).`);
    }

    if (actividad.titulo.trim().length === 0 || actividad.ubicacion.trim().length === 0) {
        errores.push('La actividad debe registrar un titulo y ubicacion validos.');
    }

    return errores.length === 0
        ? { esValido: true, datos: actividad }
        : { esValido: false, errores };
}

export function validarItinerario(itinerario: ItinerarioViaje): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();

    if (itinerario.presupuestoTotalUSD <= 0) {
        advertencias.push(`Presupuesto total del viaje invalido ($${itinerario.presupuestoTotalUSD}).`);
    }

    if (itinerario.destinos.length === 0) {
        advertencias.push('El itinerario no contiene destinos asignados.');
    }

    if (itinerario.actividades.length === 0) {
        advertencias.push('El itinerario no contiene actividades programadas.');
    }

    for (const act of itinerario.actividades) {
        if (idsVistos.has(act.id)) {
            advertencias.push(`Actividad duplicada detectada: "${act.titulo}" (ID: ${act.id}).`);
        }
        idsVistos.add(act.id);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS

const TIPOS_ACTIVIDAD: readonly TipoActividad[] = [
    'Vuelo',
    'Alojamiento',
    'Excursion',
    'Transporte',
    'Gastronomia'
];

export function calcularMetricasItinerario(
    actividades: readonly ActividadViaje[],
    presupuestoTotalUSD: number,
    destinos: readonly DestinoViaje[]
): MetricasItinerario {
    const totalDias = destinos.reduce((acc, d) => acc + d.diasEstancia, 0);

    if (actividades.length === 0) {
        const desgloseVacio = TIPOS_ACTIVIDAD.reduce((acc, tipo) => {
            acc[tipo] = 0;
            return acc;
        }, {} as Record<TipoActividad, number>);

        return {
            totalActividades: 0,
            totalDias,
            costoTotalActividadesUSD: 0,
            presupuestoRestanteUSD: presupuestoTotalUSD,
            cumplePresupuesto: true,
            actividadMasCostosa: null,
            desglosePorTipo: desgloseVacio
        };
    }

    const costoTotalActividadesUSD = Number(
        actividades
            .filter((a) => a.estado !== 'Cancelado')
            .reduce((acc, a) => acc + a.costoEstimadoUSD, 0)
            .toFixed(2)
    );

    const presupuestoRestanteUSD = Number((presupuestoTotalUSD - costoTotalActividadesUSD).toFixed(2));
    const cumplePresupuesto = presupuestoRestanteUSD >= 0;

    const actividadMasCostosa = [...actividades]
        .filter((a) => a.estado !== 'Cancelado')
        .sort((a, b) => b.costoEstimadoUSD - a.costoEstimadoUSD)[0] ?? null;

    const desglosePorTipo = actividades.reduce((acc, a) => {
        acc[a.tipo] = (acc[a.tipo] ?? 0) + 1;
        return acc;
    }, TIPOS_ACTIVIDAD.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TipoActividad, number>));

    return {
        totalActividades: actividades.length,
        totalDias,
        costoTotalActividadesUSD,
        presupuestoRestanteUSD,
        cumplePresupuesto,
        actividadMasCostosa,
        desglosePorTipo
    };
}

export function procesarItinerarioViaje(itinerarioRaw: ItinerarioViaje): ResumenItinerarioViaje {
    const advertencias: string[] = [...validarItinerario(itinerarioRaw)];
    const actividadesValidas: ActividadViaje[] = [];

    for (const raw of itinerarioRaw.actividades) {
        const res = validarActividad(raw);
        if (res.esValido) {
            actividadesValidas.push(res.datos);
        } else {
            advertencias.push(...res.errores.map((err) => `Itinerario ${itinerarioRaw.id}: ${err}`));
        }
    }

    const metricas = calcularMetricasItinerario(
        actividadesValidas,
        itinerarioRaw.presupuestoTotalUSD,
        itinerarioRaw.destinos
    );

    if (!metricas.cumplePresupuesto) {
        advertencias.push(
            `Presupuesto excedido: El costo total ($${metricas.costoTotalActividadesUSD}) supera el presupuesto asignado ($${itinerarioRaw.presupuestoTotalUSD}).`
        );
    }

    return {
        itinerarioId: itinerarioRaw.id,
        tituloViaje: itinerarioRaw.tituloViaje,
        viajeroNombre: itinerarioRaw.viajeroNombre,
        totalActividadesValidas: actividadesValidas.length,
        metricas,
        actividadesProcesadas: actividadesValidas,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenItinerario(resumen: ResumenItinerarioViaje, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` ITINERARIO DE VIAJE - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Viaje               : ${resumen.tituloViaje}`);
    console.log(`Viajero             : ${resumen.viajeroNombre}`);
    console.log(`Actividades Validas : ${resumen.totalActividadesValidas}`);
    console.log(`Dias Totales        : ${resumen.metricas.totalDias} dias`);
    console.log(`Costo Actividades   : $${resumen.metricas.costoTotalActividadesUSD.toLocaleString()} USD`);
    console.log(`Presupuesto Restante: $${resumen.metricas.presupuestoRestanteUSD.toLocaleString()} USD`);
    console.log(`Estado Presupuesto  : ${resumen.metricas.cumplePresupuesto ? 'DENTRO DEL PRESUPUESTO' : 'EXCEDIDO'}`);
    console.log(`Actividad Mas Cara  : ${resumen.metricas.actividadMasCostosa ? `${resumen.metricas.actividadMasCostosa.titulo} ($${resumen.metricas.actividadMasCostosa.costoEstimadoUSD})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE ITINERARIO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE ACTIVIDADES POR TIPO:`);
    Object.entries(resumen.metricas.desglosePorTipo).forEach(([tipo, cantidad]) => {
        console.log(`   - ${tipo.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.actividadesProcesadas.map((a) => ({
            ID: a.id,
            Dia: `Dia ${a.dia}`,
            Hora: a.horaInicio,
            Titulo: a.titulo,
            Tipo: a.tipo,
            Duracion: `${a.duracionHoras}h`,
            Costo: `$${a.costoEstimadoUSD}`,
            Ubicacion: a.ubicacion,
            Estado: a.estado
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

// --- CASO 1: EuroTour 2026 (Caso Normal) ---
const itinerarioEuroTour: ItinerarioViaje = {
    id: 'ITIN-EUR-2026',
    tituloViaje: 'EuroTour Verano 2026',
    viajeroNombre: 'Jose Rodriguez',
    presupuestoTotalUSD: 3500.0,
    destinos: [
        { id: 'dest-1', ciudad: 'Paris', pais: 'Francia', diasEstancia: 3 },
        { id: 'dest-2', ciudad: 'Roma', pais: 'Italia', diasEstancia: 4 }
    ],
    actividades: [
        {
            id: 'act-01',
            dia: 1,
            titulo: 'Vuelo CDG a FCO',
            descripcion: 'Vuelo directo Paris a Roma',
            tipo: 'Vuelo',
            horaInicio: '09:00',
            duracionHoras: 2.5,
            costoEstimadoUSD: 180.0,
            ubicacion: 'Aeropuerto CDG',
            estado: 'Confirmado'
        },
        {
            id: 'act-02',
            dia: 1,
            titulo: 'Check-in Hotel Colosseo',
            descripcion: 'Alojamiento céntrico en Roma',
            tipo: 'Alojamiento',
            horaInicio: '14:00',
            duracionHoras: 1.0,
            costoEstimadoUSD: 650.0,
            ubicacion: 'Roma Centro',
            estado: 'Confirmado'
        },
        {
            id: 'act-03',
            dia: 2,
            titulo: 'Tour Guiado Coliseo y Foro Romano',
            descripcion: 'Entrada prioritaria con guia',
            tipo: 'Excursion',
            horaInicio: '10:00',
            duracionHoras: 3.5,
            costoEstimadoUSD: 85.0,
            ubicacion: 'Coliseo Romano',
            estado: 'Confirmado'
        },
        {
            id: 'act-04',
            dia: 2,
            titulo: 'Cena Trattoria Da Enzo',
            descripcion: 'Gastronomia tradicional romana',
            tipo: 'Gastronomia',
            horaInicio: '20:00',
            duracionHoras: 2.0,
            costoEstimadoUSD: 60.0,
            ubicacion: 'Trastevere',
            estado: 'Confirmado'
        }
    ]
};

// --- CASO 2: Presupuesto Excedido, Costos Negativos y Duración Anómala (Caso Límite) ---
const itinerarioLimiteCorrupto: ItinerarioViaje = {
    id: 'ITIN-FAIL-02',
    tituloViaje: 'Viaje Con Errores',
    viajeroNombre: 'Viajero Test',
    presupuestoTotalUSD: 200.0, // Presupuesto muy bajo -> Provoca exceso
    destinos: [
        { id: 'dest-3', ciudad: 'Tokio', pais: 'Japon', diasEstancia: 5 }
    ],
    actividades: [
        {
            id: 'act-05',
            dia: -1, // Dia negativo -> Invalido
            titulo: 'Vuelo Transatlantico',
            descripcion: 'Vuelo largo',
            tipo: 'Vuelo',
            horaInicio: '12:00',
            duracionHoras: 30, // Duracion > 24h -> Invalida
            costoEstimadoUSD: -100.0, // Costo negativo -> Invalido
            ubicacion: 'Aeropuerto NRT',
            estado: 'Confirmado'
        },
        {
            id: 'act-06',
            dia: 2,
            titulo: 'Tour Shibuya Sky',
            descripcion: 'Mirador nocturno',
            tipo: 'Excursion',
            horaInicio: '18:00',
            duracionHoras: 2.0,
            costoEstimadoUSD: 500.0, // Supera el presupuesto de 200 USD
            ubicacion: 'Shibuya',
            estado: 'Confirmado'
        },
        {
            id: 'act-06', // ID Duplicado
            dia: 3,
            titulo: 'Tour Shibuya Sky Repetido',
            descripcion: 'Copia de actividad',
            tipo: 'Excursion',
            horaInicio: '18:00',
            duracionHoras: 2.0,
            costoEstimadoUSD: 50.0,
            ubicacion: 'Shibuya',
            estado: 'Confirmado'
        }
    ]
};

// Ejecución
const resumenNormal = procesarItinerarioViaje(itinerarioEuroTour);
mostrarResumenItinerario(resumenNormal, 'Caso Normal - EuroTour Verano 2026');

const resumenLimite = procesarItinerarioViaje(itinerarioLimiteCorrupto);
mostrarResumenItinerario(resumenLimite, 'Caso Limite - Presupuesto Excedido y Datos Incorrectos');