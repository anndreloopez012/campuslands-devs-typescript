
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions y Literales)

export type CategoriaPeso =
    | 'Pluma'
    | 'Ligero'
    | 'Welter'
    | 'Medio'
    | 'Semipesado'
    | 'Pesado';

export type FaseTorneo = 'Cuartos' | 'Semifinal' | 'Final';

export type MetodoVictoria =
    | 'KO'
    | 'TKO'
    | 'DecisionUnanime'
    | 'DecisionDividida'
    | 'Descalificacion';

export type EstadoPelea = 'Programada' | 'EnCurso' | 'Finalizada' | 'Cancelada';

export interface RecordPeleador {
    readonly victorias: number;
    readonly derrotas: number;
    readonly kos: number;
}

export interface PeleadorKickboxing {
    readonly id: string;
    readonly nombre: string;
    readonly apodo: string;
    readonly gimnasio: string;
    readonly categoriaPeso: CategoriaPeso;
    readonly pesoKg: number;
    readonly record: RecordPeleador;
}

export interface PeleaBracket {
    readonly id: string;
    readonly codigoPelea: string;
    readonly fase: FaseTorneo;
    readonly peleadorRojo: PeleadorKickboxing;
    readonly peleadorAzul: PeleadorKickboxing;
    readonly ganador: PeleadorKickboxing | null;
    readonly metodoVictoria: MetodoVictoria | null;
    readonly asaltoFinal: number | null;
    readonly duracionSegundosFinal: number | null;
    readonly estado: EstadoPelea;
}

export interface TorneoKickboxing {
    readonly id: string;
    readonly nombreTorneo: string;
    readonly categoriaPeso: CategoriaPeso;
    readonly sede: string;
    readonly fecha: string;
    readonly peleas: readonly PeleaBracket[];
}

export interface MetricasBracket {
    readonly totalPeleas: number;
    readonly peleasFinalizadas: number;
    readonly porcentajeFinalizadas: number;
    readonly totalKOs: number;
    readonly porcentajeKOs: number;
    readonly peleadorConMasKOs: PeleadorKickboxing | null;
    readonly desglosePorMetodo: Readonly<Record<MetodoVictoria, number>>;
    readonly desglosePorFase: Readonly<Record<FaseTorneo, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoPelea, number>>;
}

