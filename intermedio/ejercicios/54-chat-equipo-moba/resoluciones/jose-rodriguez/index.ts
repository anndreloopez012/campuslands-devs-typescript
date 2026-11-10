
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Promises)

export type RolCarril = 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support';

export type TipoMensaje =
    | 'Texto'
    | 'PingObjetivo'
    | 'PingPeligro'
    | 'PingAlerta'
    | 'Comando';

export type EstadoModeracion = 'Aprobado' | 'Advertido' | 'Filtrado' | 'Bloqueado';

export interface JugadorMOBA {
    readonly id: string;
    readonly invocadorNombre: string;
    readonly campeon: string;
    readonly rol: RolCarril;
}

export interface MensajeChat {
    readonly id: string;
    readonly codigoMensaje: string;
    readonly jugador: JugadorMOBA;
    readonly tipo: TipoMensaje;
    readonly contenido: string;
    readonly minutoPartida: number; // e.g., 14.5 min
    readonly estado: EstadoModeracion;
    readonly reportadoPorToxicidad: boolean;
}

export interface SalaChatMOBA {
    readonly id: string;
    readonly codigoSala: string;
    readonly nombrePartida: string;
    readonly mensajes: readonly MensajeChat[];
}

export interface MetricasChatMOBA {
    readonly totalMensajes: number;
    readonly mensajesAprobadosCount: number;
    readonly porcentajeMensajesLimpios: number;
    readonly totalPings: number;
    readonly totalReportesToxicidad: number;
    readonly jugadorMasActivo: JugadorMOBA | null;
    readonly desglosePorRol: Readonly<Record<RolCarril, number>>;
    readonly desglosePorTipo: Readonly<Record<TipoMensaje, number>>;
}

