
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type RarezaSkin =
    | 'Consumidor'
    | 'MilSpec'
    | 'Restringido'
    | 'Clasificado'
    | 'Encubierto'
    | 'Extraordinario';

export type EstadoDesgaste =
    | 'RecienFabricado'
    | 'CasiNuevo'
    | 'AlgoDesgastado'
    | 'BastanteDesgastado'
    | 'Deplorable';

export type TipoArma =
    | 'Rifle'
    | 'Francotirador'
    | 'Pistola'
    | 'Subfusil'
    | 'Cuchillo'
    | 'Guantes';

export type EstadoTransaccion =
    | 'Disponible'
    | 'Vendido'
    | 'EnOferta'
    | 'Cancelado';

export interface VendedorSkin {
    readonly id: string;
    readonly nombre: string;
    readonly reputacionScore: number; // Evaluacion de 0 a 100
}

export interface CompradorSkin {
    readonly id: string;
    readonly nombre: string;
}

export interface SkinShooter {
    readonly id: string;
    readonly nombreSkin: string;
    readonly arma: TipoArma;
    readonly rareza: RarezaSkin;
    readonly desgaste: EstadoDesgaste;
    readonly floatValue: number; // Valor entre 0.0000 y 1.0000
    readonly esStatTrak: boolean;
    readonly precioUSD: number;
}

export interface TransaccionSkin {
    readonly id: string;
    readonly skin: SkinShooter;
    readonly vendedor: VendedorSkin;
    readonly comprador: CompradorSkin | null;
    readonly fechaTransaccion: string;
    readonly comisionPlataformaUSD: number;
    readonly estado: EstadoTransaccion;
}

export interface MetricasMercadoSkins {
    readonly totalTransacciones: number;
    readonly totalVendidas: number;
    readonly volumenTotalUSD: number;
    readonly precioPromedioUSD: number;
    readonly comisionesTotalesUSD: number;
    readonly skinMasCostosa: SkinShooter | null;
    readonly desglosePorRareza: Readonly<Record<RarezaSkin, number>>;
    readonly desglosePorTipoArma: Readonly<Record<TipoArma, number>>;
    readonly desglosePorEstado: Readonly<Record<EstadoTransaccion, number>>;
}

