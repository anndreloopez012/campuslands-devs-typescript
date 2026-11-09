
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type CategoriaVehiculo = 'F1' | 'GT3' | 'MotoGP' | 'Endurance';
export type EstadoPiloto = 'Finalizado' | 'EnCarrera' | 'Retirado' | 'Descalificado';

export interface RegistroVuelta {
    readonly numeroVuelta: number;
    readonly tiempoMs: number;
    readonly sector1Ms: number;
    readonly sector2Ms: number;
    readonly sector3Ms: number;
    readonly esValida: boolean;
    readonly fuePitStop: boolean;
}

export interface PilotoCarrera {
    readonly id: string;
    readonly nombre: string;
    readonly equipo: string;
    readonly categoria: CategoriaVehiculo;
    readonly estado: EstadoPiloto;
    readonly vueltas: readonly RegistroVuelta[];
}

export interface CircuitoCarrera {
    readonly id: string;
    readonly nombreCircuito: string;
    readonly pais: string;
    readonly longitudKm: number;
    readonly totalVueltasProgramadas: number;
    readonly pilotos: readonly PilotoCarrera[];
}

export interface MetricasPiloto {
    readonly posicionFinal: number;
    readonly vueltasCompletadas: number;
    readonly tiempoTotalMs: number;
    readonly tiempoPromedioVueltaMs: number;
    readonly mejorVuelta: RegistroVuelta | null;
    readonly totalPitStops: number;
}

export interface PilotoProcesado {
    readonly piloto: PilotoCarrera;
    readonly metricas: MetricasPiloto;
}

