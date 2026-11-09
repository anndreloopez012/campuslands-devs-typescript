
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type RolMOBA = 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support';
export type LadoEquipo = 'Azul' | 'Rojo';
export type FaseDraft = 'FaseBaneo' | 'FaseSeleccion' | 'FaseCompletada';
export type TipoSeleccion = 'Pick' | 'Ban';
export type DificultadHeroe = 'Baja' | 'Media' | 'Alta';

export interface HeroeMOBA {
    readonly id: string;
    readonly nombre: string;
    readonly rolPrincipal: RolMOBA;
    readonly winRatePct: number; // Porcentaje de 0.0 a 100.0
    readonly banRatePct: number; // Porcentaje de 0.0 a 100.0
    readonly dificultad: DificultadHeroe;
}

export interface AccionDraft {
    readonly id: string;
    readonly tipo: TipoSeleccion;
    readonly heroe: HeroeMOBA;
    readonly equipo: LadoEquipo;
    readonly rolAsignado?: RolMOBA;
}

export interface EquipoDraft {
    readonly lado: LadoEquipo;
    readonly nombreEquipo: string;
    readonly baneos: readonly HeroeMOBA[];
    readonly picks: readonly AccionDraft[];
}

export interface PartidaDraft {
    readonly id: string;
    readonly equipoAzul: EquipoDraft;
    readonly equipoRojo: EquipoDraft;
    readonly faseActual: FaseDraft;
}

export interface MetricasDraft {
    readonly totalBaneos: number;
    readonly totalPicks: number;
    readonly winRatePromedioEquipoAzul: number;
    readonly winRatePromedioEquipoRojo: number;
    readonly heroeConMayorWinRate: HeroeMOBA | null;
    readonly coberturaRolesEquipoAzul: Readonly<Record<RolMOBA, number>>;
    readonly coberturaRolesEquipoRojo: Readonly<Record<RolMOBA, number>>;
    readonly desglosePorRolGlobal: Readonly<Record<RolMOBA, number>>;
}

