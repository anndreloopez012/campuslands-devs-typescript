
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Clases)

export type EstadoReserva =
    | 'Confirmada'
    | 'EnEspera'
    | 'Completada'
    | 'Cancelada'
    | 'NoPresentado';

export type UbicacionMesa =
    | 'SalónPrincipal'
    | 'Terraza'
    | 'VIP'
    | 'Barra'
    | 'Jardín';

export type TipoOcasion =
    | 'Casual'
    | 'Cumpleaños'
    | 'Aniversario'
    | 'Negocios'
    | 'Romántica';

export interface ClienteRestaurante {
    readonly id: string;
    readonly nombre: string;
    readonly telefono: string;
    readonly email: string;
    readonly esVip: boolean;
}

export interface MesaRestaurante {
    readonly id: string;
    readonly numeroMesa: number;
    readonly capacidadPersonas: number;
    readonly ubicacion: UbicacionMesa;
    readonly esAccesible: boolean;
}

export interface ReservaRestaurante {
    readonly id: string;
    readonly codigoReserva: string;
    readonly cliente: ClienteRestaurante;
    readonly mesa: MesaRestaurante;
    readonly numeroComensales: number;
    readonly fechaHora: string; // ISO 8601
    readonly ocasion: TipoOcasion;
    readonly estado: EstadoReserva;
    readonly consumoEstimadoUSD: number;
    readonly notasEspeciales?: string;
}

export interface MetricasReservas {
    readonly totalReservas: number;
    readonly reservasCompletadas: number;
    readonly porcentajeOcupacion: number;
    readonly consumoTotalEstimadoUSD: number;
    readonly promedioConsumoPorPersonaUSD: number;
    readonly reservaMayorConsumo: ReservaRestaurante | null;
    readonly desglosePorUbicacion: Readonly<Record<UbicacionMesa, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoReserva, number>>;
}

