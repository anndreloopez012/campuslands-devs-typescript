
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Clases)

export type TipoSalto =
    | 'Tandem'
    | 'SoloAFF'
    | 'Formacion'
    | 'Freefly'
    | 'Wingsuit'
    | 'SaltoBajo';

export type EstadoSalto =
    | 'Completado'
    | 'AperturaReserva'
    | 'Incierto'
    | 'Abortado';

export type CategoriaLicencia = 'Alumno' | 'LicenciaA' | 'LicenciaB' | 'LicenciaC' | 'LicenciaD';

export interface Paracaidista {
    readonly id: string;
    readonly nombre: string;
    readonly licencia: CategoriaLicencia;
    readonly saltosAcumulados: number;
}

export interface RegistroSalto {
    readonly id: string;
    readonly numeroSalto: number;
    readonly paracaidista: Paracaidista;
    readonly tipoSalto: TipoSalto;
    readonly altitudSalidaPies: number;
    readonly altitudAperturaPies: number;
    readonly tiempoCaidaLibreSegundos: number;
    readonly estado: EstadoSalto;
    readonly zonaSalto: string;
    readonly fechaHora: string;
    readonly equipoUsado: string;
}

export interface MetricasLogSaltos {
    readonly totalSaltos: number;
    readonly saltosCompletadosCount: number;
    readonly porcentajeExito: number;
    readonly altitudSalidaPromedioPies: number;
    readonly tiempoTotalCaidaLibreSegundos: number;
    readonly tiempoTotalCaidaLibreMinutos: number;
    readonly saltoMayorCaidaLibre: RegistroSalto | null;
    readonly desglosePorTipo: Readonly<Record<TipoSalto, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoSalto, number>>;
}

