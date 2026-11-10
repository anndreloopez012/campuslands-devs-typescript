
// 1. MODELADO DEL DOMINIO CON UNIONES DISCRIMINADAS (Discriminated Unions)

export type DisciplinaDeportiva = 'Futbol' | 'Baloncesto' | 'Tenis' | 'Formula1';

export type EstadoEventoDeportivo =
    | 'Programado'
    | 'EnVivo'
    | 'Finalizado'
    | 'Suspendido'
    | 'Cancelado';

// Discriminaciones de Estadísticas Específicas por Deporte
export type EstadisticasEspecificas =
    | {
        readonly disciplina: 'Futbol';
        readonly golesLocal: number;
        readonly golesVisitante: number;
        readonly tarjetasAmarillas: number;
        readonly tarjetasRojas: number;
        readonly posesionPct: number;
    }
    | {
        readonly disciplina: 'Baloncesto';
        readonly puntosLocal: number;
        readonly puntosVisitante: number;
        readonly triplesConvertidos: number;
        readonly faltasTotales: number;
        readonly rebotesTotales: number;
    }
    | {
        readonly disciplina: 'Tenis';
        readonly setsGanadosLocal: number;
        readonly setsGanadosVisitante: number;
        readonly acesTotales: number;
        readonly erroresNoForzados: number;
        readonly tieBreaksJugados: number;
    }
    | {
        readonly disciplina: 'Formula1';
        readonly posicionFinal: number;
        readonly tiempoVueltaRapidaSec: number;
        readonly paradasPits: number;
        readonly puntosObtenidos: number;
    };

export interface EventoDeportivoBase {
    readonly id: string;
    readonly codigoEvento: string;
    readonly tituloEvento: string;
    readonly equipoOAtletaLocal: string;
    readonly equipoOAtletaVisitante: string;
    readonly estado: EstadoEventoDeportivo;
    readonly fechaHora: string;
    readonly detalles: EstadisticasEspecificas;
}

// Discriminación del Estado Global del Dashboard (State Machine)
export type EstadoDashboard =
    | { readonly estado: 'Reposo'; readonly totalProcesados: 0 }
    | { readonly estado: 'CargandoDatos'; readonly timestampInicio: string }
    | { readonly estado: 'Listo'; readonly totalEventos: number; readonly ultimaActualizacion: string }
    | { readonly estado: 'Error'; readonly mensajeError: string; readonly codigoError: string };

// Eventos del Reducer de Gestión del Dashboard
export type AccionDashboard =
    | { readonly tipo: 'INICIAR_CARGA' }
    | { readonly tipo: 'REGISTRAR_EVENTO'; readonly evento: EventoDeportivoBase }
    | { readonly tipo: 'CONCLUIR_PROCESAMIENTO' }
    | { readonly tipo: 'CAPTURAR_ERROR'; readonly error: string; readonly codigo: string };

export interface MetricasDashboardMultiDeporte {
    readonly totalEventos: number;
    readonly eventosFinalizadosCount: number;
    readonly porcentajeFinalizacion: number;
    readonly eventoConMayorPuntajeOMarcador: EventoDeportivoBase | null;
    readonly desglosePorDisciplina: Readonly<Record<DisciplinaDeportiva, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoEventoDeportivo, number>>;
}