export interface ResumenSimulacionCarrera {
    readonly circuitoId: string;
    readonly nombreCircuito: string;
    readonly totalPilotos: number;
    readonly vueltaRapidaCarrera: {
        readonly pilotoNombre: string;
        readonly vuelta: RegistroVuelta;
    } | null;
    readonly ganador: PilotoProcesado | null;
    readonly clasificacionFinal: readonly PilotoProcesado[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarVuelta(vuelta: RegistroVuelta): ResultadoValidacion<RegistroVuelta> {
    const errores: string[] = [];

    if (vuelta.numeroVuelta <= 0) {
        errores.push(`Numero de vuelta invalido (${vuelta.numeroVuelta}).`);
    }

    if (vuelta.tiempoMs <= 0 || vuelta.sector1Ms <= 0 || vuelta.sector2Ms <= 0 || vuelta.sector3Ms <= 0) {
        errores.push(`Tiempos de sectores o vuelta no pueden ser menores o iguales a 0 en la vuelta ${vuelta.numeroVuelta}.`);
    }

    const sumaSectores = vuelta.sector1Ms + vuelta.sector2Ms + vuelta.sector3Ms;
    if (Math.abs(sumaSectores - vuelta.tiempoMs) > 10) {
        errores.push(`Incoherencia de sectores en vuelta ${vuelta.numeroVuelta}: Suma (${sumaSectores}ms) difiere del total (${vuelta.tiempoMs}ms).`);
    }

    return errores.length === 0
        ? { esValido: true, datos: vuelta }
        : { esValido: false, errores };
}

export function validarPiloto(piloto: PilotoCarrera, totalVueltas: number): readonly string[] {
    const advertencias: string[] = [];

    if (piloto.vueltas.length > totalVueltas) {
        advertencias.push(`El piloto ${piloto.nombre} registra mas vueltas (${piloto.vueltas.length}) que las programadas (${totalVueltas}).`);
    }

    const numerosVueltaVistos = new Set<number>();
    for (const v of piloto.vueltas) {
        if (numerosVueltaVistos.has(v.numeroVuelta)) {
            advertencias.push(`Vuelta duplicada detectada en el piloto ${piloto.nombre} (Vuelta ${v.numeroVuelta}).`);
        }
        numerosVueltaVistos.add(v.numeroVuelta);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS DE CARRERA

export function calcularMetricasPiloto(piloto: PilotoCarrera): Omit<MetricasPiloto, 'posicionFinal'> {
    const vueltasValidas = piloto.vueltas.filter((v) => v.esValida);
    const vueltasCompletadas = piloto.vueltas.length;
    const tiempoTotalMs = piloto.vueltas.reduce((acc, v) => acc + v.tiempoMs, 0);

    const tiempoPromedioVueltaMs = vueltasCompletadas > 0
        ? Number((tiempoTotalMs / vueltasCompletadas).toFixed(0))
        : 0;

    const mejorVuelta = vueltasValidas.length > 0
        ? [...vueltasValidas].sort((a, b) => a.tiempoMs - b.tiempoMs)[0]
        : null;

    const totalPitStops = piloto.vueltas.filter((v) => v.fuePitStop).length;

    return {
        vueltasCompletadas,
        tiempoTotalMs,
        tiempoPromedioVueltaMs,
        mejorVuelta,
        totalPitStops
    };
}

export function procesarSimulacionCarrera(circuitoRaw: CircuitoCarrera): ResumenSimulacionCarrera {
    const advertencias: string[] = [];
    const pilotosProcesadosPrev: { piloto: PilotoCarrera; metricasBase: Omit<MetricasPiloto, 'posicionFinal'> }[] = [];

    for (const p of circuitoRaw.pilotos) {
        const advPiloto = validarPiloto(p, circuitoRaw.totalVueltasProgramadas);
        advertencias.push(...advPiloto);

        for (const v of p.vueltas) {
            const resV = validarVuelta(v);
            if (!resV.esValido) {
                advertencias.push(...resV.errores.map((err) => `${p.nombre}: ${err}`));
            }
        }

        const metricasBase = calcularMetricasPiloto(p);
        pilotosProcesadosPrev.push({ piloto: p, metricasBase });
    }

    // Criterio de clasificacion oficial:
    // 1. Estado (Finalizado / EnCarrera > Retirado > Descalificado)
    // 2. Mayor numero de vueltas completadas
    // 3. Menor tiempo total acumulado
    const ordenados = [...pilotosProcesadosPrev].sort((a, b) => {
        if (a.piloto.estado === 'Descalificado') return 1;
        if (b.piloto.estado === 'Descalificado') return -1;
        if (a.piloto.estado === 'Retirado' && b.piloto.estado !== 'Retirado') return 1;
        if (b.piloto.estado === 'Retirado' && a.piloto.estado !== 'Retirado') return -1;

        if (b.metricasBase.vueltasCompletadas !== a.metricasBase.vueltasCompletadas) {
            return b.metricasBase.vueltasCompletadas - a.metricasBase.vueltasCompletadas;
        }
        return a.metricasBase.tiempoTotalMs - b.metricasBase.tiempoTotalMs;
    });

    const clasificacionFinal: readonly PilotoProcesado[] = ordenados.map((item, idx) => ({
        piloto: item.piloto,
        metricas: {
            ...item.metricasBase,
            posicionFinal: idx + 1
        }
    }));

    // Vuelta rapida global de la carrera
    let vueltaRapidaCarrera: { pilotoNombre: string; vuelta: RegistroVuelta } | null = null;
    let menorTiempoMs = Infinity;

    for (const p of clasificacionFinal) {
        if (p.piloto.estado === 'Descalificado') continue;
        if (p.metricas.mejorVuelta && p.metricas.mejorVuelta.tiempoMs < menorTiempoMs) {
            menorTiempoMs = p.metricas.mejorVuelta.tiempoMs;
            vueltaRapidaCarrera = {
                pilotoNombre: p.piloto.nombre,
                vuelta: p.metricas.mejorVuelta
            };
        }
    }

    const ganador = clasificacionFinal.find((p) => p.piloto.estado === 'Finalizado') ?? null;

    return {
        circuitoId: circuitoRaw.id,
        nombreCircuito: circuitoRaw.nombreCircuito,
        totalPilotos: circuitoRaw.pilotos.length,
        vueltaRapidaCarrera,
        ganador,
        clasificacionFinal,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function formatearTiempo(ms: number): string {
    if (ms <= 0) return 'N/A';
    const minutos = Math.floor(ms / 60000);
    const segundos = Math.floor((ms % 60000) / 1000);
    const milisegundos = ms % 1000;
    return `${minutos}:${segundos.toString().padStart(2, '0')}.${milisegundos.toString().padStart(3, '0')}`;
}

export function mostrarResumenCarrera(resumen: ResumenSimulacionCarrera, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` SIMULADOR DE CARRERA POR VUELTAS - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Circuito            : ${resumen.nombreCircuito}`);
    console.log(`Pilotos Participantes: ${resumen.totalPilotos}`);
    console.log(`Ganador de la Carrera: ${resumen.ganador ? `${resumen.ganador.piloto.nombre} (${resumen.ganador.piloto.equipo})` : 'N/A'}`);
    console.log(`Vuelta Rapida        : ${resumen.vueltaRapidaCarrera ? `${resumen.vueltaRapidaCarrera.pilotoNombre} - ${formatearTiempo(resumen.vueltaRapidaCarrera.vuelta.tiempoMs)} (Vuelta ${resumen.vueltaRapidaCarrera.vuelta.numeroVuelta})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE CARRERA (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`CLASIFICACION FINAL:`);
    console.table(
        resumen.clasificacionFinal.map((p) => ({
            Pos: `#${p.metricas.posicionFinal}`,
            Piloto: p.piloto.nombre,
            Equipo: p.piloto.equipo,
            Estado: p.piloto.estado,
            Vueltas: p.metricas.vueltasCompletadas,
            'Tiempo Total': formatearTiempo(p.metricas.tiempoTotalMs),
            'Prom. Vuelta': formatearTiempo(p.metricas.tiempoPromedioVueltaMs),
            'Mejor Vuelta': p.metricas.mejorVuelta ? formatearTiempo(p.metricas.mejorVuelta.tiempoMs) : 'N/A',
            'Pit Stops': p.metricas.totalPitStops
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

// --- CASO 1: Gran Premio F1 de 3 Vueltas (Caso Normal) ---
const circuitoNormal: CircuitoCarrera = {
    id: 'CIR-SPA-2026',
    nombreCircuito: 'Circuit de Spa-Francorchamps',
    pais: 'Belgica',
    longitudKm: 7.004,
    totalVueltasProgramadas: 3,
    pilotos: [
        {
            id: 'driver-1',
            nombre: 'Max Verstappen',
            equipo: 'Red Bull Racing',
            categoria: 'F1',
            estado: 'Finalizado',
            vueltas: [
                { numeroVuelta: 1, tiempoMs: 108500, sector1Ms: 31200, sector2Ms: 44100, sector3Ms: 33200, esValida: true, fuePitStop: false },
                { numeroVuelta: 2, tiempoMs: 106200, sector1Ms: 30800, sector2Ms: 43200, sector3Ms: 32200, esValida: true, fuePitStop: false },
                { numeroVuelta: 3, tiempoMs: 105800, sector1Ms: 30500, sector2Ms: 43100, sector3Ms: 32200, esValida: true, fuePitStop: false }
            ]
        },
        {
            id: 'driver-2',
            nombre: 'Lando Norris',
            equipo: 'McLaren F1',
            categoria: 'F1',
            estado: 'Finalizado',
            vueltas: [
                { numeroVuelta: 1, tiempoMs: 109100, sector1Ms: 31500, sector2Ms: 44200, sector3Ms: 33400, esValida: true, fuePitStop: false },
                { numeroVuelta: 2, tiempoMs: 106000, sector1Ms: 30700, sector2Ms: 43100, sector3Ms: 32200, esValida: true, fuePitStop: false },
                { numeroVuelta: 3, tiempoMs: 106400, sector1Ms: 30900, sector2Ms: 43200, sector3Ms: 32300, esValida: true, fuePitStop: false }
            ]
        },
        {
            id: 'driver-3',
            nombre: 'Charles Leclerc',
            equipo: 'Scuderia Ferrari',
            categoria: 'F1',
            estado: 'Finalizado',
            vueltas: [
                { numeroVuelta: 1, tiempoMs: 109800, sector1Ms: 31700, sector2Ms: 44500, sector3Ms: 33600, esValida: true, fuePitStop: false },
                { numeroVuelta: 2, tiempoMs: 125000, sector1Ms: 31000, sector2Ms: 61500, sector3Ms: 32500, esValida: true, fuePitStop: true },
                { numeroVuelta: 3, tiempoMs: 106100, sector1Ms: 30600, sector2Ms: 43200, sector3Ms: 32300, esValida: true, fuePitStop: false }
            ]
        }
    ]
};

// --- CASO 2: Carrera con Retiro (DNF) y Tiempos Corruptos (Caso Límite) ---
const circuitoLimiteCorrupto: CircuitoCarrera = {
    id: 'CIR-MON-2026',
    nombreCircuito: 'Circuit de Monaco',
    pais: 'Monaco',
    longitudKm: 3.337,
    totalVueltasProgramadas: 3,
    pilotos: [
        {
            id: 'driver-4',
            nombre: 'Fernando Alonso',
            equipo: 'Aston Martin',
            categoria: 'F1',
            estado: 'Retirado',
            vueltas: [
                { numeroVuelta: 1, tiempoMs: 78500, sector1Ms: 21500, sector2Ms: 35000, sector3Ms: 22000, esValida: true, fuePitStop: false }
            ]
        },
        {
            id: 'driver-5',
            nombre: 'Piloto Invalido',
            equipo: 'Team Corrupto',
            categoria: 'GT3',
            estado: 'Descalificado',
            vueltas: [
                { numeroVuelta: 1, tiempoMs: 50000, sector1Ms: 20000, sector2Ms: 20000, sector3Ms: 50000, esValida: false, fuePitStop: false }
            ]
        }
    ]
};

// Ejecución
const resumenNormal = procesarSimulacionCarrera(circuitoNormal);
mostrarResumenCarrera(resumenNormal, 'Caso Normal - Gran Premio de Spa-Francorchamps');

const resumenLimite = procesarSimulacionCarrera(circuitoLimiteCorrupto);
mostrarResumenCarrera(resumenLimite, 'Caso Limite - Retiros DNF y Tiempos Incoherentes');