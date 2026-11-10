
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Promises)

export type TipoMision =
    | 'Principal'
    | 'Secundaria'
    | 'Gremio'
    | 'Diaria'
    | 'Evento';

export type EstadoMision =
    | 'NoIniciada'
    | 'EnProgreso'
    | 'Completada'
    | 'Fallida'
    | 'Bloqueada';

export type DificultadMision =
    | 'Facil'
    | 'Normal'
    | 'Dificil'
    | 'Heroica'
    | 'Legendaria';

export interface RecompensaMision {
    readonly experiencia: number;
    readonly oro: number;
    readonly items: readonly string[];
    readonly reputacion: number;
}

export interface MisionRPG {
    readonly id: string;
    readonly codigoMision: string;
    readonly titulo: string;
    readonly tipo: TipoMision;
    readonly dificultad: DificultadMision;
    readonly nivelRequerido: number;
    readonly duracionEstimadaMinutos: number;
    readonly estado: EstadoMision;
    readonly recompensa: RecompensaMision;
    readonly requiereMisionPreviaId?: string;
}

export interface BitacoraMisiones {
    readonly id: string;
    readonly jugadorId: string;
    readonly nombreJugador: string;
    readonly nivelJugador: number;
    readonly misiones: readonly MisionRPG[];
}

export interface MetricasBitacoraMisiones {
    readonly totalMisiones: number;
    readonly misionesCompletadasCount: number;
    readonly porcentajeCompletado: number;
    readonly experienciaTotalAcumulada: number;
    readonly oroTotalAcumulado: number;
    readonly totalItemsObtenidos: number;
    readonly tiempoTotalEstimadoHoras: number;
    readonly misionMasRecompensante: MisionRPG | null;
    readonly desglosePorTipo: Readonly<Record<TipoMision, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoMision, number>>;
}