export interface ResumenBracketKickboxing {
    readonly torneoId: string;
    readonly nombreTorneo: string;
    readonly categoriaPeso: CategoriaPeso;
    readonly totalPeleasValidas: number;
    readonly metricas: MetricasBracket;
    readonly peleasProcesadas: readonly PeleaBracket[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. TYPE GUARDS Y FUNCIONES DE VALIDACIÓN DE DOMINIO

export function esVictoriaPorKnockout(metodo: MetodoVictoria | null): boolean {
    return metodo === 'KO' || metodo === 'TKO';
}

export function validarPeleador(peleador: PeleadorKickboxing): ResultadoValidacion<PeleadorKickboxing> {
    const errores: string[] = [];

    if (peleador.pesoKg <= 0 || peleador.pesoKg > 150) {
        errores.push(`Peso fuera de rango (${peleador.pesoKg} kg) para el peleador "${peleador.nombre}".`);
    }

    if (peleador.record.victorias < 0 || peleador.record.derrotas < 0 || peleador.record.kos < 0) {
        errores.push(`Record de combate invalido para "${peleador.nombre}".`);
    }

    if (peleador.record.kos > peleador.record.victorias) {
        errores.push(`Los KOs (${peleador.record.kos}) no pueden superar el total de victorias (${peleador.record.victorias}) en "${peleador.nombre}".`);
    }

    if (peleador.nombre.trim().length === 0) {
        errores.push('El peleador debe registrar un nombre valido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: peleador }
        : { esValido: false, errores };
}

export function validarPeleaBracket(pelea: PeleaBracket): ResultadoValidacion<PeleaBracket> {
    const errores: string[] = [];

    if (pelea.peleadorRojo.id === pelea.peleadorAzul.id) {
        errores.push(`Inconsistencia en pelea ${pelea.codigoPelea}: Un peleador no puede enfrentarse a si mismo (${pelea.peleadorRojo.nombre}).`);
    }

    if (pelea.estado === 'Finalizada') {
        if (!pelea.ganador) {
            errores.push(`Inconsistencia en pelea ${pelea.codigoPelea}: Pelea finalizada pero sin ganador declarado.`);
        } else if (pelea.ganador.id !== pelea.peleadorRojo.id && pelea.ganador.id !== pelea.peleadorAzul.id) {
            errores.push(`El ganador asignado en pelea ${pelea.codigoPelea} no coincide con ninguno de los competidores.`);
        }

        if (!pelea.metodoVictoria) {
            errores.push(`Inconsistencia en pelea ${pelea.codigoPelea}: Pelea finalizada sin metodo de victoria registrado.`);
        }

        if (!pelea.asaltoFinal || pelea.asaltoFinal < 1 || pelea.asaltoFinal > 5) {
            errores.push(`Asalto final invalido (${pelea.asaltoFinal}) en pelea ${pelea.codigoPelea}.`);
        }
    }

    return errores.length === 0
        ? { esValido: true, datos: pelea }
        : { esValido: false, errores };
}

export function validarTorneoRaw(torneo: TorneoKickboxing): readonly string[] {
    const advertencias: string[] = [];
    const idsPeleas = new Set<string>();
    const codigosPeleas = new Set<string>();

    if (torneo.peleas.length === 0) {
        advertencias.push(`El torneo "${torneo.nombreTorneo}" no registra peleas en el bracket.`);
    }

    for (const pelea of torneo.peleas) {
        if (idsPeleas.has(pelea.id)) {
            advertencias.push(`Pelea duplicada detectada por ID: ${pelea.id}.`);
        }
        if (codigosPeleas.has(pelea.codigoPelea)) {
            advertencias.push(`Codigo de pelea duplicado: ${pelea.codigoPelea}.`);
        }
        idsPeleas.add(pelea.id);
        codigosPeleas.add(pelea.codigoPelea);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce, Record y Union Types)

const METODOS_VICTORIA: readonly MetodoVictoria[] = [
    'KO',
    'TKO',
    'DecisionUnanime',
    'DecisionDividida',
    'Descalificacion'
];

const FASES_TORNEO: readonly FaseTorneo[] = ['Cuartos', 'Semifinal', 'Final'];

const ESTADOS_PELEA: readonly EstadoPelea[] = [
    'Programada',
    'EnCurso',
    'Finalizada',
    'Cancelada'
];

export function calcularMetricasBracket(peleas: readonly PeleaBracket[]): MetricasBracket {
    if (peleas.length === 0) {
        const desgloseMetodoVacio = METODOS_VICTORIA.reduce((acc, m) => {
            acc[m] = 0;
            return acc;
        }, {} as Record<MetodoVictoria, number>);

        const desgloseFaseVacio = FASES_TORNEO.reduce((acc, f) => {
            acc[f] = 0;
            return acc;
        }, {} as Record<FaseTorneo, number>);

        const desgloseEstadoVacio = ESTADOS_PELEA.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstadoPelea, number>);

        return {
            totalPeleas: 0,
            peleasFinalizadas: 0,
            porcentajeFinalizadas: 0,
            totalKOs: 0,
            porcentajeKOs: 0,
            peleadorConMasKOs: null,
            desglosePorMetodo: desgloseMetodoVacio,
            desglosePorFase: desgloseFaseVacio,
            desglosePorEstado: desgloseEstadoVacio
        };
    }

    const peleasFinalizadas = peleas.filter((p) => p.estado === 'Finalizada');
    const cantidadFinalizadas = peleasFinalizadas.length;
    const porcentajeFinalizadas = Number(((cantidadFinalizadas / peleas.length) * 100).toFixed(1));

    const peleasConKO = peleasFinalizadas.filter((p) => esVictoriaPorKnockout(p.metodoVictoria));
    const totalKOs = peleasConKO.length;

    const porcentajeKOs = cantidadFinalizadas > 0
        ? Number(((totalKOs / cantidadFinalizadas) * 100).toFixed(1))
        : 0;

    const todosLosPeleadores = peleas.flatMap((p) => [p.peleadorRojo, p.peleadorAzul]);
    const peleadorConMasKOs = [...todosLosPeleadores].sort(
        (a, b) => b.record.kos - a.record.kos
    )[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorMetodo = peleasFinalizadas.reduce((acc, p) => {
        if (p.metodoVictoria) {
            acc[p.metodoVictoria] = (acc[p.metodoVictoria] ?? 0) + 1;
        }
        return acc;
    }, METODOS_VICTORIA.reduce((acc, m) => ({ ...acc, [m]: 0 }), {} as Record<MetodoVictoria, number>));

    const desglosePorFase = peleas.reduce((acc, p) => {
        acc[p.fase] = (acc[p.fase] ?? 0) + 1;
        return acc;
    }, FASES_TORNEO.reduce((acc, f) => ({ ...acc, [f]: 0 }), {} as Record<FaseTorneo, number>));

    const desglosePorEstado = peleas.reduce((acc, p) => {
        acc[p.estado] = (acc[p.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_PELEA.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoPelea, number>));

    return {
        totalPeleas: peleas.length,
        peleasFinalizadas: cantidadFinalizadas,
        porcentajeFinalizadas,
        totalKOs,
        porcentajeKOs,
        peleadorConMasKOs,
        desglosePorMetodo,
        desglosePorFase,
        desglosePorEstado
    };
}

export function procesarBracketKickboxing(torneoRaw: TorneoKickboxing): ResumenBracketKickboxing {
    const advertencias: string[] = [...validarTorneoRaw(torneoRaw)];
    const peleasValidas: PeleaBracket[] = [];

    for (const rawPelea of torneoRaw.peleas) {
        const resRojo = validarPeleador(rawPelea.peleadorRojo);
        const resAzul = validarPeleador(rawPelea.peleadorAzul);
        const resPelea = validarPeleaBracket(rawPelea);

        if (!resRojo.esValido) {
            advertencias.push(...resRojo.errores.map((err) => `Pelea ${rawPelea.codigoPelea}: ${err}`));
        }
        if (!resAzul.esValido) {
            advertencias.push(...resAzul.errores.map((err) => `Pelea ${rawPelea.codigoPelea}: ${err}`));
        }
        if (!resPelea.esValido) {
            advertencias.push(...resPelea.errores);
        }

        if (resRojo.esValido && resAzul.esValido && resPelea.esValido) {
            peleasValidas.push(rawPelea);
        }
    }

    const metricas = calcularMetricasBracket(peleasValidas);

    return {
        torneoId: torneoRaw.id,
        nombreTorneo: torneoRaw.nombreTorneo,
        categoriaPeso: torneoRaw.categoriaPeso,
        totalPeleasValidas: peleasValidas.length,
        metricas,
        peleasProcesadas: peleasValidas,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenBracket(resumen: ResumenBracketKickboxing, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` BRACKET DE KICKBOXING - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Torneo              : ${resumen.nombreTorneo}`);
    console.log(`Categoria           : ${resumen.categoriaPeso}`);
    console.log(`Peleas Validadas    : ${resumen.totalPeleasValidas}`);
    console.log(`Peleas Finalizadas  : ${resumen.metricas.peleasFinalizadas} de ${resumen.metricas.totalPeleas} (${resumen.metricas.porcentajeFinalizadas}%)`);
    console.log(`Knockouts Totales   : ${resumen.metricas.totalKOs} KOs (${resumen.metricas.porcentajeKOs}% de peleas finalizadas)`);
    console.log(`Peleador Destacado  : ${resumen.metricas.peleadorConMasKOs ? `${resumen.metricas.peleadorConMasKOs.nombre} "${resumen.metricas.peleadorConMasKOs.apodo}" (${resumen.metricas.peleadorConMasKOs.record.kos} KOs)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE BRACKET (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR METODO DE VICTORIA:`);
    Object.entries(resumen.metricas.desglosePorMetodo).forEach(([metodo, cantidad]) => {
        console.log(`   - ${metodo.padEnd(20)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.peleasProcesadas.map((p) => ({
            ID: p.id,
            Codigo: p.codigoPelea,
            Fase: p.fase,
            'Rincon Rojo': p.peleadorRojo.nombre,
            'Rincon Azul': p.peleadorAzul.nombre,
            Ganador: p.ganador ? p.ganador.nombre : 'N/A',
            Metodo: p.metodoVictoria ?? 'N/A',
            Asalto: p.asaltoFinal ? `Round ${p.asaltoFinal}` : 'N/A',
            Estado: p.estado
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const peleador1: PeleadorKickboxing = {
    id: 'f-01',
    nombre: 'Rico Verhoeven',
    apodo: 'The King of Kickboxing',
    gimnasio: 'Superpro Sportcenter',
    categoriaPeso: 'Pesado',
    pesoKg: 118.5,
    record: { victorias: 60, derrotas: 10, kos: 20 }
};

const peleador2: PeleadorKickboxing = {
    id: 'f-02',
    nombre: 'Badr Hari',
    apodo: 'The Golden Boy',
    gimnasio: 'Mike\'s Gym',
    categoriaPeso: 'Pesado',
    pesoKg: 114.0,
    record: { victorias: 106, derrotas: 16, kos: 92 }
};

const peleador3: PeleadorKickboxing = {
    id: 'f-03',
    nombre: 'Jamal Ben Saddik',
    apodo: 'The Goliath',
    gimnasio: 'Hemmers Gym',
    categoriaPeso: 'Pesado',
    pesoKg: 122.0,
    record: { victorias: 36, derrotas: 9, kos: 29 }
};

const peleador4: PeleadorKickboxing = {
    id: 'f-04',
    nombre: 'Benjamin Adegbuyi',
    apodo: 'Mr. Gentleman',
    gimnasio: 'Superpro Romania',
    categoriaPeso: 'Pesado',
    pesoKg: 117.0,
    record: { victorias: 35, derrotas: 7, kos: 20 }
};

// --- CASO 1: Torneo World Grand Prix Heavyweight (Caso Normal) ---
const torneoNormal: TorneoKickboxing = {
    id: 'WGP-HEAVY-2026',
    nombreTorneo: 'GLORY World Grand Prix Heavyweight 2026',
    categoriaPeso: 'Pesado',
    sede: 'GelreDome, Arnhem',
    fecha: '2026-12-05',
    peleas: [
        {
            id: 'match-01',
            codigoPelea: 'SF_01',
            fase: 'Semifinal',
            peleadorRojo: peleador1,
            peleadorAzul: peleador4,
            ganador: peleador1,
            metodoVictoria: 'TKO',
            asaltoFinal: 2,
            duracionSegundosFinal: 145,
            estado: 'Finalizada'
        },
        {
            id: 'match-02',
            codigoPelea: 'SF_02',
            fase: 'Semifinal',
            peleadorRojo: peleador2,
            peleadorAzul: peleador3,
            ganador: peleador2,
            metodoVictoria: 'KO',
            asaltoFinal: 1,
            duracionSegundosFinal: 110,
            estado: 'Finalizada'
        },
        {
            id: 'match-03',
            codigoPelea: 'FINAL_01',
            fase: 'Final',
            peleadorRojo: peleador1,
            peleadorAzul: peleador2,
            ganador: peleador1,
            metodoVictoria: 'DecisionUnanime',
            asaltoFinal: 5,
            duracionSegundosFinal: 180,
            estado: 'Finalizada'
        }
    ]
};

// --- CASO 2: Peleador Enfrentado a Sí Mismo, KOs Superiores a Victorias y Pelea Duplicada (Caso Límite) ---
const peleadorCorrupto: PeleadorKickboxing = {
    id: 'f-99',
    nombre: 'Peleador Error Record',
    apodo: 'Faulty',
    gimnasio: 'Unknown',
    categoriaPeso: 'Pesado',
    pesoKg: 110.0,
    record: { victorias: 5, derrotas: 2, kos: 10 } // KOs > Victorias -> Invalido
};

const torneoLimiteCorrupto: TorneoKickboxing = {
    id: 'WGP-FAIL-02',
    nombreTorneo: 'Torneo Con Errores',
    categoriaPeso: 'Pesado',
    sede: 'Desconocida',
    fecha: '2026-11-01',
    peleas: [
        {
            id: 'match-04',
            codigoPelea: 'ERR_01',
            fase: 'Cuartos',
            peleadorRojo: peleador1,
            peleadorAzul: peleador1, // Enfrentado a si mismo -> Invalido
            ganador: peleador1,
            metodoVictoria: 'KO',
            asaltoFinal: 1,
            duracionSegundosFinal: 45,
            estado: 'Finalizada'
        },
        {
            id: 'match-05',
            codigoPelea: 'ERR_02',
            fase: 'Cuartos',
            peleadorRojo: peleadorCorrupto,
            peleadorAzul: peleador3,
            ganador: null, // Finalizada sin ganador -> Invalido
            metodoVictoria: null,
            asaltoFinal: 0,
            duracionSegundosFinal: 0,
            estado: 'Finalizada'
        },
        {
            id: 'match-01', // ID duplicado
            codigoPelea: 'SF_01',
            fase: 'Semifinal',
            peleadorRojo: peleador1,
            peleadorAzul: peleador4,
            ganador: peleador1,
            metodoVictoria: 'TKO',
            asaltoFinal: 2,
            duracionSegundosFinal: 145,
            estado: 'Finalizada'
        }
    ]
};

// Ejecución
const resumenNormal = procesarBracketKickboxing(torneoNormal);
mostrarResumenBracket(resumenNormal, 'Caso Normal - GLORY World Grand Prix Heavyweight');

const resumenLimite = procesarBracketKickboxing(torneoLimiteCorrupto);
mostrarResumenBracket(resumenLimite, 'Caso Limite - Enfrentamiento Mismo Peleador y Record Incoherente');