export interface ResumenDraftMOBA {
    readonly draftId: string;
    readonly equipoAzulNombre: string;
    readonly equipoRojoNombre: string;
    readonly esDraftValido: boolean;
    readonly metricas: MetricasDraft;
    readonly partidaProcesada: PartidaDraft;
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarHeroe(heroe: HeroeMOBA): ResultadoValidacion<HeroeMOBA> {
    const errores: string[] = [];

    if (heroe.winRatePct < 0 || heroe.winRatePct > 100) {
        errores.push(`WinRate invalido (${heroe.winRatePct}%) para el heroe "${heroe.nombre}".`);
    }

    if (heroe.banRatePct < 0 || heroe.banRatePct > 100) {
        errores.push(`BanRate invalido (${heroe.banRatePct}%) para el heroe "${heroe.nombre}".`);
    }

    if (heroe.nombre.trim().length === 0) {
        errores.push('El heroe debe registrar un nombre valido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: heroe }
        : { esValido: false, errores };
}

export function validarEquipoDraft(equipo: EquipoDraft): readonly string[] {
    const advertencias: string[] = [];

    if (equipo.nombreEquipo.trim().length === 0) {
        advertencias.push(`El equipo en lado ${equipo.lado} debe registrar un nombre.`);
    }

    if (equipo.picks.length > 5) {
        advertencias.push(`El equipo ${equipo.nombreEquipo} supera el limite de 5 picks (${equipo.picks.length}).`);
    }

    if (equipo.baneos.length > 5) {
        advertencias.push(`El equipo ${equipo.nombreEquipo} supera el limite de 5 baneos (${equipo.baneos.length}).`);
    }

    return advertencias;
}

export function validarPartidaDraft(partida: PartidaDraft): readonly string[] {
    const advertencias: string[] = [];
    const heroesVistos = new Set<string>();

    const advAzul = validarEquipoDraft(partida.equipoAzul);
    const advRojo = validarEquipoDraft(partida.equipoRojo);
    advertencias.push(...advAzul, ...advRojo);

    // Verificar héroes duplicados entre picks y baneos globales
    const todasLasAcciones: { idHeroe: string; nombreHeroe: string; contexto: string }[] = [];

    partida.equipoAzul.baneos.forEach((h) =>
        todasLasAcciones.push({ idHeroe: h.id, nombreHeroe: h.nombre, contexto: `Baneo Equipo Azul` })
    );
    partida.equipoRojo.baneos.forEach((h) =>
        todasLasAcciones.push({ idHeroe: h.id, nombreHeroe: h.nombre, contexto: `Baneo Equipo Rojo` })
    );
    partida.equipoAzul.picks.forEach((p) =>
        todasLasAcciones.push({ idHeroe: p.heroe.id, nombreHeroe: p.heroe.nombre, contexto: `Pick Equipo Azul` })
    );
    partida.equipoRojo.picks.forEach((p) =>
        todasLasAcciones.push({ idHeroe: p.heroe.id, nombreHeroe: p.heroe.nombre, contexto: `Pick Equipo Rojo` })
    );

    for (const accion of todasLasAcciones) {
        if (heroesVistos.has(accion.idHeroe)) {
            advertencias.push(
                `Heroe duplicado en la fase de draft: "${accion.nombreHeroe}" (ID: ${accion.idHeroe}) reaparece en ${accion.contexto}.`
            );
        }
        heroesVistos.add(accion.idHeroe);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce y Record)

const ROLES_MOBA: readonly RolMOBA[] = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

export function calcularMetricasDraft(partida: PartidaDraft): MetricasDraft {
    const totalBaneos = partida.equipoAzul.baneos.length + partida.equipoRojo.baneos.length;
    const picksAzul = partida.equipoAzul.picks;
    const picksRojo = partida.equipoRojo.picks;
    const totalPicks = picksAzul.length + picksRojo.length;

    const sumaWinRateAzul = picksAzul.reduce((acc, p) => acc + p.heroe.winRatePct, 0);
    const winRatePromedioEquipoAzul = picksAzul.length > 0
        ? Number((sumaWinRateAzul / picksAzul.length).toFixed(1))
        : 0;

    const sumaWinRateRojo = picksRojo.reduce((acc, p) => acc + p.heroe.winRatePct, 0);
    const winRatePromedioEquipoRojo = picksRojo.length > 0
        ? Number((sumaWinRateRojo / picksRojo.length).toFixed(1))
        : 0;

    const todosLosPicks = [...picksAzul, ...picksRojo];
    const heroeConMayorWinRate = [...todosLosPicks]
        .map((p) => p.heroe)
        .sort((a, b) => b.winRatePct - a.winRatePct)[0] ?? null;

    // Cobertura de roles por equipo utilizando reduce
    const coberturaRolesEquipoAzul = picksAzul.reduce((acc, p) => {
        const rol = p.rolAsignado ?? p.heroe.rolPrincipal;
        acc[rol] = (acc[rol] ?? 0) + 1;
        return acc;
    }, ROLES_MOBA.reduce((acc, r) => ({ ...acc, [r]: 0 }), {} as Record<RolMOBA, number>));

    const coberturaRolesEquipoRojo = picksRojo.reduce((acc, p) => {
        const rol = p.rolAsignado ?? p.heroe.rolPrincipal;
        acc[rol] = (acc[rol] ?? 0) + 1;
        return acc;
    }, ROLES_MOBA.reduce((acc, r) => ({ ...acc, [r]: 0 }), {} as Record<RolMOBA, number>));

    // Desglose global de roles seleccionados
    const desglosePorRolGlobal = todosLosPicks.reduce((acc, p) => {
        const rol = p.rolAsignado ?? p.heroe.rolPrincipal;
        acc[rol] = (acc[rol] ?? 0) + 1;
        return acc;
    }, ROLES_MOBA.reduce((acc, r) => ({ ...acc, [r]: 0 }), {} as Record<RolMOBA, number>));

    return {
        totalBaneos,
        totalPicks,
        winRatePromedioEquipoAzul,
        winRatePromedioEquipoRojo,
        heroeConMayorWinRate,
        coberturaRolesEquipoAzul,
        coberturaRolesEquipoRojo,
        desglosePorRolGlobal
    };
}

export function procesarDraftMOBA(partidaRaw: PartidaDraft): ResumenDraftMOBA {
    const advertencias: string[] = [...validarPartidaDraft(partidaRaw)];

    // Validaciones individuales de héroes en picks y baneos
    const validarHeroeEnLista = (h: HeroeMOBA, contexto: string) => {
        const res = validarHeroe(h);
        if (!res.esValido) {
            advertencias.push(...res.errores.map((err) => `${contexto}: ${err}`));
        }
    };

    partidaRaw.equipoAzul.baneos.forEach((h) => validarHeroeEnLista(h, 'Baneo Azul'));
    partidaRaw.equipoRojo.baneos.forEach((h) => validarHeroeEnLista(h, 'Baneo Rojo'));
    partidaRaw.equipoAzul.picks.forEach((p) => validarHeroeEnLista(p.heroe, 'Pick Azul'));
    partidaRaw.equipoRojo.picks.forEach((p) => validarHeroeEnLista(p.heroe, 'Pick Rojo'));

    const metricas = calcularMetricasDraft(partidaRaw);
    const esDraftValido = advertencias.length === 0;

    return {
        draftId: partidaRaw.id,
        equipoAzulNombre: partidaRaw.equipoAzul.nombreEquipo,
        equipoRojoNombre: partidaRaw.equipoRojo.nombreEquipo,
        esDraftValido,
        metricas,
        partidaProcesada: partidaRaw,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenDraft(resumen: ResumenDraftMOBA, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` DRAFT INTELIGENTE MOBA - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Matchup             : ${resumen.equipoAzulNombre} (Azul) vs ${resumen.equipoRojoNombre} (Rojo)`);
    console.log(`Estado del Draft    : ${resumen.esDraftValido ? 'DRAFT VALIDO' : 'DRAFT CON INCONSISTENCIAS'}`);
    console.log(`Total Baneos/Picks  : ${resumen.metricas.totalBaneos} Bans / ${resumen.metricas.totalPicks} Picks`);
    console.log(`WinRate Prom. Azul  : ${resumen.metricas.winRatePromedioEquipoAzul}%`);
    console.log(`WinRate Prom. Rojo  : ${resumen.metricas.winRatePromedioEquipoRojo}%`);
    console.log(`Top WinRate Heroe   : ${resumen.metricas.heroeConMayorWinRate ? `${resumen.metricas.heroeConMayorWinRate.nombre} (${resumen.metricas.heroeConMayorWinRate.winRatePct}% WR)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y ALERTAS DE REGLAS (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`COBERTURA DE ROLES POR EQUIPO:`);
    console.log(`  [Azul] -> ` + Object.entries(resumen.metricas.coberturaRolesEquipoAzul).map(([r, c]) => `${r}: ${c}`).join(' | '));
    console.log(`  [Rojo] -> ` + Object.entries(resumen.metricas.coberturaRolesEquipoRojo).map(([r, c]) => `${r}: ${c}`).join(' | '));
    console.log(`----------------------------------------------------------------------`);

    const tablaAzul = resumen.partidaProcesada.equipoAzul.picks.map((p) => ({
        Equipo: 'Azul',
        Heroe: p.heroe.nombre,
        Rol: p.rolAsignado ?? p.heroe.rolPrincipal,
        Dificultad: p.heroe.dificultad,
        'WinRate %': `${p.heroe.winRatePct}%`,
        'BanRate %': `${p.heroe.banRatePct}%`
    }));

    const tablaRojo = resumen.partidaProcesada.equipoRojo.picks.map((p) => ({
        Equipo: 'Rojo',
        Heroe: p.heroe.nombre,
        Rol: p.rolAsignado ?? p.heroe.rolPrincipal,
        Dificultad: p.heroe.dificultad,
        'WinRate %': `${p.heroe.winRatePct}%`,
        'BanRate %': `${p.heroe.banRatePct}%`
    }));

    console.table([...tablaAzul, ...tablaRojo]);
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

// Definicion de heroes
const aatrox: HeroeMOBA = { id: 'h-01', nombre: 'Aatrox', rolPrincipal: 'Top', winRatePct: 51.5, banRatePct: 22.0, dificultad: 'Media' };
const leeSin: HeroeMOBA = { id: 'h-02', nombre: 'Lee Sin', rolPrincipal: 'Jungle', winRatePct: 49.8, banRatePct: 18.5, dificultad: 'Alta' };
const ahri: HeroeMOBA = { id: 'h-03', nombre: 'Ahri', rolPrincipal: 'Mid', winRatePct: 52.4, banRatePct: 12.0, dificultad: 'Media' };
const jinx: HeroeMOBA = { id: 'h-04', nombre: 'Jinx', rolPrincipal: 'ADC', winRatePct: 53.1, banRatePct: 8.5, dificultad: 'Baja' };
const thresh: HeroeMOBA = { id: 'h-05', nombre: 'Thresh', rolPrincipal: 'Support', winRatePct: 50.9, banRatePct: 15.0, dificultad: 'Alta' };

const fiora: HeroeMOBA = { id: 'h-06', nombre: 'Fiora', rolPrincipal: 'Top', winRatePct: 52.0, banRatePct: 25.0, dificultad: 'Alta' };
const vi: HeroeMOBA = { id: 'h-07', nombre: 'Vi', rolPrincipal: 'Jungle', winRatePct: 51.2, banRatePct: 10.0, dificultad: 'Baja' };
const azir: HeroeMOBA = { id: 'h-08', nombre: 'Azir', rolPrincipal: 'Mid', winRatePct: 48.5, banRatePct: 30.0, dificultad: 'Alta' };
const kaisa: HeroeMOBA = { id: 'h-09', nombre: 'Kai\'Sa', rolPrincipal: 'ADC', winRatePct: 50.2, banRatePct: 20.0, dificultad: 'Media' };
const nautilus: HeroeMOBA = { id: 'h-10', nombre: 'Nautilus', rolPrincipal: 'Support', winRatePct: 51.8, banRatePct: 14.0, dificultad: 'Baja' };

const zedBan: HeroeMOBA = { id: 'h-11', nombre: 'Zed', rolPrincipal: 'Mid', winRatePct: 50.0, banRatePct: 45.0, dificultad: 'Alta' };
const ksanteBan: HeroeMOBA = { id: 'h-12', nombre: 'K\'Sante', rolPrincipal: 'Top', winRatePct: 47.0, banRatePct: 50.0, dificultad: 'Alta' };

// --- CASO 1: Partida Profesional eSports Completada (Caso Normal) ---
const draftNormal: PartidaDraft = {
    id: 'MATCH-WORLDS-F1',
    faseActual: 'FaseCompletada',
    equipoAzul: {
        lado: 'Azul',
        nombreEquipo: 'T1',
        baneos: [zedBan],
        picks: [
            { id: 'p-01', tipo: 'Pick', heroe: aatrox, equipo: 'Azul', rolAsignado: 'Top' },
            { id: 'p-02', tipo: 'Pick', heroe: leeSin, equipo: 'Azul', rolAsignado: 'Jungle' },
            { id: 'p-03', tipo: 'Pick', heroe: ahri, equipo: 'Azul', rolAsignado: 'Mid' },
            { id: 'p-04', tipo: 'Pick', heroe: jinx, equipo: 'Azul', rolAsignado: 'ADC' },
            { id: 'p-05', tipo: 'Pick', heroe: thresh, equipo: 'Azul', rolAsignado: 'Support' }
        ]
    },
    equipoRojo: {
        lado: 'Rojo',
        nombreEquipo: 'Gen.G',
        baneos: [ksanteBan],
        picks: [
            { id: 'p-06', tipo: 'Pick', heroe: fiora, equipo: 'Rojo', rolAsignado: 'Top' },
            { id: 'p-07', tipo: 'Pick', heroe: vi, equipo: 'Rojo', rolAsignado: 'Jungle' },
            { id: 'p-08', tipo: 'Pick', heroe: azir, equipo: 'Rojo', rolAsignado: 'Mid' },
            { id: 'p-09', tipo: 'Pick', heroe: kaisa, equipo: 'Rojo', rolAsignado: 'ADC' },
            { id: 'p-10', tipo: 'Pick', heroe: nautilus, equipo: 'Rojo', rolAsignado: 'Support' }
        ]
    }
};

// --- CASO 2: Héroe Repetido Picked/Banned, WinRate Inválido (Caso Límite) ---
const heroeCorrupto: HeroeMOBA = { id: 'h-99', nombre: 'Heroe Bugueado', rolPrincipal: 'Mid', winRatePct: 150.0, banRatePct: -5.0, dificultad: 'Baja' };

const draftLimiteCorrupto: PartidaDraft = {
    id: 'MATCH-FAIL-02',
    faseActual: 'FaseSeleccion',
    equipoAzul: {
        lado: 'Azul',
        nombreEquipo: 'Equipo Invalido A',
        baneos: [aatrox], // Aatrox baneado en azul
        picks: [
            { id: 'p-11', tipo: 'Pick', heroe: aatrox, equipo: 'Azul', rolAsignado: 'Top' }, // Aatrox picked despues de ser baneado -> Duplicado
            { id: 'p-12', tipo: 'Pick', heroe: heroeCorrupto, equipo: 'Azul', rolAsignado: 'Mid' } // WR e BR fuera de rango -> Invalido
        ]
    },
    equipoRojo: {
        lado: 'Rojo',
        nombreEquipo: 'Equipo Invalido B',
        baneos: [],
        picks: []
    }
};

// Ejecución
const resumenNormal = procesarDraftMOBA(draftNormal);
mostrarResumenDraft(resumenNormal, 'Caso Normal - Worlds Final T1 vs Gen.G');

const resumenLimite = procesarDraftMOBA(draftLimiteCorrupto);
mostrarResumenDraft(resumenLimite, 'Caso Limite - Heroe Baneado/Picked y WinRate Invalido');