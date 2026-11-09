
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type TipoSalto =
    | 'Tandem'
    | 'Solo'
    | 'Formacion'
    | 'Wingsuit'
    | 'Freefly'
    | 'Precision';

export type LicenciaParacaidista = 'Alumno' | 'A' | 'B' | 'C' | 'D';
export type EstadoSalto = 'Completado' | 'Incidente' | 'ProcedimientoReserva';

export interface Paracaidista {
    readonly id: string;
    readonly nombre: string;
    readonly licencia: LicenciaParacaidista;
    readonly club: string;
}

export interface SaltoParacaidismo {
    readonly id: string;
    readonly numeroSalto: number;
    readonly fecha: string;
    readonly tipo: TipoSalto;
    readonly altitudSalidaPies: number;
    readonly altitudAperturaPies: number;
    readonly tiempoCaidaLibreSegundos: number;
    readonly aeronave: string;
    readonly paracaidista: Paracaidista;
    readonly estado: EstadoSalto;
}

export interface MetricasBitacora {
    readonly totalSaltos: number;
    readonly tiempoTotalCaidaLibreSegundos: number;
    readonly tiempoPromedioCaidaLibreSegundos: number;
    readonly altitudPromedioSalidaPies: number;
    readonly saltoMasAlto: SaltoParacaidismo | null;
    readonly mayorTiempoCaidaLibre: SaltoParacaidismo | null;
    readonly desglosePorTipo: Readonly<Record<TipoSalto, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoSalto, number>>;
}

