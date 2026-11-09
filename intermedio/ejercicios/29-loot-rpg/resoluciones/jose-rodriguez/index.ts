
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type RarezaLoot = 'Comun' | 'Raro' | 'Epico' | 'Legendario' | 'Mitico';

export type TipoLoot =
    | 'Arma'
    | 'Escudo'
    | 'Curacion'
    | 'Municion'
    | 'Accesorio'
    | 'Casco';

export type NivelCofre =
    | 'CofreNormal'
    | 'CofreRaro'
    | 'SupplyDrop'
    | 'LootCrate';

export interface ItemLoot {
    readonly id: string;
    readonly nombre: string;
    readonly tipo: TipoLoot;
    readonly rareza: RarezaLoot;
    readonly pesoInventario: number; // En kilogramos o slots (> 0)
    readonly poderBase: number; // Estadistica de combate/utilidad (>= 0)
    readonly durabilidadMax: number;
}

export interface ContenedorLoot {
    readonly id: string;
    readonly codigoContenedor: string;
    readonly nivel: NivelCofre;
    readonly ubicacionMapa: string;
    readonly capacidadPesoMax: number;
    readonly items: readonly ItemLoot[];
}

export interface MetricasLoot {
    readonly totalContenedores: number;
    readonly totalItemsLoot: number;
    readonly poderTotalLoot: number;
    readonly poderPromedioPorItem: number;
    readonly pesoTotalAcumulado: number;
    readonly itemMasPoderoso: ItemLoot | null;
    readonly desglosePorRareza: Readonly<Record<RarezaLoot, number>>;
    readonly desglosePorTipo: Readonly<Record<TipoLoot, number>>;
    readonly desglosePorNivelCofre: Readonly<Record<NivelCofre, number>>;
}

