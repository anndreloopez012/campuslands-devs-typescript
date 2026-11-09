// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type EsquinaPeleador = 'Roja' | 'Azul';
export type CategoriaPeso = 'Pluma' | 'Ligero' | 'Welter' | 'Mediano' | 'SemiPesado' | 'Pesado';
export type TipoDecision = 'DU' | 'DM' | 'DD' | 'KO' | 'TKO' | 'Empate' | 'SinDecision';

export interface PeleadorKickboxing {
    readonly id: string;
    readonly nombre: string;
    readonly esquina: EsquinaPeleador;
    readonly pesoKg: number;
    readonly categoria: CategoriaPeso;
}

export interface PuntuacionRound {
    readonly numeroRound: number;
    readonly puntosRoja: number; // Evaluacion de 0 a 10 (Must System)
    readonly puntosAzul: number; // Evaluacion de 0 a 10 (Must System)
    readonly caidasRoja: number;
    readonly caidasAzul: number;
    readonly penalizacionesRoja: number;
    readonly penalizacionesAzul: number;
}

export interface TarjetaJuez {
    readonly juezId: string;
    readonly juezNombre: string;
    readonly rondas: readonly PuntuacionRound[];
}

export interface CombateKickboxing {
    readonly id: string;
    readonly titulo: string;
    readonly totalRondas: number;
    readonly peleadorRojo: PeleadorKickboxing;
    readonly peleadorAzul: PeleadorKickboxing;
    readonly tarjetasJueces: readonly TarjetaJuez[];
    readonly finalizacionAnticipada?: {
        readonly tipo: 'KO' | 'TKO';
        readonly esquinaGanadora: EsquinaPeleador;
        readonly roundFinalizacion: number;
    };
}

export interface PuntuacionTotalJuez {
    readonly juezId: string;
    readonly juezNombre: string;
    readonly totalRoja: number;
    readonly totalAzul: number;
    readonly ganadorJuez: EsquinaPeleador | 'Empate';
}

export interface MetricasCombate {
    readonly tarjetasTotalesJueces: readonly PuntuacionTotalJuez[];
    readonly totalPuntosRoja: number;
    readonly totalPuntosAzul: number;
    readonly votosRoja: number;
    readonly votosAzul: number;
    readonly votosEmpate: number;
    readonly tipoDecision: TipoDecision;
    readonly esquinaGanadora: EsquinaPeleador | 'Empate';
}