export interface ResumenBitacoraParacaidismo {
    readonly paracaidistaId: string;
    readonly paracaidistaNombre: string;
    readonly licencia: LicenciaParacaidista;
    readonly totalSaltosValidos: number;
    readonly metricas: MetricasBitacora;
    readonly saltosProcesados: readonly SaltoParacaidismo[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarSaltoParacaidismo(salto: SaltoParacaidismo): ResultadoValidacion<SaltoParacaidismo> {
    const errores: string[] = [];

    if (salto.numeroSalto <= 0) {
        errores.push(`Numero de salto invalido (${salto.numeroSalto}).`);
    }

    if (salto.altitudSalidaPies <= 0 || salto.altitudSalidaPies > 40000) {
        errores.push(`Altitud de salida fuera de rango operativo (${salto.altitudSalidaPies} ft) en salto #${salto.numeroSalto}.`);
    }

    if (salto.altitudAperturaPies <= 0 || salto.altitudAperturaPies >= salto.altitudSalidaPies) {
        errores.push(`La altitud de apertura (${salto.altitudAperturaPies} ft) debe ser mayor a 0 y menor que la altitud de salida (${salto.altitudSalidaPies} ft).`);
    }

    if (salto.altitudAperturaPies < 2000) {
        errores.push(`Advertencia de seguridad: Altitud de apertura bajo el minimo reglamentario (<2000 ft) en salto #${salto.numeroSalto}.`);
    }

    if (salto.tiempoCaidaLibreSegundos < 0 || salto.tiempoCaidaLibreSegundos > 300) {
        errores.push(`Tiempo de caida libre fuera de parametro normal (${salto.tiempoCaidaLibreSegundos}s) en salto #${salto.numeroSalto}.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: salto }
        : { esValido: false, errores };
}

export function validarBitacoraRaw(saltos: readonly SaltoParacaidismo[]): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();
    const numerosSaltoVistos = new Set<number>();

    if (saltos.length === 0) {
        advertencias.push('La bitacora de paracaidismo no registra saltos realizados.');
    }

    for (const salto of saltos) {
        if (idsVistos.has(salto.id)) {
            advertencias.push(`Registro de salto duplicado detectado: ID ${salto.id}.`);
        }
        if (numerosSaltoVistos.has(salto.numeroSalto)) {
            advertencias.push(`Numero de salto correlativo duplicado: #${salto.numeroSalto}.`);
        }
        idsVistos.add(salto.id);
        numerosSaltoVistos.add(salto.numeroSalto);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS USANDO REDUCE Y RECORD

const TIPOS_SALTO: readonly TipoSalto[] = [
    'Tandem',
    'Solo',
    'Formacion',
    'Wingsuit',
    'Freefly',
    'Precision'
];

const ESTADOS_SALTO: readonly EstadoSalto[] = [
    'Completado',
    'Incidente',
    'ProcedimientoReserva'
];

export function calcularMetricasBitacora(saltos: readonly SaltoParacaidismo[]): MetricasBitacora {
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
            tiempoTotalCaidaLibreSegundos: 0,
            tiempoPromedioCaidaLibreSegundos: 0,
            altitudPromedioSalidaPies: 0,
            saltoMasAlto: null,
            mayorTiempoCaidaLibre: null,
            desglosePorTipo: desgloseTipoVacio,
            desglosePorEstado: desgloseEstadoVacio
        };
    }

    const tiempoTotalCaidaLibreSegundos = saltos.reduce(
        (acc, s) => acc + s.tiempoCaidaLibreSegundos,
        0
    );

    const tiempoPromedioCaidaLibreSegundos = Number(
        (tiempoTotalCaidaLibreSegundos / saltos.length).toFixed(1)
    );

    const sumaAltitudes = saltos.reduce((acc, s) => acc + s.altitudSalidaPies, 0);
    const altitudPromedioSalidaPies = Number((sumaAltitudes / saltos.length).toFixed(0));

    const saltoMasAlto = [...saltos].sort(
        (a, b) => b.altitudSalidaPies - a.altitudSalidaPies
    )[0] ?? null;

    const mayorTiempoCaidaLibre = [...saltos].sort(
        (a, b) => b.tiempoCaidaLibreSegundos - a.tiempoCaidaLibreSegundos
    )[0] ?? null;

    // Agrupación de desglose por tipo usando reduce
    const desglosePorTipo = saltos.reduce((acc, s) => {
        acc[s.tipo] = (acc[s.tipo] ?? 0) + 1;
        return acc;
    }, TIPOS_SALTO.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TipoSalto, number>));

    // Agrupación de desglose por estado usando reduce
    const desglosePorEstado = saltos.reduce((acc, s) => {
        acc[s.estado] = (acc[s.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_SALTO.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoSalto, number>));

    return {
        totalSaltos: saltos.length,
        tiempoTotalCaidaLibreSegundos,
        tiempoPromedioCaidaLibreSegundos,
        altitudPromedioSalidaPies,
        saltoMasAlto,
        mayorTiempoCaidaLibre,
        desglosePorTipo,
        desglosePorEstado
    };
}

export function procesarBitacoraParacaidismo(
    paracaidista: Paracaidista,
    saltosRaw: readonly SaltoParacaidismo[]
): ResumenBitacoraParacaidismo {
    const advertencias: string[] = [...validarBitacoraRaw(saltosRaw)];
    const saltosValidos: SaltoParacaidismo[] = [];

    for (const raw of saltosRaw) {
        const res = validarSaltoParacaidismo(raw);
        if (res.esValido) {
            saltosValidos.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const metricas = calcularMetricasBitacora(saltosValidos);

    return {
        paracaidistaId: paracaidista.id,
        paracaidistaNombre: paracaidista.nombre,
        licencia: paracaidista.licencia,
        totalSaltosValidos: saltosValidos.length,
        metricas,
        saltosProcesados: saltosValidos,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenBitacora(resumen: ResumenBitacoraParacaidismo, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` BITACORA DE PARACAIDISMO - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Paracaidista        : ${resumen.paracaidistaNombre} (Licencia: ${resumen.licencia})`);
    console.log(`Saltos Validados    : ${resumen.totalSaltosValidos}`);
    console.log(`Tiempo Caida Libre  : ${resumen.metricas.tiempoTotalCaidaLibreSegundos}s (Promedio: ${resumen.metricas.tiempoPromedioCaidaLibreSegundos}s)`);
    console.log(`Altitud Prom. Salida: ${resumen.metricas.altitudPromedioSalidaPies.toLocaleString()} ft`);
    console.log(`Salto Mas Alto      : ${resumen.metricas.saltoMasAlto ? `#\${resumen.metricas.saltoMasAlto.numeroSalto} (${resumen.metricas.saltoMasAlto.altitudSalidaPies.toLocaleString()} ft -${resumen.metricas.saltoMasAlto.tipo})` : 'N/A'}`);
    console.log(`Mayor Tiempo Caida  : ${resumen.metricas.mayorTiempoCaidaLibre ? `#${resumen.metricas.mayorTiempoCaidaLibre.numeroSalto} (${resumen.metricas.mayorTiempoCaidaLibre.tiempoCaidaLibreSegundos}s)` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE SEGURIDAD Y DE REGISTRO (${resumen.advertencias.length}):`);
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
            Salto: `#${s.numeroSalto}`,
            Fecha: s.fecha,
            Tipo: s.tipo,
            Aeronave: s.aeronave,
            'Alt. Salida': `${s.altitudSalidaPies} ft`,
            'Alt. Apertura': `${s.altitudAperturaPies} ft`,
            'T. Caida': `${s.tiempoCaidaLibreSegundos}s`,
            Estado: s.estado
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const paracaidistaPro: Paracaidista = {
    id: 'SKYD-001',
    nombre: 'Jose Rodriguez',
    licencia: 'C',
    club: 'Skydive Skydivers Club'
};

// --- CASO 1: Bitácora Regular de Saltos (Caso Normal) ---
const saltosNormales: readonly SaltoParacaidismo[] = [
    {
        id: 'JUMP-101',
        numeroSalto: 101,
        fecha: '2026-08-12',
        tipo: 'Solo',
        altitudSalidaPies: 12500,
        altitudAperturaPies: 3500,
        tiempoCaidaLibreSegundos: 48,
        aeronave: 'Super Twin Otter',
        paracaidista: paracaidistaPro,
        estado: 'Completado'
    },
    {
        id: 'JUMP-102',
        numeroSalto: 102,
        fecha: '2026-09-05',
        tipo: 'Formacion',
        altitudSalidaPies: 14000,
        altitudAperturaPies: 4000,
        tiempoCaidaLibreSegundos: 55,
        aeronave: 'Skyvan',
        paracaidista: paracaidistaPro,
        estado: 'Completado'
    },
    {
        id: 'JUMP-103',
        numeroSalto: 103,
        fecha: '2026-10-18',
        tipo: 'Wingsuit',
        altitudSalidaPies: 15000,
        altitudAperturaPies: 3800,
        tiempoCaidaLibreSegundos: 95,
        aeronave: 'Super Twin Otter',
        paracaidista: paracaidistaPro,
        estado: 'Completado'
    },
    {
        id: 'JUMP-104',
        numeroSalto: 104,
        fecha: '2026-11-02',
        tipo: 'Freefly',
        altitudSalidaPies: 13000,
        altitudAperturaPies: 3500,
        tiempoCaidaLibreSegundos: 50,
        aeronave: 'Cessna Caravan',
        paracaidista: paracaidistaPro,
        estado: 'ProcedimientoReserva'
    }
];

// --- CASO 2: Apertura bajo altitud mínima, número de salto duplicado y datos anómalos (Caso Límite) ---
const saltosLimiteCorruptos: readonly SaltoParacaidismo[] = [
    {
        id: 'JUMP-105',
        numeroSalto: 105,
        fecha: '2026-11-05',
        tipo: 'Solo',
        altitudSalidaPies: 10000,
        altitudAperturaPies: 1500, // Apertura < 2000 ft (Invalido / Alerta Seguridad)
        tiempoCaidaLibreSegundos: 52,
        aeronave: 'Cessna 182',
        paracaidista: paracaidistaPro,
        estado: 'Incidente'
    },
    {
        id: 'JUMP-106',
        numeroSalto: 106,
        fecha: '2026-11-06',
        tipo: 'Precision',
        altitudSalidaPies: 5000,
        altitudAperturaPies: 6000, // Apertura > Salida -> Invalido
        tiempoCaidaLibreSegundos: 10,
        aeronave: 'Cessna 182',
        paracaidista: paracaidistaPro,
        estado: 'Completado'
    },
    {
        id: 'JUMP-101', // ID Duplicado con JUMP-101
        numeroSalto: 101, // Numero de salto duplicado
        fecha: '2026-08-12',
        tipo: 'Solo',
        altitudSalidaPies: 12500,
        altitudAperturaPies: 3500,
        tiempoCaidaLibreSegundos: 48,
        aeronave: 'Super Twin Otter',
        paracaidista: paracaidistaPro,
        estado: 'Completado'
    }
];

// Ejecución
const resumenNormal = procesarBitacoraParacaidismo(paracaidistaPro, saltosNormales);
mostrarResumenBitacora(resumenNormal, 'Caso Normal - Saltos de Entrenamiento y Wingsuit');

const resumenLimite = procesarBitacoraParacaidismo(paracaidistaPro, saltosLimiteCorruptos);
mostrarResumenBitacora(resumenLimite, 'Caso Limite - Apertura Baja y Registros Duplicados');