export interface ResumenGestionReservas {
    readonly restauranteNombre: string;
    readonly fechaJornada: string;
    readonly totalReservasValidas: number;
    readonly metricas: MetricasReservas;
    readonly reservasProcesadas: readonly ReservaRestaurante[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y CLASE DE GESTIÓN (Generics & Encapsulamiento)

export class ContenedorColeccion<T extends { readonly id: string }> {
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

// 3. VALIDACIONES Y REGLAS DE NEGOCIO

export function validarMesa(mesa: MesaRestaurante): ResultadoValidacion<MesaRestaurante> {
    const errores: string[] = [];

    if (mesa.numeroMesa <= 0) {
        errores.push(`Número de mesa inválido (${mesa.numeroMesa}). Debe ser mayor a 0.`);
    }

    if (mesa.capacidadPersonas <= 0 || mesa.capacidadPersonas > 20) {
        errores.push(`Capacidad de mesa fuera de rango (${mesa.capacidadPersonas} personas) en mesa #${mesa.numeroMesa}.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: mesa }
        : { esValido: false, errores };
}

export function validarReserva(reserva: ReservaRestaurante): ResultadoValidacion<ReservaRestaurante> {
    const errores: string[] = [];

    if (reserva.numeroComensales <= 0) {
        errores.push(`Número de comensales inválido (${reserva.numeroComensales}) en reserva ${reserva.codigoReserva}.`);
    }

    if (reserva.numeroComensales > reserva.mesa.capacidadPersonas) {
        errores.push(
            `Exceso de capacidad en reserva ${reserva.codigoReserva}: ${reserva.numeroComensales} comensales para una mesa de ${reserva.mesa.capacidadPersonas}.`
        );
    }

    if (reserva.consumoEstimadoUSD < 0) {
        errores.push(`Consumo estimado negativo ($${reserva.consumoEstimadoUSD}) en reserva ${reserva.codigoReserva}.`);
    }

    if (reserva.cliente.nombre.trim().length === 0) {
        errores.push(`La reserva ${reserva.codigoReserva} requiere un nombre de cliente válido.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: reserva }
        : { esValido: false, errores };
}

export function validarRestauranteRaw(reservas: readonly ReservaRestaurante[]): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();
    const codigosVistos = new Set<string>();

    if (reservas.length === 0) {
        advertencias.push('La lista de reservas para la jornada está totalmente vacía.');
    }

    for (const r of reservas) {
        if (idsVistos.has(r.id)) {
            advertencias.push(`Reserva duplicada detectada por ID: ${r.id}.`);
        }
        if (codigosVistos.has(r.codigoReserva)) {
            advertencias.push(`Código de reserva duplicado: ${r.codigoReserva}.`);
        }
        idsVistos.add(r.id);
        codigosVistos.add(r.codigoReserva);
    }

    return advertencias;
}

// 4. TRANSFORMACIÓN Y CÁLCULOS METRICOS (reduce & Record)

const UBICACIONES_MESA: readonly UbicacionMesa[] = [
    'SalónPrincipal',
    'Terraza',
    'VIP',
    'Barra',
    'Jardín'
];

const ESTADOS_RESERVA: readonly EstadoReserva[] = [
    'Confirmada',
    'EnEspera',
    'Completada',
    'Cancelada',
    'NoPresentado'
];

export function calcularMetricasReservas(reservas: readonly ReservaRestaurante[]): MetricasReservas {
    if (reservas.length === 0) {
        const desgloseUbicacionVacio = UBICACIONES_MESA.reduce((acc, u) => {
            acc[u] = 0;
            return acc;
        }, {} as Record<UbicacionMesa, number>);

        const desgloseEstadoVacio = ESTADOS_RESERVA.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstadoReserva, number>);

        return {
            totalReservas: 0,
            reservasCompletadas: 0,
            porcentajeOcupacion: 0,
            consumoTotalEstimadoUSD: 0,
            promedioConsumoPorPersonaUSD: 0,
            reservaMayorConsumo: null,
            desglosePorUbicacion: desgloseUbicacionVacio,
            desglosePorEstado: desgloseEstadoVacio
        };
    }

    const completadas = reservas.filter((r) => r.estado === 'Completada' || r.estado === 'Confirmada');
    const cantidadCompletadas = completadas.length;
    const porcentajeOcupacion = Number(((cantidadCompletadas / reservas.length) * 100).toFixed(1));

    const consumoTotalEstimadoUSD = Number(
        reservas.reduce((acc, r) => acc + r.consumoEstimadoUSD, 0).toFixed(2)
    );

    const totalComensales = reservas.reduce((acc, r) => acc + r.numeroComensales, 0);
    const promedioConsumoPorPersonaUSD = totalComensales > 0
        ? Number((consumoTotalEstimadoUSD / totalComensales).toFixed(2))
        : 0;

    const reservaMayorConsumo = [...reservas].sort(
        (a, b) => b.consumoEstimadoUSD - a.consumoEstimadoUSD
    )[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorUbicacion = reservas.reduce((acc, r) => {
        acc[r.mesa.ubicacion] = (acc[r.mesa.ubicacion] ?? 0) + 1;
        return acc;
    }, UBICACIONES_MESA.reduce((acc, u) => ({ ...acc, [u]: 0 }), {} as Record<UbicacionMesa, number>));

    const desglosePorEstado = reservas.reduce((acc, r) => {
        acc[r.estado] = (acc[r.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_RESERVA.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoReserva, number>));

    return {
        totalReservas: reservas.length,
        reservasCompletadas: cantidadCompletadas,
        porcentajeOcupacion,
        consumoTotalEstimadoUSD,
        promedioConsumoPorPersonaUSD,
        reservaMayorConsumo,
        desglosePorUbicacion,
        desglosePorEstado
    };
}

export class ServicioGestionReservas {
    private readonly contenedor = new ContenedorColeccion<ReservaRestaurante>();
    private readonly advertencias: string[] = [];

    constructor(
        private readonly restauranteNombre: string,
        private readonly fechaJornada: string
    ) { }

    public procesarListaReservas(reservasRaw: readonly ReservaRestaurante[]): ResumenGestionReservas {
        this.advertencias.push(...validarRestauranteRaw(reservasRaw));

        for (const rawReserva of reservasRaw) {
            const resMesa = validarMesa(rawReserva.mesa);
            const resReserva = validarReserva(rawReserva);

            if (!resMesa.esValido) {
                this.advertencias.push(...resMesa.errores.map((err) => `Reserva ${rawReserva.codigoReserva}: ${err}`));
            }
            if (!resReserva.esValido) {
                this.advertencias.push(...resReserva.errores);
            }

            if (resMesa.esValido && resReserva.esValido) {
                const agregada = this.contenedor.agregar(rawReserva);
                if (!agregada) {
                    this.advertencias.push(`No se pudo agregar la reserva duplicada por ID: ${rawReserva.id}`);
                }
            }
        }

        const reservasValidas = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasReservas(reservasValidas);

        return {
            restauranteNombre: this.restauranteNombre,
            fechaJornada: this.fechaJornada,
            totalReservasValidas: reservasValidas.length,
            metricas,
            reservasProcesadas: reservasValidas,
            advertencias: this.advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenReservas(resumen: ResumenGestionReservas, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` GESTIÓN DE RESERVAS DE RESTAURANTE - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Restaurante         : ${resumen.restauranteNombre}`);
    console.log(`Fecha Jornada       : ${resumen.fechaJornada}`);
    console.log(`Reservas Validadas  : ${resumen.totalReservasValidas}`);
    console.log(`Efectividad Ocupación: ${resumen.metricas.reservasCompletadas} de ${resumen.metricas.totalReservas} (${resumen.metricas.porcentajeOcupacion}%)`);
    console.log(`Consumo Total USD   : $${resumen.metricas.consumoTotalEstimadoUSD.toLocaleString()} USD`);
    console.log(`Promedio / Person   : $${resumen.metricas.promedioConsumoPorPersonaUSD} USD`);
    console.log(`Mayor Consumo       : ${resumen.metricas.reservaMayorConsumo ? `${resumen.metricas.reservaMayorConsumo.codigoReserva} ($${resumen.metricas.reservaMayorConsumo.consumoEstimadoUSD} USD - ${resumen.metricas.reservaMayorConsumo.cliente.nombre})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE RESERVAS (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE RESERVAS POR UBICACIÓN DE MESA:`);
    Object.entries(resumen.metricas.desglosePorUbicacion).forEach(([ub, cantidad]) => {
        console.log(`   - ${ub.padEnd(18)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.reservasProcesadas.map((r) => ({
            Código: r.codigoReserva,
            Cliente: r.cliente.nombre,
            VIP: r.cliente.esVip ? 'Sí' : 'No',
            Mesa: `#${r.mesa.numeroMesa} (${r.mesa.ubicacion})`,
            Comensales: `${r.numeroComensales}/${r.mesa.capacidadPersonas}`,
            Ocasión: r.ocasion,
            Consumo: `$${r.consumoEstimadoUSD}`,
            Estado: r.estado
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const cliente1: ClienteRestaurante = { id: 'c-01', nombre: 'José Rodríguez', telefono: '+502 5555-1234', email: 'jose@example.com', esVip: true };
const cliente2: ClienteRestaurante = { id: 'c-02', nombre: 'María Mercedes', telefono: '+502 4444-5678', email: 'maria@example.com', esVip: false };

const mesa1: MesaRestaurante = { id: 'm-01', numeroMesa: 12, capacidadPersonas: 4, ubicacion: 'Terraza', esAccesible: true };
const mesa2: MesaRestaurante = { id: 'm-02', numeroMesa: 5, capacidadPersonas: 2, ubicacion: 'VIP', esAccesible: true };
const mesa3: MesaRestaurante = { id: 'm-03', numeroMesa: 1, capacidadPersonas: 6, ubicacion: 'SalónPrincipal', esAccesible: true };

// --- CASO 1: Jornada de Fin de Semana en Restaurante Gourmet (Caso Normal) ---
const reservasNormales: readonly ReservaRestaurante[] = [
    {
        id: 'res-01',
        codigoReserva: 'RES-VIP-101',
        cliente: cliente1,
        mesa: mesa2,
        numeroComensales: 2,
        fechaHora: '2026-11-14T20:00:00Z',
        ocasion: 'Aniversario',
        estado: 'Completada',
        consumoEstimadoUSD: 280.0
    },
    {
        id: 'res-02',
        codigoReserva: 'RES-TER-102',
        cliente: cliente2,
        mesa: mesa1,
        numeroComensales: 4,
        fechaHora: '2026-11-14T21:30:00Z',
        ocasion: 'Cumpleaños',
        estado: 'Confirmada',
        consumoEstimadoUSD: 195.5
    },
    {
        id: 'res-03',
        codigoReserva: 'RES-SAL-103',
        cliente: cliente1,
        mesa: mesa3,
        numeroComensales: 5,
        fechaHora: '2026-11-14T19:00:00Z',
        ocasion: 'Negocios',
        estado: 'Completada',
        consumoEstimadoUSD: 450.0
    }
];

// --- CASO 2: Exceso de Comensales, Consumo Negativo y Código Duplicado (Caso Límite) ---
const mesaInvalida: MesaRestaurante = { id: 'm-99', numeroMesa: 0, capacidadPersonas: 2, ubicacion: 'Barra', esAccesible: false };

const reservasLimiteCorruptas: readonly ReservaRestaurante[] = [
    {
        id: 'res-04',
        codigoReserva: 'RES-ERR-01',
        cliente: cliente2,
        mesa: mesaInvalida, // Mesa #0 -> Inválido
        numeroComensales: 8, // 8 comensales para capacidad 2 -> Exceso
        fechaHora: '2026-11-15T18:00:00Z',
        ocasion: 'Casual',
        estado: 'EnEspera',
        consumoEstimadoUSD: -50.0 // Consumo negativo -> Inválido
    },
    {
        id: 'res-01', // ID duplicado con res-01
        codigoReserva: 'RES-VIP-101', // Código duplicado
        cliente: cliente1,
        mesa: mesa2,
        numeroComensales: 2,
        fechaHora: '2026-11-14T20:00:00Z',
        ocasion: 'Aniversario',
        estado: 'Completada',
        consumoEstimadoUSD: 280.0
    }
];

// Ejecución Caso 1
const servicioNormal = new ServicioGestionReservas('Bistró Macondo Gourmet', '2026-11-14');
const resumenNormal = servicioNormal.procesarListaReservas(reservasNormales);
mostrarResumenReservas(resumenNormal, 'Caso Normal - Jornada Fin de Semana');

// Ejecución Caso 2
const servicioLimite = new ServicioGestionReservas('Bistró Macondo Gourmet', '2026-11-15');
const resumenLimite = servicioLimite.procesarListaReservas(reservasLimiteCorruptas);
mostrarResumenReservas(resumenLimite, 'Caso Límite - Capacidad Excedida y Consumos Negativos');