export interface ResumenDashboardDeportes {
    readonly ejecucionId: string;
    readonly nombreDashboard: string;
    readonly totalEventosValidos: number;
    readonly metricas: MetricasDashboardMultiDeporte;
    readonly eventosProcesados: readonly EventoDeportivoBase[];
    readonly advertencias: readonly string[];
    readonly estadoActualDashboard: EstadoDashboard;
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y GESTIÓN DE EVENTOS (Generics & Encapsulamiento)

export class ContenedorEventosDeportivos<T extends { readonly id: string; readonly codigoEvento: string }> {
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

// 3. VALIDACIONES Y REGLAS DE NEGOCIO POR DISCIPLINA

export function validarEstadisticasEspecificas(
    detalles: EstadisticasEspecificas,
    titulo: string
): readonly string[] {
    const errores: string[] = [];

    switch (detalles.disciplina) {
        case 'Futbol': {
            if (detalles.golesLocal < 0 || detalles.golesVisitante < 0) {
                errores.push(`Marcador de futbol negativo (${detalles.golesLocal}-${detalles.golesVisitante}) en "${titulo}".`);
            }
            if (detalles.posesionPct < 0 || detalles.posesionPct > 100) {
                errores.push(`Porcentaje de posesion fuera de rango (${detalles.posesionPct}%) en "${titulo}".`);
            }
            break;
        }
        case 'Baloncesto': {
            if (detalles.puntosLocal < 0 || detalles.puntosVisitante < 0) {
                errores.push(`Puntaje de baloncesto negativo (${detalles.puntosLocal}-${detalles.puntosVisitante}) en "${titulo}".`);
            }
            if (detalles.triplesConvertidos < 0) {
                errores.push(`Cantidad de triples negativa (${detalles.triplesConvertidos}) en "${titulo}".`);
            }
            break;
        }
        case 'Tenis': {
            if (detalles.setsGanadosLocal < 0 || detalles.setsGanadosVisitante < 0) {
                errores.push(`Sets de tenis negativos (${detalles.setsGanadosLocal}-${detalles.setsGanadosVisitante}) en "${titulo}".`);
            }
            if (detalles.setsGanadosLocal + detalles.setsGanadosVisitante > 5) {
                errores.push(`Suma total de sets invalida en gran slam para "${titulo}".`);
            }
            break;
        }
        case 'Formula1': {
            if (detalles.posicionFinal <= 0 || detalles.posicionFinal > 30) {
                errores.push(`Posicion final de F1 fuera de rango (${detalles.posicionFinal}) en "${titulo}".`);
            }
            if (detalles.tiempoVueltaRapidaSec <= 0) {
                errores.push(`Tiempo de vuelta rapida invalido (${detalles.tiempoVueltaRapidaSec} s) en "${titulo}".`);
            }
            break;
        }
    }

    return errores;
}

export function validarEventoDeportivo(evento: EventoDeportivoBase): ResultadoValidacion<EventoDeportivoBase> {
    const errores: string[] = [];

    if (evento.equipoOAtletaLocal.trim().length === 0 || evento.equipoOAtletaVisitante.trim().length === 0) {
        errores.push(`El evento "${evento.codigoEvento}" debe incluir participantes validos.`);
    }

    const erroresDetalles = validarEstadisticasEspecificas(evento.detalles, evento.tituloEvento);
    if (erroresDetalles.length > 0) {
        errores.push(...erroresDetalles);
    }

    return errores.length === 0
        ? { esValido: true, datos: evento }
        : { esValido: false, errores };
}

// 4. MÁQUINA DE ESTADOS Y REDUCER DEL DASHBOARD

export function reducerDashboard(
    estadoActual: EstadoDashboard,
    accion: AccionDashboard
): EstadoDashboard {
    switch (accion.tipo) {
        case 'INICIAR_CARGA': {
            return {
                estado: 'CargandoDatos',
                timestampInicio: new Date().toISOString()
            };
        }
        case 'CONCLUIR_PROCESAMIENTO': {
            if (estadoActual.estado === 'CargandoDatos' || estadoActual.estado === 'Listo') {
                return {
                    estado: 'Listo',
                    totalEventos: estadoActual.estado === 'Listo' ? estadoActual.totalEventos + 1 : 1,
                    ultimaActualizacion: new Date().toISOString()
                };
            }
            return estadoActual;
        }
        case 'CAPTURAR_ERROR': {
            return {
                estado: 'Error',
                mensajeError: accion.error,
                codigoError: accion.codigo
            };
        }
        default:
            return estadoActual;
    }
}

// 5. TRANSFORMACIÓN Y CÁLCULOS MÉTRICOS MULTI-DEPORTE (reduce & Record)

const DISCIPLINAS_DEPORTIVAS: readonly DisciplinaDeportiva[] = [
    'Futbol',
    'Baloncesto',
    'Tenis',
    'Formula1'
];

const ESTADOS_EVENTO: readonly EstadoEventoDeportivo[] = [
    'Programado',
    'EnVivo',
    'Finalizado',
    'Suspendido',
    'Cancelado'
];

export function obtenerPuntajeImpactoEvento(evento: EventoDeportivoBase): number {
    switch (evento.detalles.disciplina) {
        case 'Futbol':
            return evento.detalles.golesLocal + evento.detalles.golesVisitante;
        case 'Baloncesto':
            return evento.detalles.puntosLocal + evento.detalles.puntosVisitante;
        case 'Tenis':
            return (evento.detalles.setsGanadosLocal + evento.detalles.setsGanadosVisitante) * 10;
        case 'Formula1':
            return evento.detalles.puntosObtenidos * 5;
    }
}

export function calcularMetricasMultiDeporte(
    eventos: readonly EventoDeportivoBase[]
): MetricasDashboardMultiDeporte {
    if (eventos.length === 0) {
        const desgloseDiscVacio = DISCIPLINAS_DEPORTIVAS.reduce((acc, d) => ({ ...acc, [d]: 0 }), {} as Record<DisciplinaDeportiva, number>);
        const desgloseEstVacio = ESTADOS_EVENTO.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoEventoDeportivo, number>);

        return {
            totalEventos: 0,
            eventosFinalizadosCount: 0,
            porcentajeFinalizacion: 0,
            eventoConMayorPuntajeOMarcador: null,
            desglosePorDisciplina: desgloseDiscVacio,
            desglosePorEstado: desgloseEstVacio
        };
    }