export interface ResumenGestorMisiones {
    readonly bitacoraId: string;
    readonly jugadorId: string;
    readonly nombreJugador: string;
    readonly nivelJugador: number;
    readonly totalMisionesValidas: number;
    readonly metricas: MetricasBitacoraMisiones;
    readonly misionesProcesadas: readonly MisionRPG[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y GESTIÓN DE BITÁCORA (Generics & Encapsulamiento)

export class ContenedorMisiones<T extends { readonly id: string; readonly codigoMision: string }> {
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

export function validarRecompensa(recompensa: RecompensaMision): readonly string[] {
    const errores: string[] = [];

    if (recompensa.experiencia < 0) {
        errores.push(`Recompensa de experiencia negativa (${recompensa.experiencia} EXP).`);
    }

    if (recompensa.oro < 0) {
        errores.push(`Recompensa de oro negativa (${recompensa.oro} oro).`);
    }

    if (recompensa.reputacion < -1000 || recompensa.reputacion > 1000) {
        errores.push(`Puntos de reputacion fuera de rango (${recompensa.reputacion}).`);
    }

    return errores;
}

export function validarMision(
    mision: MisionRPG,
    nivelJugador: number
): ResultadoValidacion<MisionRPG> {
    const errores: string[] = [];

    if (mision.nivelRequerido <= 0 || mision.nivelRequerido > 100) {
        errores.push(`Nivel requerido invalido (${mision.nivelRequerido}) para "${mision.titulo}".`);
    }

    if (mision.duracionEstimadaMinutos <= 0) {
        errores.push(`Duracion estimada invalida (${mision.duracionEstimadaMinutos} min) para "${mision.titulo}".`);
    }

    if (mision.titulo.trim().length === 0) {
        errores.push(`La mision con codigo "${mision.codigoMision}" debe tener un titulo valido.`);
    }

    if (mision.estado === 'EnProgreso' && nivelJugador < mision.nivelRequerido) {
        errores.push(
            `Inconsistencia en "${mision.titulo}": Nivel del jugador (${nivelJugador}) es inferior al requerido (${mision.nivelRequerido}).`
        );
    }

    const erroresRecompensa = validarRecompensa(mision.recompensa);
    if (erroresRecompensa.length > 0) {
        errores.push(...erroresRecompensa.map((e) => `En "${mision.titulo}": ${e}`));
    }

    return errores.length === 0
        ? { esValido: true, datos: mision }
        : { esValido: false, errores };
}

export async function validarBitacoraAsync(
    bitacora: BitacoraMisiones
): Promise<ResultadoValidacion<BitacoraMisiones>> {
    // Simulacion de verificacion asincrona en la base de datos del motor RPG
    await new Promise((resolve) => setTimeout(resolve, 15));

    const errores: string[] = [];

    if (bitacora.nivelJugador <= 0 || bitacora.nivelJugador > 100) {
        errores.push(`Nivel de jugador invalido (${bitacora.nivelJugador}) en la bitacora.`);
    }

    if (bitacora.misiones.length === 0) {
        errores.push(`La bitacora del jugador "${bitacora.nombreJugador}" no contiene misiones registradas.`);
    }

    const idsMisionesExistentes = new Set(bitacora.misiones.map((m) => m.id));

    for (const m of bitacora.misiones) {
        const resVal = validarMision(m, bitacora.nivelJugador);
        if (!resVal.esValido) {
            errores.push(...resVal.errores);
        }

        if (m.requiereMisionPreviaId && !idsMisionesExistentes.has(m.requiereMisionPreviaId)) {
            errores.push(
                `Dependencia rota en "${m.titulo}": Mision previa requerida ID "${m.requiereMisionPreviaId}" no existe en la bitacora.`
            );
        }
    }

    return errores.length === 0
        ? { esValido: true, datos: bitacora }
        : { esValido: false, errores };
}

// 4. TRANSFORMACIÓN Y CÁLCULOS MÉTRICOS (reduce & Record)

const TIPOS_MISION: readonly TipoMision[] = [
    'Principal',
    'Secundaria',
    'Gremio',
    'Diaria',
    'Evento'
];

const ESTADOS_MISION: readonly EstadoMision[] = [
    'NoIniciada',
    'EnProgreso',
    'Completada',
    'Fallida',
    'Bloqueada'
];

export function calcularMetricasMisiones(misiones: readonly MisionRPG[]): MetricasBitacoraMisiones {
    if (misiones.length === 0) {
        const desgloseTipoVacio = TIPOS_MISION.reduce((acc, t) => {
            acc[t] = 0;
            return acc;
        }, {} as Record<TipoMision, number>);

        const desgloseEstadoVacio = ESTADOS_MISION.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstadoMision, number>);

        return {
            totalMisiones: 0,
            misionesCompletadasCount: 0,
            porcentajeCompletado: 0,
            experienciaTotalAcumulada: 0,
            oroTotalAcumulado: 0,
            totalItemsObtenidos: 0,
            tiempoTotalEstimadoHoras: 0,
            misionMasRecompensante: null,
            desglosePorTipo: desgloseTipoVacio,
            desglosePorEstado: desgloseEstadoVacio
        };
    }

    const completadas = misiones.filter((m) => m.estado === 'Completada');
    const misionesCompletadasCount = completadas.length;
    const porcentajeCompletado = Number(((misionesCompletadasCount / misiones.length) * 100).toFixed(1));

    const experienciaTotalAcumulada = completadas.reduce((acc, m) => acc + m.recompensa.experiencia, 0);
    const oroTotalAcumulado = completadas.reduce((acc, m) => acc + m.recompensa.oro, 0);
    const totalItemsObtenidos = completadas.reduce((acc, m) => acc + m.recompensa.items.length, 0);

    const duracionTotalMinutos = misiones.reduce((acc, m) => acc + m.duracionEstimadaMinutos, 0);
    const tiempoTotalEstimadoHoras = Number((duracionTotalMinutos / 60).toFixed(1));

    const misionMasRecompensante = [...misiones].sort(
        (a, b) => b.recompensa.experiencia + b.recompensa.oro - (a.recompensa.experiencia + a.recompensa.oro)
    )[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorTipo = misiones.reduce((acc, m) => {
        acc[m.tipo] = (acc[m.tipo] ?? 0) + 1;
        return acc;
    }, TIPOS_MISION.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TipoMision, number>));

    const desglosePorEstado = misiones.reduce((acc, m) => {
        acc[m.estado] = (acc[m.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_MISION.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoMision, number>));

    return {
        totalMisiones: misiones.length,
        misionesCompletadasCount,
        porcentajeCompletado,
        experienciaTotalAcumulada,
        oroTotalAcumulado,
        totalItemsObtenidos,
        tiempoTotalEstimadoHoras,
        misionMasRecompensante,
        desglosePorTipo,
        desglosePorEstado
    };
}

export class ServicioGestorMisionesRPG {
    private readonly contenedor = new ContenedorMisiones<MisionRPG>();

    public async procesarBitacoraAsync(
        bitacoraRaw: BitacoraMisiones
    ): Promise<ResumenGestorMisiones> {
        const advertencias: string[] = [];
        const valRes = await validarBitacoraAsync(bitacoraRaw);

        if (!valRes.esValido) {
            advertencias.push(...valRes.errores);
        }

        const idsVistos = new Set<string>();
        for (const rawMision of bitacoraRaw.misiones) {
            if (idsVistos.has(rawMision.id)) {
                advertencias.push(`Mision duplicada detectada por ID: ${rawMision.id} (${rawMision.titulo}).`);
            } else {
                idsVistos.add(rawMision.id);
                this.contenedor.agregar(rawMision);
            }
        }

        const misionesValidas = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasMisiones(misionesValidas);

        const misionesFallidas = misionesValidas.filter((m) => m.estado === 'Fallida');
        if (misionesFallidas.length > 0) {
            advertencias.push(
                `Alerta de progreso: Se registraron ${misionesFallidas.length} mision(es) en estado Fallida.`
            );
        }

        return {
            bitacoraId: bitacoraRaw.id,
            jugadorId: bitacoraRaw.jugadorId,
            nombreJugador: bitacoraRaw.nombreJugador,
            nivelJugador: bitacoraRaw.nivelJugador,
            totalMisionesValidas: misionesValidas.length,
            metricas,
            misionesProcesadas: misionesValidas,
            advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenMisionesRPG(resumen: ResumenGestorMisiones, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` GESTOR DE MISIONES RPG - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Nombre Jugador      : ${resumen.nombreJugador} (Nivel ${resumen.nivelJugador})`);
    console.log(`ID Bitacora         : ${resumen.bitacoraId}`);
    console.log(`Misiones Validadas  : ${resumen.totalMisionesValidas}`);
    console.log(`Porcentaje Progreso : ${resumen.metricas.misionesCompletadasCount} de ${resumen.metricas.totalMisiones} (${resumen.metricas.porcentajeCompletado}%)`);
    console.log(`Recompensas Ganadas : ${resumen.metricas.experienciaTotalAcumulada.toLocaleString()} EXP | ${resumen.metricas.oroTotalAcumulado.toLocaleString()} Oro | ${resumen.metricas.totalItemsObtenidos} Items`);
    console.log(`Tiempo Estimado     : ${resumen.metricas.tiempoTotalEstimadoHoras} hrs de juego`);
    console.log(`Mision Top Reward   : ${resumen.metricas.misionMasRecompensante ? `"${resumen.metricas.misionMasRecompensante.titulo}" (${resumen.metricas.misionMasRecompensante.recompensa.experiencia} EXP / ${resumen.metricas.misionMasRecompensante.recompensa.oro} Oro)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE BITACORA (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE MISIONES POR TIPO:`);
    Object.entries(resumen.metricas.desglosePorTipo).forEach(([tipo, cantidad]) => {
        console.log(`   - ${tipo.padEnd(14)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.misionesProcesadas.map((m) => ({
            ID: m.id,
            Codigo: m.codigoMision,
            Titulo: m.titulo,
            Tipo: m.tipo,
            Dificultad: m.dificultad,
            NivelReq: m.nivelRequerido,
            Duracion: `${m.duracionEstimadaMinutos} min`,
            Estado: m.estado,
            'EXP / Oro': `${m.recompensa.experiencia} / ${m.recompensa.oro}`
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite Async/Await)

const m1: MisionRPG = {
    id: 'qst-01',
    codigoMision: 'QST-MAIN-101',
    titulo: 'La Maldicion del Rey Olvidado',
    tipo: 'Principal',
    dificultad: 'Heroica',
    nivelRequerido: 25,
    duracionEstimadaMinutos: 90,
    estado: 'Completada',
    recompensa: {
        experiencia: 15000,
        oro: 2500,
        items: ['Espada de Sombras', 'Casco Real Guardián'],
        reputacion: 500
    }
};

const m2: MisionRPG = {
    id: 'qst-02',
    codigoMision: 'QST-SIDE-102',
    titulo: 'Caza de Lobos de la Niebla',
    tipo: 'Secundaria',
    dificultad: 'Normal',
    nivelRequerido: 10,
    duracionEstimadaMinutos: 30,
    estado: 'Completada',
    recompensa: {
        experiencia: 3500,
        oro: 600,
        items: ['Piel de Lobo x5'],
        reputacion: 100
    },
    requiereMisionPreviaId: 'qst-01'
};

const m3: MisionRPG = {
    id: 'qst-03',
    codigoMision: 'QST-GUILD-103',
    titulo: 'Asalto a la Fortaleza Subterranea',
    tipo: 'Gremio',
    dificultad: 'Legendaria',
    nivelRequerido: 30,
    duracionEstimadaMinutos: 180,
    estado: 'EnProgreso',
    recompensa: {
        experiencia: 45000,
        oro: 10000,
        items: ['Gema Elemental de Fuego', 'Escudo Legendario'],
        reputacion: 1000
    },
    requiereMisionPreviaId: 'qst-01'
};

// --- CASO 1: Bitacora de Jugador Activo Nivel 35 (Caso Normal) ---
const bitacoraNormal: BitacoraMisiones = {
    id: 'BIT-HERO-01',
    jugadorId: 'plr-777',
    nombreJugador: 'Aragorn_Madness',
    nivelJugador: 35,
    misiones: [m1, m2, m3]
};

// --- CASO 2: Nivel Insuficiente, Recompensa Negativa y Dependencia Rota (Caso Límite) ---
const misionCorrupta: MisionRPG = {
    id: 'qst-99',
    codigoMision: 'QST-ERR-999',
    titulo: 'Mision Corrupta de Pruebas',
    tipo: 'Diaria',
    dificultad: 'Facil',
    nivelRequerido: 50, // Nivel 50 > Nivel Jugador 15 -> Inconsistencia en progreso
    duracionEstimadaMinutos: -10, // Duracion negativa -> Invalido
    estado: 'EnProgreso',
    recompensa: {
        experiencia: -500, // EXP negativa -> Invalido
        oro: -100, // Oro negativo -> Invalido
        items: [],
        reputacion: 5000 // Reputacion fuera de rango
    },
    requiereMisionPreviaId: 'qst-inexistente' // Dependencia rota
};

const bitacoraLimiteCorrupta: BitacoraMisiones = {
    id: 'BIT-FAIL-02',
    jugadorId: 'plr-000',
    nombreJugador: 'Novato_Error',
    nivelJugador: 15,
    misiones: [
        m1,
        misionCorrupta,
        m1 // Mision duplicada
    ]
};

async function ejecutarPruebas(): Promise<void> {
    const servicio = new ServicioGestorMisionesRPG();

    // Ejecucion Caso 1
    const resumenNormal = await servicio.procesarBitacoraAsync(bitacoraNormal);
    mostrarResumenMisionesRPG(resumenNormal, 'Caso Normal - Bitacora de Aragorn');

    // Ejecucion Caso 2
    const resumenLimite = await servicio.procesarBitacoraAsync(bitacoraLimiteCorrupta);
    mostrarResumenMisionesRPG(resumenLimite, 'Caso Limite - Recompensas Negativas y Dependencias Rotas');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecucion:', err));