export interface ResumenChatMOBA {
    readonly salaId: string;
    readonly codigoSala: string;
    readonly nombrePartida: string;
    readonly totalMensajesValidos: number;
    readonly metricas: MetricasChatMOBA;
    readonly mensajesProcesados: readonly MensajeChat[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y GESTIÓN DE CHAT (Generics & Encapsulamiento)

export class ContenedorChat<T extends { readonly id: string; readonly codigoMensaje: string }> {
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

const PALABRAS_PROHIBIDAS: readonly string[] = ['noob', 'ff15', 'troll', 'report', 'afk'];

export function validarMensaje(mensaje: MensajeChat): ResultadoValidacion<MensajeChat> {
    const errores: string[] = [];

    if (mensaje.minutoPartida < 0 || mensaje.minutoPartida > 120) {
        errores.push(`Minuto de partida invalido (${mensaje.minutoPartida} min) en mensaje "${mensaje.codigoMensaje}".`);
    }

    if (mensaje.contenido.trim().length === 0) {
        errores.push(`El mensaje "${mensaje.codigoMensaje}" no contiene texto ni comando valido.`);
    }

    if (mensaje.jugador.invocadorNombre.trim().length === 0) {
        errores.push(`El mensaje "${mensaje.codigoMensaje}" no tiene un jugador asignado.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: mensaje }
        : { esValido: false, errores };
}

export async function moderarMensajeAsync(
    mensaje: MensajeChat
): Promise<MensajeChat> {
    // Simulacion de filtro de chat asincrono
    await new Promise((resolve) => setTimeout(resolve, 10));

    const contenidoLower = mensaje.contenido.toLowerCase();
    const contieneInsulto = PALABRAS_PROHIBIDAS.some((palabra) => contenidoLower.includes(palabra));

    if (contieneInsulto || mensaje.reportadoPorToxicidad) {
        return {
            ...mensaje,
            estado: 'Filtrado'
        };
    }

    return mensaje;
}

export async function validarSalaChatAsync(
    sala: SalaChatMOBA
): Promise<ResultadoValidacion<SalaChatMOBA>> {
    await new Promise((resolve) => setTimeout(resolve, 15));

    const errores: string[] = [];

    if (sala.mensajes.length === 0) {
        errores.push(`La sala de chat "${sala.nombrePartida}" no contiene mensajes registrados.`);
    }

    for (const m of sala.mensajes) {
        const resVal = validarMensaje(m);
        if (!resVal.esValido) {
            errores.push(...resVal.errores);
        }
    }

    return errores.length === 0
        ? { esValido: true, datos: sala }
        : { esValido: false, errores };
}

// 4. TRANSFORMACIÓN Y CÁLCULOS MÉTRICOS (reduce & Record)

const ROLES_CARRIL: readonly RolCarril[] = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

const TIPOS_MENSAJE: readonly TipoMensaje[] = [
    'Texto',
    'PingObjetivo',
    'PingPeligro',
    'PingAlerta',
    'Comando'
];

export function calcularMetricasChat(mensajes: readonly MensajeChat[]): MetricasChatMOBA {
    if (mensajes.length === 0) {
        const desgloseRolVacio = ROLES_CARRIL.reduce((acc, r) => {
            acc[r] = 0;
            return acc;
        }, {} as Record<RolCarril, number>);

        const desgloseTipoVacio = TIPOS_MENSAJE.reduce((acc, t) => {
            acc[t] = 0;
            return acc;
        }, {} as Record<TipoMensaje, number>);

        return {
            totalMensajes: 0,
            mensajesAprobadosCount: 0,
            porcentajeMensajesLimpios: 0,
            totalPings: 0,
            totalReportesToxicidad: 0,
            jugadorMasActivo: null,
            desglosePorRol: desgloseRolVacio,
            desglosePorTipo: desgloseTipoVacio
        };
    }

    const aprobados = mensajes.filter((m) => m.estado === 'Aprobado');
    const mensajesAprobadosCount = aprobados.length;
    const porcentajeMensajesLimpios = Number(((mensajesAprobadosCount / mensajes.length) * 100).toFixed(1));

    const pings = mensajes.filter((m) => m.tipo.startsWith('Ping'));
    const totalPings = pings.length;

    const reportes = mensajes.filter((m) => m.reportadoPorToxicidad || m.estado === 'Filtrado');
    const totalReportesToxicidad = reportes.length;

    const conteoJugador = mensajes.reduce((acc, m) => {
        const key = m.jugador.id;
        if (!acc[key]) {
            acc[key] = { jugador: m.jugador, total: 0 };
        }
        acc[key].total += 1;
        return acc;
    }, {} as Record<string, { jugador: JugadorMOBA; total: number }>);

    const jugadorMasActivo = (Object.values(conteoJugador).sort(
        (a, b) => b.total - a.total
    )[0]?.jugador) ?? null;

    const desglosePorRol = mensajes.reduce((acc, m) => {
        acc[m.jugador.rol] = (acc[m.jugador.rol] ?? 0) + 1;
        return acc;
    }, ROLES_CARRIL.reduce((acc, r) => ({ ...acc, [r]: 0 }), {} as Record<RolCarril, number>));

    const desglosePorTipo = mensajes.reduce((acc, m) => {
        acc[m.tipo] = (acc[m.tipo] ?? 0) + 1;
        return acc;
    }, TIPOS_MENSAJE.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TipoMensaje, number>));

    return {
        totalMensajes: mensajes.length,
        mensajesAprobadosCount,
        porcentajeMensajesLimpios,
        totalPings,
        totalReportesToxicidad,
        jugadorMasActivo,
        desglosePorRol,
        desglosePorTipo
    };
}

export class ServicioGestionChatMOBA {
    private readonly contenedor = new ContenedorChat<MensajeChat>();

    public async procesarChatAsync(salaRaw: SalaChatMOBA): Promise<ResumenChatMOBA> {
        const advertencias: string[] = [];
        const valRes = await validarSalaChatAsync(salaRaw);

        if (!valRes.esValido) {
            advertencias.push(...valRes.errores);
        }

        const idsVistos = new Set<string>();
        for (const rawMsg of salaRaw.mensajes) {
            if (idsVistos.has(rawMsg.id)) {
                advertencias.push(`Mensaje duplicado detectado por ID: ${rawMsg.id}.`);
            } else {
                idsVistos.add(rawMsg.id);
                const mensajeModerado = await moderarMensajeAsync(rawMsg);
                this.contenedor.agregar(mensajeModerado);
            }
        }

        const mensajesValidos = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasChat(mensajesValidos);

        if (metricas.totalReportesToxicidad > 0) {
            advertencias.push(
                `Alerta de moderacion: Se detectaron ${metricas.totalReportesToxicidad} mensaje(s) con posible toxicidad o comportamiento no deportivo.`
            );
        }

        return {
            salaId: salaRaw.id,
            codigoSala: salaRaw.codigoSala,
            nombrePartida: salaRaw.nombrePartida,
            totalMensajesValidos: mensajesValidos.length,
            metricas,
            mensajesProcesados: mensajesValidos,
            advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenChatMOBA(resumen: ResumenChatMOBA, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` CHAT DE EQUIPO MOBA - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Partida MOBA        : ${resumen.nombrePartida}`);
    console.log(`Codigo Sala         : ${resumen.codigoSala}`);
    console.log(`Mensajes Validados  : ${resumen.totalMensajesValidos}`);
    console.log(`Mensajes Limpios    : ${resumen.metricas.mensajesAprobadosCount} de ${resumen.metricas.totalMensajes} (${resumen.metricas.porcentajeMensajesLimpios}%)`);
    console.log(`Total Pings Usados  : ${resumen.metricas.totalPings}`);
    console.log(`Reportes Toxicidad  : ${resumen.metricas.totalReportesToxicidad}`);
    console.log(`Jugador Mas Activo  : ${resumen.metricas.jugadorMasActivo ? `${resumen.metricas.jugadorMasActivo.invocadorNombre} (${resumen.metricas.jugadorMasActivo.campeon} - ${resumen.metricas.jugadorMasActivo.rol})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE MODERACION (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE MENSAJES POR ROL DE CARRIL:`);
    Object.entries(resumen.metricas.desglosePorRol).forEach(([rol, cantidad]) => {
        console.log(`   - ${rol.padEnd(12)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.mensajesProcesados.map((m) => ({
            ID: m.id,
            Tiempo: `${m.minutoPartida} min`,
            Jugador: m.jugador.invocadorNombre,
            Campeon: m.jugador.campeon,
            Rol: m.jugador.rol,
            Tipo: m.tipo,
            Contenido: m.contenido,
            Estado: m.estado
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite Async/Await)

const j1: JugadorMOBA = { id: 'p1', invocadorNombre: 'Faker_Fan', campeon: 'Ahri', rol: 'Mid' };
const j2: JugadorMOBA = { id: 'p2', invocadorNombre: 'Jungle_King', campeon: 'LeeSin', rol: 'Jungle' };
const j3: JugadorMOBA = { id: 'p3', invocadorNombre: 'Support_God', campeon: 'Thresh', rol: 'Support' };

const m1: MensajeChat = {
    id: 'msg-01',
    codigoMensaje: 'MSG-101',
    jugador: j2,
    tipo: 'PingObjetivo',
    contenido: 'Objetivo Dragón de fuego en 30 segundos',
    minutoPartida: 14.2,
    estado: 'Aprobado',
    reportadoPorToxicidad: false
};

const m2: MensajeChat = {
    id: 'msg-02',
    codigoMensaje: 'MSG-102',
    jugador: j1,
    tipo: 'Texto',
    contenido: 'Voy hacia abajo a ayudar bot lane',
    minutoPartida: 14.5,
    estado: 'Aprobado',
    reportadoPorToxicidad: false
};

const m3: MensajeChat = {
    id: 'msg-03',
    codigoMensaje: 'MSG-103',
    jugador: j3,
    tipo: 'PingPeligro',
    contenido: 'Peligro en arbusto de rio',
    minutoPartida: 15.0,
    estado: 'Aprobado',
    reportadoPorToxicidad: false
};

// --- CASO 1: Chat de Equipo Coordinado en Partida Clasificatoria (Caso Normal) ---
const salaNormal: SalaChatMOBA = {
    id: 'ROOM-MOBA-01',
    codigoSala: 'MATCH-RANKED-2026',
    nombrePartida: 'Clasificatoria Solo/Duo Diamante I',
    mensajes: [m1, m2, m3]
};

// --- CASO 2: Insultos en Chat, Mensaje Duplicado y Minuto Inválido (Caso Límite) ---
const mensajeToxic: MensajeChat = {
    id: 'msg-99',
    codigoMensaje: 'MSG-ERR-999',
    jugador: { id: 'p9', invocadorNombre: 'Rager_Toxic', campeon: 'Darius', rol: 'Top' },
    tipo: 'Texto',
    contenido: 'Noob jungle report ff15 afk',
    minutoPartida: -5, // Minuto invalido -> Error de validacion
    estado: 'Aprobado',
    reportadoPorToxicidad: true
};

const salaLimiteCorrupta: SalaChatMOBA = {
    id: 'ROOM-FAIL-02',
    codigoSala: 'MATCH-TOXIC-02',
    nombrePartida: 'Partida Con Comportamiento No Deportivo',
    mensajes: [
        m1,
        mensajeToxic,
        m1 // Mensaje duplicado
    ]
};

async function ejecutarPruebas(): Promise<void> {
    const servicio = new ServicioGestionChatMOBA();

    // Ejecución Caso 1
    const resumenNormal = await servicio.procesarChatAsync(salaNormal);
    mostrarResumenChatMOBA(resumenNormal, 'Caso Normal - Partida Clasificatoria Coordinada');

    // Ejecución Caso 2
    const resumenLimite = await servicio.procesarChatAsync(salaLimiteCorrupta);
    mostrarResumenChatMOBA(resumenLimite, 'Caso Limite - Filtro de Toxicidad y Datos Corruptos');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecucion:', err));