export interface ResumenLogSaltos {
    readonly paracaidistaNombre: string;
    readonly licencia: CategoriaLicencia;
    readonly totalSaltosValidos: number;
    readonly metricas: MetricasLogSaltos;
    readonly saltosProcesados: readonly RegistroSalto[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y CLASE DE LOG (Generics & Encapsulamiento)

export class ContenedorColeccionSaltos<T extends { readonly id: string; readonly numeroSalto: number }> {
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
        return Array.from(this.elementos.values()).sort((a, b) => a.numeroSalto - b.numeroSalto);
    }

    public existe(id: string): boolean {
        return this.elementos.has(id);
    }

    public obtenerTamano(): number {
        return this.elementos.size;
    }
}

// 3. VALIDACIONES Y REGLAS DE NEGOCIO

export function validarParacaidista(paracaidista: Paracaidista): ResultadoValidacion<Paracaidista> {
    const errores: string[] = [];

    if (paracaidista.saltosAcumulados < 0) {
        errores.push(`Saltos acumulados inválidos (${paracaidista.saltosAcumulados}) para "${paracaidista.nombre}".`);
    }

    if (paracaidista.nombre.trim().length === 0) {
        errores.push('El paracaidista debe registrar un nombre válido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: paracaidista }
        : { esValido: false, errores };
}

export function validarRegistroSalto(salto: RegistroSalto): ResultadoValidacion<RegistroSalto> {
    const errores: string[] = [];

    if (salto.numeroSalto <= 0) {
        errores.push(`Número de salto inválido (#${salto.numeroSalto}). Debe ser mayor a 0.`);
    }

    if (salto.altitudSalidaPies <= 0 || salto.altitudSalidaPies > 35000) {
        errores.push(`Altitud de salida fuera de rango (${salto.altitudSalidaPies} ft) en salto #${salto.numeroSalto}.`);
    }

    if (salto.altitudAperturaPies <= 0 || salto.altitudAperturaPies >= salto.altitudSalidaPies) {
        errores.push(
            `Inconsistencia de altitud en salto #${salto.numeroSalto}: Altitud de apertura (${salto.altitudAperturaPies} ft) debe ser menor a la de salida (${salto.altitudSalidaPies} ft).`
        );
    }

    if (salto.tiempoCaidaLibreSegundos < 0 || salto.tiempoCaidaLibreSegundos > 300) {
        errores.push(`Tiempo de caída libre fuera de rango (${salto.tiempoCaidaLibreSegundos}s) en salto #${salto.numeroSalto}.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: salto }
        : { esValido: false, errores };
}

export function validarLogRaw(saltos: readonly RegistroSalto[]): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();
    const numerosSaltoVistos = new Set<number>();

    if (saltos.length === 0) {
        advertencias.push('El log de saltos de paracaidismo está totalmente vacío.');
    }

    for (const s of saltos) {
        if (idsVistos.has(s.id)) {
            advertencias.push(`Registro de salto duplicado por ID: ${s.id}.`);
        }
        if (numerosSaltoVistos.has(s.numeroSalto)) {
            advertencias.push(`Número de salto duplicado detectado: #${s.numeroSalto}.`);
        }
        idsVistos.add(s.id);
        numerosSaltoVistos.add(s.numeroSalto);
    }

    return advertencias;
}

// 4. TRANSFORMACIÓN Y CÁLCULOS MÉTRICOS (reduce & Record)

const TIPOS_SALTO: readonly TipoSalto[] = [
    'Tandem',
    'SoloAFF',
    'Formacion',
    'Freefly',
    'Wingsuit',
    'SaltoBajo'
];

const ESTADOS_SALTO: readonly EstadoSalto[] = [
    'Completado',
    'AperturaReserva',
    'Incierto',
    'Abortado'
];

export function calcularMetricasSaltos(saltos: readonly RegistroSalto[]): MetricasLogSaltos {
    if (saltos.length === 0) {
        const desgloseTipoVacio = TIPOS_SALTO.reduce((acc, t) => {
            acc[t] = 0;
            return acc;
        }, {} as Record<TipoSalto, number>);

        const desgloseEstadoVacio = ESTADOS_SALTO.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstadoSalto, number>);

        return {
            totalSaltos: 0,
            saltosCompletadosCount: 0,
            porcentajeExito: 0,
            altitudSalidaPromedioPies: 0,
            tiempoTotalCaidaLibreSegundos: 0,
            tiempoTotalCaidaLibreMinutos: 0,
            saltoMayorCaidaLibre: null,
            desglosePorTipo: desgloseTipoVacio,
            desglosePorEstado: desgloseEstadoVacio
        };
    }

    const completados = saltos.filter((s) => s.estado === 'Completado');
    const saltosCompletadosCount = completados.length;
    const porcentajeExito = Number(((saltosCompletadosCount / saltos.length) * 100).toFixed(1));

    const sumaAltitudes = saltos.reduce((acc, s) => acc + s.altitudSalidaPies, 0);
    const altitudSalidaPromedioPies = Math.round(sumaAltitudes / saltos.length);

    const tiempoTotalCaidaLibreSegundos = saltos.reduce((acc, s) => acc + s.tiempoCaidaLibreSegundos, 0);
    const tiempoTotalCaidaLibreMinutos = Number((tiempoTotalCaidaLibreSegundos / 60).toFixed(1));

    const saltoMayorCaidaLibre = [...saltos].sort(
        (a, b) => b.tiempoCaidaLibreSegundos - a.tiempoCaidaLibreSegundos
    )[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorTipo = saltos.reduce((acc, s) => {
        acc[s.tipoSalto] = (acc[s.tipoSalto] ?? 0) + 1;
        return acc;
    }, TIPOS_SALTO.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TipoSalto, number>));

    const desglosePorEstado = saltos.reduce((acc, s) => {
        acc[s.estado] = (acc[s.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_SALTO.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoSalto, number>));

    return {
        totalSaltos: saltos.length,
        saltosCompletadosCount,
        porcentajeExito,
        altitudSalidaPromedioPies,
        tiempoTotalCaidaLibreSegundos,
        tiempoTotalCaidaLibreMinutos,
        saltoMayorCaidaLibre,
        desglosePorTipo,
        desglosePorEstado
    };
}

export class ServicioGestionLogSaltos {
    private readonly contenedor = new ContenedorColeccionSaltos<RegistroSalto>();
    private readonly advertencias: string[] = [];

    constructor(private readonly paracaidistaRaw: Paracaidista) { }

    public procesarLogSaltos(saltosRaw: readonly RegistroSalto[]): ResumenLogSaltos {
        const resParacaidista = validarParacaidista(this.paracaidistaRaw);
        if (!resParacaidista.esValido) {
            this.advertencias.push(...resParacaidista.errores);
        }

        this.advertencias.push(...validarLogRaw(saltosRaw));

        for (const rawSalto of saltosRaw) {
            const resSalto = validarRegistroSalto(rawSalto);

            if (!resSalto.esValido) {
                this.advertencias.push(...resSalto.errores);
            } else {
                const agregado = this.contenedor.agregar(resSalto.datos);
                if (!agregado) {
                    this.advertencias.push(`No se pudo agregar el salto duplicado por ID: ${rawSalto.id}`);
                }
            }
        }

        const saltosValidos = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasSaltos(saltosValidos);

        const saltosReserva = saltosValidos.filter((s) => s.estado === 'AperturaReserva');
        if (saltosReserva.length > 0) {
            this.advertencias.push(
                `Alerta de seguridad: Se registraron ${saltosReserva.length} apertura(s) de reserva de emergencia.`
            );
        }

        return {
            paracaidistaNombre: this.paracaidistaRaw.nombre,
            licencia: this.paracaidistaRaw.licencia,
            totalSaltosValidos: saltosValidos.length,
            metricas,
            saltosProcesados: saltosValidos,
            advertencias: this.advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenLogSaltos(resumen: ResumenLogSaltos, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` LOG AVANZADO DE SALTOS - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Paracaidista        : ${resumen.paracaidistaNombre}`);
    console.log(`Licencia USPA / FAA : ${resumen.licencia}`);
    console.log(`Saltos Registrados  : ${resumen.totalSaltosValidos}`);
    console.log(`Efectividad Exito   : ${resumen.metricas.saltosCompletadosCount} de ${resumen.metricas.totalSaltos} (${resumen.metricas.porcentajeExito}%)`);
    console.log(`Altitud Prom. Salida: ${resumen.metricas.altitudSalidaPromedioPies.toLocaleString()} ft`);
    console.log(`Caída Libre Total   : ${resumen.metricas.tiempoTotalCaidaLibreMinutos} min (${resumen.metricas.tiempoTotalCaidaLibreSegundos}s)`);
    console.log(`Mayor Caída Libre   : ${resumen.metricas.saltoMayorCaidaLibre ? `Salto #${resumen.metricas.saltoMayorCaidaLibre.numeroSalto} (${resumen.metricas.saltoMayorCaidaLibre.tiempoCaidaLibreSegundos}s a ${resumen.metricas.saltoMayorCaidaLibre.altitudSalidaPies} ft - ${resumen.metricas.saltoMayorCaidaLibre.tipoSalto})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS Y ALERTAS (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR TIPO DE SALTO:`);
    Object.entries(resumen.metricas.desglosePorTipo).forEach(([tipo, cantidad]) => {
        console.log(`   - ${tipo.padEnd(14)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.saltosProcesados.map((s) => ({
            '#': s.numeroSalto,
            Tipo: s.tipoSalto,
            'Alt. Salida': `${s.altitudSalidaPies} ft`,
            'Alt. Apertura': `${s.altitudAperturaPies} ft`,
            'Caída Libre': `${s.tiempoCaidaLibreSegundos}s`,
            Zona: s.zonaSalto,
            Equipo: s.equipoUsado,
            Estado: s.estado
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const paracaidistaNormal: Paracaidista = {
    id: 'skydiver-01',
    nombre: 'José Rodríguez',
    licencia: 'LicenciaC',
    saltosAcumulados: 120
};

const s1: RegistroSalto = {
    id: 'jump-101',
    numeroSalto: 121,
    paracaidista: paracaidistaNormal,
    tipoSalto: 'Freefly',
    altitudSalidaPies: 14000,
    altitudAperturaPies: 4000,
    tiempoCaidaLibreSegundos: 58,
    estado: 'Completado',
    zonaSalto: 'Skydive Guatemala (Escuintla)',
    fechaHora: '2026-11-01T10:30:00Z',
    equipoUsado: 'Vector 3 / Sabre3 150'
};

const s2: RegistroSalto = {
    id: 'jump-102',
    numeroSalto: 122,
    paracaidista: paracaidistaNormal,
    tipoSalto: 'Formacion',
    altitudSalidaPies: 13500,
    altitudAperturaPies: 3800,
    tiempoCaidaLibreSegundos: 52,
    estado: 'Completado',
    zonaSalto: 'Skydive Guatemala (Escuintla)',
    fechaHora: '2026-11-01T14:00:00Z',
    equipoUsado: 'Vector 3 / Sabre3 150'
};

const s3: RegistroSalto = {
    id: 'jump-103',
    numeroSalto: 123,
    paracaidista: paracaidistaNormal,
    tipoSalto: 'Wingsuit',
    altitudSalidaPies: 15000,
    altitudAperturaPies: 4500,
    tiempoCaidaLibreSegundos: 95,
    estado: 'Completado',
    zonaSalto: 'Skydive Puerto San José',
    fechaHora: '2026-11-08T09:15:00Z',
    equipoUsado: 'Freak 4 Wingsuit / Pulse 170'
};

// --- CASO 1: Temporada de Saltos de Entrenamiento (Caso Normal) ---
const servicioNormal = new ServicioGestionLogSaltos(paracaidistaNormal);
const resumenNormal = servicioNormal.procesarLogSaltos([s1, s2, s3]);
mostrarResumenLogSaltos(resumenNormal, 'Caso Normal - Entrenamiento Skydive Guatemala');

// --- CASO 2: Inversión de Altitud, Apertura de Reserva y Salto Duplicado (Caso Límite) ---
const saltoCorrupto: RegistroSalto = {
    id: 'jump-999',
    numeroSalto: 124,
    paracaidista: paracaidistaNormal,
    tipoSalto: 'SoloAFF',
    altitudSalidaPies: 3000,
    altitudAperturaPies: 4500, // Apertura (4500 ft) > Salida (3000 ft) -> Invalido
    tiempoCaidaLibreSegundos: -10, // Caida libre negativa -> Invalido
    estado: 'AperturaReserva',
    zonaSalto: 'Skydive Guatemala',
    fechaHora: '2026-11-09T11:00:00Z',
    equipoUsado: 'Equipo Alumno 220'
};

const saltoReservaEmergencia: RegistroSalto = {
    id: 'jump-125',
    numeroSalto: 125,
    paracaidista: paracaidistaNormal,
    tipoSalto: 'Freefly',
    altitudSalidaPies: 14000,
    altitudAperturaPies: 3000,
    tiempoCaidaLibreSegundos: 60,
    estado: 'AperturaReserva', // Provocará alerta de reserva de emergencia
    zonaSalto: 'Skydive Guatemala',
    fechaHora: '2026-11-09T16:00:00Z',
    equipoUsado: 'Vector 3 / PDR 143 Reserve'
};

const servicioLimite = new ServicioGestionLogSaltos(paracaidistaNormal);
const resumenLimite = servicioLimite.procesarLogSaltos([
    s1,
    saltoCorrupto,
    saltoReservaEmergencia,
    s1 // Salto ID y numero duplicado
]);
mostrarResumenLogSaltos(resumenLimite, 'Caso Límite - Inversión de Altitud y Apertura de Reserva');