export interface ResumenCombateKickboxing {
    readonly combateId: string;
    readonly titulo: string;
    readonly peleadorRojo: string;
    readonly peleadorAzul: string;
    readonly metricas: MetricasCombate;
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarPuntuacionRound(round: PuntuacionRound): ResultadoValidacion<PuntuacionRound> {
    const errores: string[] = [];

    if (round.numeroRound <= 0) {
        errores.push(`Numero de round invalido (${round.numeroRound}).`);
    }

    if (round.puntosRoja < 0 || round.puntosAzul < 0 || round.puntosRoja > 10 || round.puntosAzul > 10) {
        errores.push(`Puntuacion de round ${round.numeroRound} fuera del rango de 0 a 10 (${round.puntosRoja} - ${round.puntosAzul}).`);
    }

    if (round.caidasRoja < 0 || round.caidasAzul < 0) {
        errores.push(`Conteo de caidas negativo en el round ${round.numeroRound}.`);
    }

    if (round.penalizacionesRoja < 0 || round.penalizacionesAzul < 0) {
        errores.push(`Penalizaciones negativas en el round ${round.numeroRound}.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: round }
        : { esValido: false, errores };
}

export function validarCombate(combate: CombateKickboxing): readonly string[] {
    const advertencias: string[] = [];

    if (combate.totalRondas <= 0 || combate.totalRondas > 12) {
        advertencias.push(`Numero total de rondas fuera del reglamento (${combate.totalRondas}).`);
    }

    if (combate.peleadorRojo.esquina !== 'Roja' || combate.peleadorAzul.esquina !== 'Azul') {
        advertencias.push('Asignacion de esquinas inconsistente entre los peleadores.');
    }

    if (combate.tarjetasJueces.length !== 3 && !combate.finalizacionAnticipada) {
        advertencias.push(`Un combate decidido por tarjetas requiere exactamente 3 jueces (Registrados: ${combate.tarjetasJueces.length}).`);
    }

    for (const tarjeta of combate.tarjetasJueces) {
        if (tarjeta.rondas.length !== combate.totalRondas && !combate.finalizacionAnticipada) {
            advertencias.push(`La tarjeta del juez ${tarjeta.juezNombre} registra ${tarjeta.rondas.length} rondas de ${combate.totalRondas} requeridas.`);
        }
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS DE MARCADOR

export function calcularTotalTarjetaJuez(tarjeta: TarjetaJuez): PuntuacionTotalJuez {
    let totalRoja = 0;
    let totalAzul = 0;

    for (const round of tarjeta.rondas) {
        const netRoja = Math.max(0, round.puntosRoja - round.caidasRoja - round.penalizacionesRoja);
        const netAzul = Math.max(0, round.puntosAzul - round.caidasAzul - round.penalizacionesAzul);
        totalRoja += netRoja;
        totalAzul += netAzul;
    }

    let ganadorJuez: EsquinaPeleador | 'Empate' = 'Empate';
    if (totalRoja > totalAzul) {
        ganadorJuez = 'Roja';
    } else if (totalAzul > totalRoja) {
        ganadorJuez = 'Azul';
    }

    return {
        juezId: tarjeta.juezId,
        juezNombre: tarjeta.juezNombre,
        totalRoja,
        totalAzul,
        ganadorJuez
    };
}

export function determinarResultadoDecision(tarjetasTotales: readonly PuntuacionTotalJuez[]): {
    readonly tipoDecision: TipoDecision;
    readonly esquinaGanadora: EsquinaPeleador | 'Empate';
    readonly votosRoja: number;
    readonly votosAzul: number;
    readonly votosEmpate: number;
} {
    let votosRoja = 0;
    let votosAzul = 0;
    let votosEmpate = 0;

    for (const t of tarjetasTotales) {
        if (t.ganadorJuez === 'Roja') votosRoja++;
        else if (t.ganadorJuez === 'Azul') votosAzul++;
        else votosEmpate++;
    }

    if (votosRoja === 3) {
        return { tipoDecision: 'DU', esquinaGanadora: 'Roja', votosRoja, votosAzul, votosEmpate };
    }
    if (votosAzul === 3) {
        return { tipoDecision: 'DU', esquinaGanadora: 'Azul', votosRoja, votosAzul, votosEmpate };
    }

    if (votosRoja === 2 && votosEmpate === 1) {
        return { tipoDecision: 'DM', esquinaGanadora: 'Roja', votosRoja, votosAzul, votosEmpate };
    }
    if (votosAzul === 2 && votosEmpate === 1) {
        return { tipoDecision: 'DM', esquinaGanadora: 'Azul', votosRoja, votosAzul, votosEmpate };
    }

    if (votosRoja === 2 && votosAzul === 1) {
        return { tipoDecision: 'DD', esquinaGanadora: 'Roja', votosRoja, votosAzul, votosEmpate };
    }
    if (votosAzul === 2 && votosRoja === 1) {
        return { tipoDecision: 'DD', esquinaGanadora: 'Azul', votosRoja, votosAzul, votosEmpate };
    }

    return { tipoDecision: 'Empate', esquinaGanadora: 'Empate', votosRoja, votosAzul, votosEmpate };
}

export function procesarMarcadorKickboxing(combateRaw: CombateKickboxing): ResumenCombateKickboxing {
    const advertencias: string[] = [...validarCombate(combateRaw)];

    for (const tarjeta of combateRaw.tarjetasJueces) {
        for (const round of tarjeta.rondas) {
            const resRound = validarPuntuacionRound(round);
            if (!resRound.esValido) {
                advertencias.push(...resRound.errores);
            }
        }
    }

    if (combateRaw.finalizacionAnticipada) {
        const { tipo, esquinaGanadora } = combateRaw.finalizacionAnticipada;
        return {
            combateId: combateRaw.id,
            titulo: combateRaw.titulo,
            peleadorRojo: combateRaw.peleadorRojo.nombre,
            peleadorAzul: combateRaw.peleadorAzul.nombre,
            metricas: {
                tarjetasTotalesJueces: [],
                totalPuntosRoja: 0,
                totalPuntosAzul: 0,
                votosRoja: esquinaGanadora === 'Roja' ? 3 : 0,
                votosAzul: esquinaGanadora === 'Azul' ? 3 : 0,
                votosEmpate: 0,
                tipoDecision: tipo,
                esquinaGanadora
            },
            advertencias
        };
    }

    const tarjetasTotales = combateRaw.tarjetasJueces.map(calcularTotalTarjetaJuez);
    const decision = determinarResultadoDecision(tarjetasTotales);

    const totalPuntosRoja = tarjetasTotales.reduce((acc, t) => acc + t.totalRoja, 0);
    const totalPuntosAzul = tarjetasTotales.reduce((acc, t) => acc + t.totalAzul, 0);

    return {
        combateId: combateRaw.id,
        titulo: combateRaw.titulo,
        peleadorRojo: combateRaw.peleadorRojo.nombre,
        peleadorAzul: combateRaw.peleadorAzul.nombre,
        metricas: {
            tarjetasTotalesJueces: tarjetasTotales,
            totalPuntosRoja,
            totalPuntosAzul,
            votosRoja: decision.votosRoja,
            votosAzul: decision.votosAzul,
            votosEmpate: decision.votosEmpate,
            tipoDecision: decision.tipoDecision,
            esquinaGanadora: decision.esquinaGanadora
        },
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenCombate(resumen: ResumenCombateKickboxing, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` MARCADOR DE KICKBOXING - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Combate             : ${resumen.titulo}`);
    console.log(`Esquina Roja        : ${resumen.peleadorRojo}`);
    console.log(`Esquina Azul        : ${resumen.peleadorAzul}`);
    console.log(`Resultado Oficial   : ${resumen.metricas.tipoDecision} -> Ganador: ${resumen.metricas.esquinaGanadora.toUpperCase()}`);
    console.log(`Votos Jueces (R/A/E): ${resumen.metricas.votosRoja} / ${resumen.metricas.votosAzul} / ${resumen.metricas.votosEmpate}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y ERRORES (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    if (resumen.metricas.tarjetasTotalesJueces.length > 0) {
        console.log(`TARJETAS OFICIALES DE LOS JUECES:`);
        console.table(
            resumen.metricas.tarjetasTotalesJueces.map((t) => ({
                Juez: t.juezNombre,
                'Puntos Roja': t.totalRoja,
                'Puntos Azul': t.totalAzul,
                Ganador: t.ganadorJuez
            }))
        );
    }
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const pRojo: PeleadorKickboxing = { id: 'p-1', nombre: 'Rico Verhoeven', esquina: 'Roja', pesoKg: 118, categoria: 'Pesado' };
const pAzul: PeleadorKickboxing = { id: 'p-2', nombre: 'Badr Hari', esquina: 'Azul', pesoKg: 114, categoria: 'Pesado' };

// --- CASO 1: Combate a 3 Rondas con Decisión Unánime (Caso Normal) ---
const combateNormal: CombateKickboxing = {
    id: 'COMB-001',
    titulo: 'Campeonato Mundial Peso Pesado GLORY',
    totalRondas: 3,
    peleadorRojo: pRojo,
    peleadorAzul: pAzul,
    tarjetasJueces: [
        {
            juezId: 'j-1',
            juezNombre: 'Juez Adalaide Byrd',
            rondas: [
                { numeroRound: 1, puntosRoja: 10, puntosAzul: 9, caidasRoja: 0, caidasAzul: 0, penalizacionesRoja: 0, penalizacionesAzul: 0 },
                { numeroRound: 2, puntosRoja: 10, puntosAzul: 9, caidasRoja: 0, caidasAzul: 0, penalizacionesRoja: 0, penalizacionesAzul: 0 },
                { numeroRound: 3, puntosRoja: 9, puntosAzul: 10, caidasRoja: 0, caidasAzul: 0, penalizacionesRoja: 0, penalizacionesAzul: 0 }
            ]
        },
        {
            juezId: 'j-2',
            juezNombre: 'Juez Sal D\'Amato',
            rondas: [
                { numeroRound: 1, puntosRoja: 10, puntosAzul: 9, caidasRoja: 0, caidasAzul: 0, penalizacionesRoja: 0, penalizacionesAzul: 0 },
                { numeroRound: 2, puntosRoja: 10, puntosAzul: 8, caidasRoja: 0, caidasAzul: 1, penalizacionesRoja: 0, penalizacionesAzul: 0 },
                { numeroRound: 3, puntosRoja: 10, puntosAzul: 9, caidasRoja: 0, caidasAzul: 0, penalizacionesRoja: 0, penalizacionesAzul: 0 }
            ]
        },
        {
            juezId: 'j-3',
            juezNombre: 'Juez Derek Cleary',
            rondas: [
                { numeroRound: 1, puntosRoja: 10, puntosAzul: 9, caidasRoja: 0, caidasAzul: 0, penalizacionesRoja: 0, penalizacionesAzul: 0 },
                { numeroRound: 2, puntosRoja: 10, puntosAzul: 9, caidasRoja: 0, caidasAzul: 0, penalizacionesRoja: 0, penalizacionesAzul: 0 },
                { numeroRound: 3, puntosRoja: 10, puntosAzul: 9, caidasRoja: 0, caidasAzul: 0, penalizacionesRoja: 0, penalizacionesAzul: 0 }
            ]
        }
    ]
};

// --- CASO 2: Combate con Inconsistencias, Puntuacion Fuera de Rango y Falta de Juez (Caso Límite) ---
const combateLimiteCorrupto: CombateKickboxing = {
    id: 'COMB-002',
    titulo: 'Pelea de Exhibicion Intercontinental',
    totalRondas: 3,
    peleadorRojo: pRojo,
    peleadorAzul: pAzul,
    tarjetasJueces: [
        {
            juezId: 'j-1',
            juezNombre: 'Juez Incompleto',
            rondas: [
                { numeroRound: 1, puntosRoja: 15, puntosAzul: -2, caidasRoja: 0, caidasAzul: 0, penalizacionesRoja: 0, penalizacionesAzul: 0 }
            ]
        }
    ]
};

// Ejecución
const resumenNormal = procesarMarcadorKickboxing(combateNormal);
mostrarResumenCombate(resumenNormal, 'Caso Normal - Decision Unanime GLORY');

const resumenLimite = procesarMarcadorKickboxing(combateLimiteCorrupto);
mostrarResumenCombate(resumenLimite, 'Caso Limite - Puntuacion Invalida y Tarjetas Incompletas');