export interface ResumenMercadoSkins {
    readonly totalTransaccionesValidas: number;
    readonly metricas: MetricasMercadoSkins;
    readonly transaccionesProcesadas: readonly TransaccionSkin[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarSkin(skin: SkinShooter): ResultadoValidacion<SkinShooter> {
    const errores: string[] = [];

    if (skin.precioUSD <= 0) {
        errores.push(`El precio de la skin "${skin.nombreSkin}" debe ser mayor a 0 USD ($${skin.precioUSD}).`);
    }

    if (skin.floatValue < 0.0 || skin.floatValue > 1.0) {
        errores.push(`El float value de "${skin.nombreSkin}" esta fuera de rango de desgate (${skin.floatValue}).`);
    }

    if (skin.nombreSkin.trim().length === 0) {
        errores.push('La skin debe registrar un nombre valido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: skin }
        : { esValido: false, errores };
}

export function validarTransaccionSkin(tx: TransaccionSkin): ResultadoValidacion<TransaccionSkin> {
    const errores: string[] = [];

    if (tx.comisionPlataformaUSD < 0) {
        errores.push(`La comision de plataforma no puede ser negativa ($${tx.comisionPlataformaUSD}) en la transaccion ${tx.id}.`);
    }

    if (tx.vendedor.reputacionScore < 0 || tx.vendedor.reputacionScore > 100) {
        errores.push(`Score de reputacion invalido (${tx.vendedor.reputacionScore}) para el vendedor ${tx.vendedor.nombre}.`);
    }

    if (tx.estado === 'Vendido' && tx.comprador === null) {
        errores.push(`Inconsistencia en la transaccion ${tx.id}: Estado Vendido pero no registra comprador.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: tx }
        : { esValido: false, errores };
}

export function validarMercadoRaw(transacciones: readonly TransaccionSkin[]): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();

    if (transacciones.length === 0) {
        advertencias.push('El historial del mercado de skins no registra transacciones.');
    }

    for (const tx of transacciones) {
        if (idsVistos.has(tx.id)) {
            advertencias.push(`Transaccion duplicada detectada por ID: ${tx.id}.`);
        }
        idsVistos.add(tx.id);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce y Record)

const RAREZAS_SKIN: readonly RarezaSkin[] = [
    'Consumidor',
    'MilSpec',
    'Restringido',
    'Clasificado',
    'Encubierto',
    'Extraordinario'
];

const TIPOS_ARMA: readonly TipoArma[] = [
    'Rifle',
    'Francotirador',
    'Pistola',
    'Subfusil',
    'Cuchillo',
    'Guantes'
];

const ESTADOS_TRANSACCION: readonly EstadoTransaccion[] = [
    'Disponible',
    'Vendido',
    'EnOferta',
    'Cancelado'
];

export function calcularMetricasMercado(transacciones: readonly TransaccionSkin[]): MetricasMercadoSkins {
    if (transacciones.length === 0) {
        const desgloseRarezaVacio = RAREZAS_SKIN.reduce((acc, r) => {
            acc[r] = 0;
            return acc;
        }, {} as Record<RarezaSkin, number>);

        const desgloseArmaVacio = TIPOS_ARMA.reduce((acc, a) => {
            acc[a] = 0;
            return acc;
        }, {} as Record<TipoArma, number>);

        const desgloseEstadoVacio = ESTADOS_TRANSACCION.reduce((acc, e) => {
            acc[e] = 0;
            return acc;
        }, {} as Record<EstadoTransaccion, number>);

        return {
            totalTransacciones: 0,
            totalVendidas: 0,
            volumenTotalUSD: 0,
            precioPromedioUSD: 0,
            comisionesTotalesUSD: 0,
            skinMasCostosa: null,
            desglosePorRareza: desgloseRarezaVacio,
            desglosePorTipoArma: desgloseArmaVacio,
            desglosePorEstado: desgloseEstadoVacio
        };
    }

    const transaccionesVendidas = transacciones.filter((t) => t.estado === 'Vendido');
    const totalVendidas = transaccionesVendidas.length;

    const volumenTotalUSD = Number(
        transaccionesVendidas.reduce((acc, t) => acc + t.skin.precioUSD, 0).toFixed(2)
    );

    const precioPromedioUSD = totalVendidas > 0
        ? Number((volumenTotalUSD / totalVendidas).toFixed(2))
        : 0;

    const comisionesTotalesUSD = Number(
        transaccionesVendidas.reduce((acc, t) => acc + t.comisionPlataformaUSD, 0).toFixed(2)
    );

    const skinMasCostosa = [...transacciones]
        .map((t) => t.skin)
        .sort((a, b) => b.precioUSD - a.precioUSD)[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorRareza = transacciones.reduce((acc, t) => {
        acc[t.skin.rareza] = (acc[t.skin.rareza] ?? 0) + 1;
        return acc;
    }, RAREZAS_SKIN.reduce((acc, r) => ({ ...acc, [r]: 0 }), {} as Record<RarezaSkin, number>));

    const desglosePorTipoArma = transacciones.reduce((acc, t) => {
        acc[t.skin.arma] = (acc[t.skin.arma] ?? 0) + 1;
        return acc;
    }, TIPOS_ARMA.reduce((acc, a) => ({ ...acc, [a]: 0 }), {} as Record<TipoArma, number>));

    const desglosePorEstado = transacciones.reduce((acc, t) => {
        acc[t.estado] = (acc[t.estado] ?? 0) + 1;
        return acc;
    }, ESTADOS_TRANSACCION.reduce((acc, e) => ({ ...acc, [e]: 0 }), {} as Record<EstadoTransaccion, number>));

    return {
        totalTransacciones: transacciones.length,
        totalVendidas,
        volumenTotalUSD,
        precioPromedioUSD,
        comisionesTotalesUSD,
        skinMasCostosa,
        desglosePorRareza,
        desglosePorTipoArma,
        desglosePorEstado
    };
}

export function procesarMercadoSkins(transaccionesRaw: readonly TransaccionSkin[]): ResumenMercadoSkins {
    const advertencias: string[] = [...validarMercadoRaw(transaccionesRaw)];
    const transaccionesValidas: TransaccionSkin[] = [];

    for (const raw of transaccionesRaw) {
        const resSkin = validarSkin(raw.skin);
        const resTx = validarTransaccionSkin(raw);

        if (!resSkin.esValido) {
            advertencias.push(...resSkin.errores.map((err) => `Transaccion ${raw.id}: ${err}`));
        }
        if (!resTx.esValido) {
            advertencias.push(...resTx.errores);
        }

        if (resSkin.esValido && resTx.esValido) {
            transaccionesValidas.push(raw);
        }
    }

    const metricas = calcularMercadoSkins(transaccionesValidas);

    return {
        totalTransaccionesValidas: transaccionesValidas.length,
        metricas,
        transaccionesProcesadas: transaccionesValidas,
        advertencias
    };
}

export function calcularMercadoSkins(transacciones: readonly TransaccionSkin[]): MetricasMercadoSkins {
    return calcularMetricasMercado(transacciones);
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenMercado(resumen: ResumenMercadoSkins, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` MERCADO DE SKINS DE SHOOTERS - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Transacciones Validadas: ${resumen.totalTransaccionesValidas}`);
    console.log(`Skins Vendidas         : ${resumen.metricas.totalVendidas} de ${resumen.metricas.totalTransacciones}`);
    console.log(`Volumen de Ventas      : $${resumen.metricas.volumenTotalUSD.toLocaleString()} USD`);
    console.log(`Precio Promedio        : $${resumen.metricas.precioPromedioUSD} USD`);
    console.log(`Comisiones Recaudadas  : $${resumen.metricas.comisionesTotalesUSD} USD`);
    console.log(`Skin Mas Costosa       : ${resumen.metricas.skinMasCostosa ? `${resumen.metricas.skinMasCostosa.nombreSkin} ($${resumen.metricas.skinMasCostosa.precioUSD} USD - ${resumen.metricas.skinMasCostosa.rareza})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE COMPROBACION (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE POR RAREZA DE SKIN:`);
    Object.entries(resumen.metricas.desglosePorRareza).forEach(([rareza, cantidad]) => {
        console.log(`   - ${rareza.padEnd(16)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.transaccionesProcesadas.map((t) => ({
            ID: t.id,
            Skin: t.skin.nombreSkin,
            Arma: t.skin.arma,
            Rareza: t.skin.rareza,
            Desgaste: t.skin.desgaste,
            Float: t.skin.floatValue.toFixed(4),
            StatTrak: t.skin.esStatTrak ? 'SI' : 'NO',
            Precio: `$${t.skin.precioUSD}`,
            Vendedor: t.vendedor.nombre,
            Comprador: t.comprador ? t.comprador.nombre : 'N/A',
            Estado: t.estado
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const vendedor1: VendedorSkin = { id: 'vend-01', nombre: 's1mple_trader', reputacionScore: 98 };
const vendedor2: VendedorSkin = { id: 'vend-02', nombre: 'ZywOo_skins', reputacionScore: 95 };

const comprador1: CompradorSkin = { id: 'comp-01', nombre: 'Dev1ce_collector' };
const comprador2: CompradorSkin = { id: 'comp-02', nombre: 'NiKo_shopper' };

// --- CASO 1: Operaciones en Mercado Común de Skins (Caso Normal) ---
const transaccionesNormales: readonly TransaccionSkin[] = [
    {
        id: 'TX-SKIN-001',
        skin: {
            id: 'SK-01',
            nombreSkin: 'AK-47 | Dragon Lore',
            arma: 'Rifle',
            rareza: 'Encubierto',
            desgaste: 'RecienFabricado',
            floatValue: 0.0125,
            esStatTrak: true,
            precioUSD: 4500.0
        },
        vendedor: vendedor1,
        comprador: comprador1,
        fechaTransaccion: '2026-11-08',
        comisionPlataformaUSD: 112.5,
        estado: 'Vendido'
    },
    {
        id: 'TX-SKIN-002',
        skin: {
            id: 'SK-02',
            nombreSkin: 'Karambit | Doppler Phase 2',
            arma: 'Cuchillo',
            rareza: 'Extraordinario',
            desgaste: 'CasiNuevo',
            floatValue: 0.0782,
            esStatTrak: false,
            precioUSD: 1850.0
        },
        vendedor: vendedor2,
        comprador: comprador2,
        fechaTransaccion: '2026-11-09',
        comisionPlataformaUSD: 46.25,
        estado: 'Vendido'
    },
    {
        id: 'TX-SKIN-003',
        skin: {
            id: 'SK-03',
            nombreSkin: 'AWP | Asiimov',
            arma: 'Francotirador',
            rareza: 'Clasificado',
            desgaste: 'AlgoDesgastado',
            floatValue: 0.2451,
            esStatTrak: true,
            precioUSD: 120.0
        },
        vendedor: vendedor1,
        comprador: null,
        fechaTransaccion: '2026-11-09',
        comisionPlataformaUSD: 3.0,
        estado: 'Disponible'
    }
];

// --- CASO 2: Float Fuera de Rango, Vendido sin Comprador y Transacción Duplicada (Caso Límite) ---
const transaccionesLimiteCorruptas: readonly TransaccionSkin[] = [
    {
        id: 'TX-SKIN-004',
        skin: {
            id: 'SK-04',
            nombreSkin: 'USP-S | Kill Confirmed',
            arma: 'Pistola',
            rareza: 'Encubierto',
            desgaste: 'Deplorable',
            floatValue: 1.45, // Float > 1.0 -> Invalido
            esStatTrak: false,
            precioUSD: 60.0
        },
        vendedor: vendedor1,
        comprador: comprador1,
        fechaTransaccion: '2026-11-09',
        comisionPlataformaUSD: 1.5,
        estado: 'Vendido'
    },
    {
        id: 'TX-SKIN-005',
        skin: {
            id: 'SK-05',
            nombreSkin: 'M4A4 | Howl',
            arma: 'Rifle',
            rareza: 'Encubierto',
            desgaste: 'RecienFabricado',
            floatValue: 0.03,
            esStatTrak: true,
            precioUSD: 3200.0
        },
        vendedor: vendedor2,
        comprador: null, // Estado Vendido sin comprador -> Invalido
        fechaTransaccion: '2026-11-09',
        comisionPlataformaUSD: 80.0,
        estado: 'Vendido'
    },
    {
        id: 'TX-SKIN-001', // ID Duplicado con TX-SKIN-001
        skin: {
            id: 'SK-01',
            nombreSkin: 'AK-47 | Dragon Lore Copia',
            arma: 'Rifle',
            rareza: 'Encubierto',
            desgaste: 'RecienFabricado',
            floatValue: 0.0125,
            esStatTrak: true,
            precioUSD: 4500.0
        },
        vendedor: vendedor1,
        comprador: comprador1,
        fechaTransaccion: '2026-11-08',
        comisionPlataformaUSD: 112.5,
        estado: 'Vendido'
    }
];

// Ejecución
const resumenNormal = procesarMercadoSkins(transaccionesNormales);
mostrarResumenMercado(resumenNormal, 'Caso Normal - Transacciones de Mercado de Skins');

const resumenLimite = procesarMercadoSkins(transaccionesLimiteCorruptas);
mostrarResumenMercado(resumenLimite, 'Caso Limite - Float Invalido e Inconsistencia Vendido sin Comprador');