export interface ResumenSistemaLoot {
    readonly totalContenedoresValidos: number;
    readonly metricas: MetricasLoot;
    readonly contenedoresProcesados: readonly ContenedorLoot[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN DE DOMINIO

export function validarItemLoot(item: ItemLoot): ResultadoValidacion<ItemLoot> {
    const errores: string[] = [];

    if (item.pesoInventario <= 0) {
        errores.push(`El peso de inventario de "${item.nombre}" debe ser mayor a 0 (${item.pesoInventario} kg).`);
    }

    if (item.poderBase < 0) {
        errores.push(`El poder base de "${item.nombre}" no puede ser negativo (${item.poderBase}).`);
    }

    if (item.durabilidadMax <= 0) {
        errores.push(`La durabilidad maxima de "${item.nombre}" debe ser mayor a 0 (${item.durabilidadMax}).`);
    }

    if (item.nombre.trim().length === 0) {
        errores.push('El item de loot debe registrar un nombre valido.');
    }

    return errores.length === 0
        ? { esValido: true, datos: item }
        : { esValido: false, errores };
}

export function validarContenedorLoot(contenedor: ContenedorLoot): readonly string[] {
    const advertencias: string[] = [];

    if (contenedor.capacidadPesoMax <= 0) {
        advertencias.push(`La capacidad maxima del contenedor ${contenedor.codigoContenedor} es invalida (${contenedor.capacidadPesoMax} kg).`);
    }

    if (contenedor.items.length === 0) {
        advertencias.push(`El contenedor ${contenedor.codigoContenedor} en ${contenedor.ubicacionMapa} esta vacio.`);
    }

    const pesoTotalItems = contenedor.items.reduce((acc, item) => acc + item.pesoInventario, 0);
    if (pesoTotalItems > contenedor.capacidadPesoMax) {
        advertencias.push(
            `Exceso de peso en ${contenedor.codigoContenedor}: Los items acumulan ${pesoTotalItems.toFixed(1)} kg superando el limite de ${contenedor.capacidadPesoMax} kg.`
        );
    }

    return advertencias;
}

export function validarLootRaw(contenedores: readonly ContenedorLoot[]): readonly string[] {
    const advertencias: string[] = [];
    const idsVistos = new Set<string>();
    const codigosVistos = new Set<string>();

    if (contenedores.length === 0) {
        advertencias.push('El sistema de loot no registra contenedores en la partida.');
    }

    for (const c of contenedores) {
        if (idsVistos.has(c.id)) {
            advertencias.push(`Contenedor duplicado detectado por ID: ${c.id}.`);
        }
        if (codigosVistos.has(c.codigoContenedor)) {
            advertencias.push(`Codigo de contenedor duplicado: ${c.codigoContenedor}.`);
        }
        idsVistos.add(c.id);
        codigosVistos.add(c.codigoContenedor);
    }

    return advertencias;
}

// 3. TRANSFORMACIÓN Y CÁLCULOS (Uso de reduce y Record)

const RAREZAS_LOOT: readonly RarezaLoot[] = ['Comun', 'Raro', 'Epico', 'Legendario', 'Mitico'];
const TIPOS_LOOT: readonly TipoLoot[] = ['Arma', 'Escudo', 'Curacion', 'Municion', 'Accesorio', 'Casco'];
const NIVELES_COFRE: readonly NivelCofre[] = ['CofreNormal', 'CofreRaro', 'SupplyDrop', 'LootCrate'];

export function calcularMetricasLoot(contenedores: readonly ContenedorLoot[]): MetricasLoot {
    if (contenedores.length === 0) {
        const desgloseRarezaVacio = RAREZAS_LOOT.reduce((acc, r) => {
            acc[r] = 0;
            return acc;
        }, {} as Record<RarezaLoot, number>);

        const desgloseTipoVacio = TIPOS_LOOT.reduce((acc, t) => {
            acc[t] = 0;
            return acc;
        }, {} as Record<TipoLoot, number>);

        const desgloseNivelVacio = NIVELES_COFRE.reduce((acc, n) => {
            acc[n] = 0;
            return acc;
        }, {} as Record<NivelCofre, number>);

        return {
            totalContenedores: 0,
            totalItemsLoot: 0,
            poderTotalLoot: 0,
            poderPromedioPorItem: 0,
            pesoTotalAcumulado: 0,
            itemMasPoderoso: null,
            desglosePorRareza: desgloseRarezaVacio,
            desglosePorTipo: desgloseTipoVacio,
            desglosePorNivelCofre: desgloseNivelVacio
        };
    }

    const todosLosItems = contenedores.flatMap((c) => c.items);
    const totalItemsLoot = todosLosItems.length;

    const poderTotalLoot = Number(
        todosLosItems.reduce((acc, item) => acc + item.poderBase, 0).toFixed(1)
    );

    const poderPromedioPorItem = totalItemsLoot > 0
        ? Number((poderTotalLoot / totalItemsLoot).toFixed(1))
        : 0;

    const pesoTotalAcumulado = Number(
        todosLosItems.reduce((acc, item) => acc + item.pesoInventario, 0).toFixed(2)
    );

    const itemMasPoderoso = [...todosLosItems].sort((a, b) => b.poderBase - a.poderBase)[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorRareza = todosLosItems.reduce((acc, item) => {
        acc[item.rareza] = (acc[item.rareza] ?? 0) + 1;
        return acc;
    }, RAREZAS_LOOT.reduce((acc, r) => ({ ...acc, [r]: 0 }), {} as Record<RarezaLoot, number>));

    const desglosePorTipo = todosLosItems.reduce((acc, item) => {
        acc[item.tipo] = (acc[item.tipo] ?? 0) + 1;
        return acc;
    }, TIPOS_LOOT.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as Record<TipoLoot, number>));

    const desglosePorNivelCofre = contenedores.reduce((acc, c) => {
        acc[c.nivel] = (acc[c.nivel] ?? 0) + 1;
        return acc;
    }, NIVELES_COFRE.reduce((acc, n) => ({ ...acc, [n]: 0 }), {} as Record<NivelCofre, number>));

    return {
        totalContenedores: contenedores.length,
        totalItemsLoot,
        poderTotalLoot,
        poderPromedioPorItem,
        pesoTotalAcumulado,
        itemMasPoderoso,
        desglosePorRareza,
        desglosePorTipo,
        desglosePorNivelCofre
    };
}

export function procesarSistemaLoot(contenedoresRaw: readonly ContenedorLoot[]): ResumenSistemaLoot {
    const advertencias: string[] = [...validarLootRaw(contenedoresRaw)];
    const contenedoresValidos: ContenedorLoot[] = [];

    for (const raw of contenedoresRaw) {
        const advContenedor = validarContenedorLoot(raw);
        advertencias.push(...advContenedor);

        let itemsValidos = true;
        for (const item of raw.items) {
            const resItem = validarItemLoot(item);
            if (!resItem.esValido) {
                itemsValidos = false;
                advertencias.push(...resItem.errores.map((err) => `Contenedor ${raw.codigoContenedor}: ${err}`));
            }
        }

        if (advContenedor.length === 0 && itemsValidos) {
            contenedoresValidos.push(raw);
        }
    }

    const metricas = calcularMetricasLoot(contenedoresValidos);

    return {
        totalContenedoresValidos: contenedoresValidos.length,
        metricas,
        contenedoresProcesados: contenedoresValidos,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenLoot(resumen: ResumenSistemaLoot, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` SISTEMA DE LOOT BATTLE ROYALE - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Contenedores Validados : ${resumen.totalContenedoresValidos}`);
    console.log(`Total Items de Loot    : ${resumen.metricas.totalItemsLoot} objetos`);
    console.log(`Poder Total Acumulado  : ${resumen.metricas.poderTotalLoot} pts (Promed: ${resumen.metricas.poderPromedioPorItem} pts/item)`);
    console.log(`Peso Total Acumulado   : ${resumen.metricas.pesoTotalAcumulado} kg`);
    console.log(`Item Mas Poderoso      : ${resumen.metricas.itemMasPoderoso ? `${resumen.metricas.itemMasPoderoso.nombre} (${resumen.metricas.itemMasPoderoso.poderBase} pts - ${resumen.metricas.itemMasPoderoso.rareza})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE LOOT (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE ITEMS POR RAREZA:`);
    Object.entries(resumen.metricas.desglosePorRareza).forEach(([rareza, cantidad]) => {
        console.log(`   - ${rareza.padEnd(14)}: ${cantidad}`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.contenedoresProcesados.map((c) => ({
            ID: c.id,
            Codigo: c.codigoContenedor,
            Nivel: c.nivel,
            Ubicacion: c.ubicacionMapa,
            Items: c.items.length,
            'Peso Tot': `${c.items.reduce((acc, i) => acc + i.pesoInventario, 0).toFixed(1)} / ${c.capacidadPesoMax} kg`,
            'Poder Tot': c.items.reduce((acc, i) => acc + i.poderBase, 0)
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

const rifleLegendario: ItemLoot = { id: 'loot-01', nombre: 'Rifle de Asalto FX-9', tipo: 'Arma', rareza: 'Legendario', pesoInventario: 3.5, poderBase: 120, durabilidadMax: 100 };
const escudoMitico: ItemLoot = { id: 'loot-02', nombre: 'Escudo de Plasma V', tipo: 'Escudo', rareza: 'Mitico', pesoInventario: 4.0, poderBase: 200, durabilidadMax: 150 };
const medkitEpico: ItemLoot = { id: 'loot-03', nombre: 'Kit Medico de Emergencia', tipo: 'Curacion', rareza: 'Epico', pesoInventario: 1.2, poderBase: 80, durabilidadMax: 1 };
const cascoRaro: ItemLoot = { id: 'loot-04', nombre: 'Casco Tactico Nivel 2', tipo: 'Casco', rareza: 'Raro', pesoInventario: 1.5, poderBase: 50, durabilidadMax: 80 };

// --- CASO 1: Despliegue de Loot en Mapa Battle Royale (Caso Normal) ---
const contenedoresNormales: readonly ContenedorLoot[] = [
    {
        id: 'CHEST-001',
        codigoContenedor: 'SUPPLY_DROP_ALPHA',
        nivel: 'SupplyDrop',
        ubicacionMapa: 'Sector Central - Mochima',
        capacidadPesoMax: 15.0,
        items: [rifleLegendario, escudoMitico]
    },
    {
        id: 'CHEST-002',
        codigoContenedor: 'LOOT_CRATE_BETA',
        nivel: 'LootCrate',
        ubicacionMapa: 'Zona Industrial B',
        capacidadPesoMax: 10.0,
        items: [medkitEpico, cascoRaro]
    }
];

// --- CASO 2: Peso Excedido, Durabilidad Cero e ID Duplicado (Caso Límite) ---
const itemCorrupto: ItemLoot = { id: 'loot-05', nombre: 'Item Peso Invalido', tipo: 'Arma', rareza: 'Comun', pesoInventario: -2.0, poderBase: 10, durabilidadMax: 0 };

const contenedoresLimiteCorruptos: readonly ContenedorLoot[] = [
    {
        id: 'CHEST-003',
        codigoContenedor: 'CHEST_EXCESO_PESO',
        nivel: 'CofreNormal',
        ubicacionMapa: 'Ruinas del Norte',
        capacidadPesoMax: 2.0, // Limite de 2 kg
        items: [rifleLegendario, escudoMitico] // Peso acumulado = 7.5 kg -> Exceso de peso
    },
    {
        id: 'CHEST-004',
        codigoContenedor: 'CHEST_ITEM_INVALIDO',
        nivel: 'CofreRaro',
        ubicacionMapa: 'Costa Sur',
        capacidadPesoMax: 10.0,
        items: [itemCorrupto] // Item con peso negativo y durabilidad 0 -> Invalido
    },
    {
        id: 'CHEST-001', // ID Duplicado con CHEST-001
        codigoContenedor: 'SUPPLY_DROP_ALPHA', // Codigo duplicado
        nivel: 'SupplyDrop',
        ubicacionMapa: 'Sector Central',
        capacidadPesoMax: 15.0,
        items: [rifleLegendario]
    }
];

// Ejecución
const resumenNormal = procesarSistemaLoot(contenedoresNormales);
mostrarResumenLoot(resumenNormal, 'Caso Normal - Loot Drops de Partida');

const resumenLimite = procesarSistemaLoot(contenedoresLimiteCorruptos);
mostrarResumenLoot(resumenLimite, 'Caso Limite - Exceso de Capacidad e Items Corruptos');