    const finalizados = eventos.filter((e) => e.estado === 'Finalizado');
    const eventosFinalizadosCount = finalizados.length;
    const porcentajeFinalizacion = Number(((eventosFinalizadosCount / eventos.length) * 100).toFixed(1));

    const eventoConMayorPuntajeOMarcador = [...eventos].sort(
        (a, b) => obtenerPuntajeImpactoEvento(b) - obtenerPuntajeImpactoEvento(a)
    )[0] ?? null;

    // Agrupación mediante reduce
    const desglosePorDisciplina = eventos.reduce((acc, e) => {
        acc[e.detalles.disciplina] = (acc[e.detalles.disciplina] ?? 0) + 1;
        return acc;
    }, DISCIPLINAS_DEPORTIVAS.reduce((acc, d) => ({ ...acc, [d]: 0 }), {} as Record<DisciplinaDeportiva, number>));

    const desglosePorEstado = eventos.reduce((acc, e) => {
        acc[e.estado] = (acc[e.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_EVENTO.reduce((acc, est) => ({ ...acc, [est]: 0 }), {} as Record<EstadoEventoDeportivo, number>));

    return {
        totalEventos: eventos.length,
        eventosFinalizadosCount,
        porcentajeFinalizacion,
        eventoConMayorPuntajeOMarcador,
        desglosePorDisciplina,
        desglosePorEstado
    };
}

export class ServicioDashboardMultiDeporte {
    private readonly contenedor = new ContenedorEventosDeportivos<EventoDeportivoBase>();
    private estadoDashboard: EstadoDashboard = { estado: 'Reposo', totalProcesados: 0 };

    public async procesarDashboardAsync(
        nombreDashboard: string,
        eventosRaw: readonly EventoDeportivoBase[]
    ): Promise<ResumenDashboardDeportes> {
        const advertencias: string[] = [];
        this.estadoDashboard = reducerDashboard(this.estadoDashboard, { tipo: 'INICIAR_CARGA' });

        // Simulación asíncrona de ingestión de APIs deportivas en tiempo real
        await new Promise((resolve) => setTimeout(resolve, 15));

        if (eventosRaw.length === 0) {
            advertencias.push(`El dashboard "${nombreDashboard}" no recibió eventos deportivos para procesar.`);
        }

        const idsVistos = new Set<string>();
        const codigosVistos = new Set<string>();

        for (const rawEv of eventosRaw) {
            const valRes = validarEventoDeportivo(rawEv);

            if (!valRes.esValido) {
                advertencias.push(...valRes.errores);
            } else if (idsVistos.has(rawEv.id)) {
                advertencias.push(`Evento duplicado detectado por ID: ${rawEv.id} (${rawEv.tituloEvento}).`);
            } else if (codigosVistos.has(rawEv.codigoEvento)) {
                advertencias.push(`Código de evento duplicado: ${rawEv.codigoEvento}.`);
            } else {
                idsVistos.add(rawEv.id);
                codigosVistos.add(rawEv.codigoEvento);
                this.contenedor.agregar(rawEv);
                this.estadoDashboard = reducerDashboard(this.estadoDashboard, { tipo: 'CONCLUIR_PROCESAMIENTO' });
            }
        }

        const eventosValidos = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasMultiDeporte(eventosValidos);

        const suspendidos = eventosValidos.filter((e) => e.estado === 'Suspendido' || e.estado === 'Cancelado');
        if (suspendidos.length > 0) {
            advertencias.push(
                `Alerta de itinerario: Se registraron ${suspendidos.length} evento(s) suspendidos o cancelados.`
            );
        }

        return {
            ejecucionId: `DASH-EXEC-${Date.now()}`,
            nombreDashboard,
            totalEventosValidos: eventosValidos.length,
            metricas,
            eventosProcesados: eventosValidos,
            advertencias,
            estadoActualDashboard: this.estadoDashboard
        };
    }
}

// 6. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenDashboard(resumen: ResumenDashboardDeportes, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` DASHBOARD MULTI-DEPORTE - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Nombre Dashboard    : ${resumen.nombreDashboard}`);
    console.log(`Ejecución ID        : ${resumen.ejecucionId}`);
    console.log(`Eventos Validados   : ${resumen.totalEventosValidos}`);
    console.log(`Tasa Finalización   : ${resumen.metricas.eventosFinalizadosCount} de ${resumen.metricas.totalEventos} (${resumen.metricas.porcentajeFinalizacion}%)`);
    console.log(`Evento Destacado    : ${resumen.metricas.eventoConMayorPuntajeOMarcador ? `"${resumen.metricas.eventoConMayorPuntajeOMarcador.tituloEvento}" (${resumen.metricas.eventoConMayorPuntajeOMarcador.detalles.disciplina})` : 'N/A'}`);
    console.log(`Estado Dashboard    : ${resumen.estadoActualDashboard.estado}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y ALERTAS DE REPETICIÓN (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR DISCIPLINA DEPORTIVA:`);
    Object.entries(resumen.metricas.desglosePorDisciplina).forEach(([disc, cantidad]) => {
        console.log(`   - ${disc.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.eventosProcesados.map((e) => ({
            Código: e.codigoEvento,
            Evento: e.tituloEvento,
            Disciplina: e.detalles.disciplina,
            Participantes: `${e.equipoOAtletaLocal} vs ${e.equipoOAtletaVisitante}`,
            Estado: e.estado,
            DetalleResumen:
                e.detalles.disciplina === 'Futbol'
                    ? `${e.detalles.golesLocal}-${e.detalles.golesVisitante} (Pos: ${e.detalles.posesionPct}%)`
                    : e.detalles.disciplina === 'Baloncesto'
                        ? `${e.detalles.puntosLocal}-${e.detalles.puntosVisitante} (3pts: ${e.detalles.triplesConvertidos})`
                        : e.detalles.disciplina === 'Tenis'
                            ? `${e.detalles.setsGanadosLocal}-${e.detalles.setsGanadosVisitante} Sets (Aces: ${e.detalles.acesTotales})`
                            : `Posición P${e.detalles.posicionFinal} (${e.detalles.puntosObtenidos} pts)`
        }))
    );
}

// 7. CASOS DE PRUEBA (Caso Normal y Caso Límite / Falla Async/Await)

const e1: EventoDeportivoBase = {
    id: 'evt-01',
    codigoEvento: 'FUT-CLICO-01',
    tituloEvento: 'El Clásico LaLiga',
    equipoOAtletaLocal: 'Real Madrid',
    equipoOAtletaVisitante: 'FC Barcelona',
    estado: 'Finalizado',
    fechaHora: '2026-11-08T20:00:00Z',
    detalles: {
        disciplina: 'Futbol',
        golesLocal: 3,
        golesVisitante: 2,
        tarjetasAmarillas: 4,
        tarjetasRojas: 0,
        posesionPct: 54.5
    }
};

const e2: EventoDeportivoBase = {
    id: 'evt-02',
    codigoEvento: 'BAL-NBA-02',
    tituloEvento: 'Finales Conferencia Este',
    equipoOAtletaLocal: 'Boston Celtics',
    equipoOAtletaVisitante: 'Miami Heat',
    estado: 'Finalizado',
    fechaHora: '2026-11-09T01:30:00Z',
    detalles: {
        disciplina: 'Baloncesto',
        puntosLocal: 112,
        puntosVisitante: 108,
        triplesConvertidos: 28,
        faltasTotales: 34,
        rebotesTotales: 92
    }
};

const e3: EventoDeportivoBase = {
    id: 'evt-03',
    codigoEvento: 'TEN-WIMB-03',
    tituloEvento: 'Gran Final Masculina',
    equipoOAtletaLocal: 'Carlos Alcaraz',
    equipoOAtletaVisitante: 'Jannik Sinner',
    estado: 'EnVivo',
    fechaHora: '2026-11-09T14:00:00Z',
    detalles: {
        disciplina: 'Tenis',
        setsGanadosLocal: 2,
        setsGanadosVisitante: 1,
        acesTotales: 19,
        erroresNoForzados: 14,
        tieBreaksJugados: 1
    }
};

const e4: EventoDeportivoBase = {
    id: 'evt-04',
    codigoEvento: 'F1-MONACO-04',
    tituloEvento: 'Gran Premio de Mónaco F1',
    equipoOAtletaLocal: 'Red Bull Racing (Max Verstappen)',
    equipoOAtletaVisitante: 'Scuderia Ferrari (Charles Leclerc)',
    estado: 'Finalizado',
    fechaHora: '2026-11-08T13:00:00Z',
    detalles: {
        disciplina: 'Formula1',
        posicionFinal: 1,
        tiempoVueltaRapidaSec: 72.45,
        paradasPits: 2,
        puntosObtenidos: 26
    }
};

// --- CASO 1: Cobertura Multi-Deporte Global (Caso Normal) ---
const servicioNormal = new ServicioDashboardMultiDeporte();

// --- CASO 2: Marcador Negativo, Posición Inválida y Evento Duplicado (Caso Límite) ---
const eventoCorrupto: EventoDeportivoBase = {
    id: 'evt-99',
    codigoEvento: 'ERR-SPORT-99',
    tituloEvento: 'Evento Con Datos Inconsistentes',
    equipoOAtletaLocal: '',
    equipoOAtletaVisitante: 'Equipo B',
    estado: 'Suspendido',
    fechaHora: '2026-11-09T00:00:00Z',
    detalles: {
        disciplina: 'Futbol',
        golesLocal: -2, // Marcador negativo -> Inválido
        golesVisitante: 1,
        tarjetasAmarillas: 0,
        tarjetasRojas: 0,
        posesionPct: 150 // Posesión > 100% -> Inválido
    }
};

const servicioLimite = new ServicioDashboardMultiDeporte();

async function ejecutarPruebas(): Promise<void> {
    // Ejecución Caso 1
    const resumenNormal = await servicioNormal.procesarDashboardAsync('Global Sports Center 2026', [e1, e2, e3, e4]);
    mostrarResumenDashboard(resumenNormal, 'Caso Normal - Cobertura Multi-Deporte Global');

    // Ejecución Caso 2
    const resumenLimite = await servicioLimite.procesarDashboardAsync('Dashboard Limite Con Errores', [e1, eventoCorrupto, e1]);
    mostrarResumenDashboard(resumenLimite, 'Caso Limite - Datos Inconsistentes y Evento Duplicado');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecucion:', err));