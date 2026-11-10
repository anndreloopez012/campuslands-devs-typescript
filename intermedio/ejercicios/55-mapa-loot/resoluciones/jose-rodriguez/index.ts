
// 1. MODELADO DEL DOMINIO (Tipos, Interfaces, Unions, Generics y Promises)

export type CategoriaLoot =
    | 'Arma'
    | 'Escudo'
    | 'Curacion'
    | 'Municion'
    | 'Accesorio';

export type RarezaLoot =
    | 'Comun'
    | 'Raro'
    | 'Epico'
    | 'Legendario'
    | 'Mitico';

export type NivelPeligroZona = 'Bajo' | 'Medio' | 'Alto' | 'Extremo';

export interface Coordenada2D {
    readonly x: number;
    readonly y: number;
}

export interface ItemLoot {
    readonly id: string;
    readonly nombre: string;
    readonly categoria: CategoriaLoot;
    readonly rareza: RarezaLoot;
    readonly cantidad: number;
    readonly dpsOValor: number;
}

export interface ZonaLoot {
    readonly id: string;
    readonly codigoZona: string;
    readonly nombreZona: string;
    readonly coordenadas: Coordenada2D;
    readonly nivelPeligro: NivelPeligroZona;
    readonly densidadLootPct: number; // e.g., 85.5%
    readonly itemsDisponibles: readonly ItemLoot[];
    readonly esZonaHotDrop: boolean;
}

export interface MapaBattleRoyaleRaw {
    readonly id: string;
    readonly codigoMapa: string;
    readonly nombreMapa: string;
    readonly dimensionKM2: number;
    readonly zonas: readonly ZonaLoot[];
}

export interface MetricasMapaLoot {
    readonly totalZonas: number;
    readonly totalItemsLoot: number;
    readonly promedioItemsPorZona: number;
    readonly totalHotDropsCount: number;
    readonly porcentajeZonasHotDrop: number;
    readonly itemMasValioso: ItemLoot | null;
    readonly zonaMasDensa: ZonaLoot | null;
    readonly desglosePorCategoria: Readonly<Record<CategoriaLoot, number>>;
    readonly desglosePorRareza: Readonly<Record<RarezaLoot, number>>;
}

export interface ResumenMapaLoot {
    readonly mapaId: string;
    readonly codigoMapa: string;
    readonly nombreMapa: string;
    readonly dimensionKM2: number;
    readonly totalZonasValidas: number;
    readonly metricas: MetricasMapaLoot;
    readonly zonasProcesadas: readonly ZonaLoot[];
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. CONTENEDOR GENÉRICO Y GESTIÓN DE MAPA (Generics & Encapsulamiento)

export class ContenedorZonasLoot<T extends { readonly id: string; readonly codigoZona: string }> {
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

export function validarItemLoot(item: ItemLoot): ResultadoValidacion<ItemLoot> {
    const errores: string[] = [];

    if (item.cantidad <= 0 || item.cantidad > 999) {
        errores.push(`Cantidad invalida (${item.cantidad}) para el item "${item.nombre}".`);
    }

    if (item.dpsOValor < 0) {
        errores.push(`Valor o DPS negativo (${item.dpsOValor}) en el item "${item.nombre}".`);
    }

    if (item.nombre.trim().length === 0) {
        errores.push(`Item registrado sin nombre valido.`);
    }

    return errores.length === 0
        ? { esValido: true, datos: item }
        : { esValido: false, errores };
}

export async function validarZonaLootAsync(
    zona: ZonaLoot
): Promise<ResultadoValidacion<ZonaLoot>> {
    // Simulacion de verificacion asincrona en el servidor de mapas
    await new Promise((resolve) => setTimeout(resolve, 10));

    const errores: string[] = [];

    if (zona.coordenadas.x < 0 || zona.coordenadas.y < 0) {
        errores.push(`Coordenadas de zona invalidas (x: ${zona.coordenadas.x}, y: ${zona.coordenadas.y}) en "${zona.nombreZona}".`);
    }

    if (zona.densidadLootPct < 0 || zona.densidadLootPct > 100) {
        errores.push(`Porcentaje de densidad de loot fuera de rango (${zona.densidadLootPct}%) en "${zona.nombreZona}".`);
    }

    if (zona.itemsDisponibles.length === 0) {
        errores.push(`La zona "${zona.nombreZona}" no contiene items de loot registrados.`);
    }

    for (const item of zona.itemsDisponibles) {
        const resValItem = validarItemLoot(item);
        if (!resValItem.esValido) {
            errores.push(...resValItem.errores.map((e) => `En "${zona.nombreZona}": ${e}`));
        }
    }

    return errores.length === 0
        ? { esValido: true, datos: zona }
        : { esValido: false, errores };
}

export async function validarMapaRawAsync(
    mapa: MapaBattleRoyaleRaw
): Promise<ResultadoValidacion<MapaBattleRoyaleRaw>> {
    await new Promise((resolve) => setTimeout(resolve, 15));

    const errores: string[] = [];

    if (mapa.dimensionKM2 <= 0) {
        errores.push(`Dimension de mapa invalida (${mapa.dimensionKM2} km²) en "${mapa.nombreMapa}".`);
    }

    if (mapa.zonas.length === 0) {
        errores.push(`El mapa "${mapa.nombreMapa}" no registra zonas de aparicion de loot.`);
    }

    for (const z of mapa.zonas) {
        const resValZona = await validarZonaLootAsync(z);
        if (!resValZona.esValido) {
            errores.push(...resValZona.errores);
        }
    }

    return errores.length === 0
        ? { esValido: true, datos: mapa }
        : { esValido: false, errores };
}

// 4. TRANSFORMACIÓN Y CÁLCULOS MÉTRICOS (reduce & Record)

const CATEGORIAS_LOOT: readonly CategoriaLoot[] = [
    'Arma',
    'Escudo',
    'Curacion',
    'Municion',
    'Accesorio'
];

const RAREZAS_LOOT: readonly RarezaLoot[] = [
    'Comun',
    'Raro',
    'Epico',
    'Legendario',
    'Mitico'
];

export function calcularMetricasMapa(zonas: readonly ZonaLoot[]): MetricasMapaLoot {
    if (zonas.length === 0) {
        const desgloseCatVacio = CATEGORIAS_LOOT.reduce((acc, c) => {
            acc[c] = 0;
            return acc;
        }, {} as Record<CategoriaLoot, number>);

        const desgloseRarezaVacio = RAREZAS_LOOT.reduce((acc, r) => {
            acc[r] = 0;
            return acc;
        }, {} as Record<RarezaLoot, number>);

        return {
            totalZonas: 0,
            totalItemsLoot: 0,
            promedioItemsPorZona: 0,
            totalHotDropsCount: 0,
            porcentajeZonasHotDrop: 0,
            itemMasValioso: null,
            zonaMasDensa: null,
            desglosePorCategoria: desgloseCatVacio,
            desglosePorRareza: desgloseRarezaVacio
        };
    }

    const todosLosItems = zonas.flatMap((z) => z.itemsDisponibles);
    const totalItemsLoot = todosLosItems.reduce((acc, i) => acc + i.cantidad, 0);
    const promedioItemsPorZona = Number((totalItemsLoot / zonas.length).toFixed(1));

    const hotDrops = zonas.filter((z) => z.esZonaHotDrop);
    const totalHotDropsCount = hotDrops.length;
    const porcentajeZonasHotDrop = Number(((totalHotDropsCount / zonas.length) * 100).toFixed(1));

    const itemMasValioso = [...todosLosItems].sort((a, b) => b.dpsOValor - a.dpsOValor)[0] ?? null;
    const zonaMasDensa = [...zonas].sort((a, b) => b.densidadLootPct - a.densidadLootPct)[0] ?? null;

    // Agrupaciones mediante reduce y Record
    const desglosePorCategoria = todosLosItems.reduce((acc, i) => {
        acc[i.categoria] = (acc[i.categoria] ?? 0) + i.cantidad;
        return acc;
    }, CATEGORIAS_LOOT.reduce((acc, c) => ({ ...acc, [c]: 0 }), {} as Record<CategoriaLoot, number>));

    const desglosePorRareza = todosLosItems.reduce((acc, i) => {
        acc[i.rareza] = (acc[i.rareza] ?? 0) + i.cantidad;
        return acc;
    }, RAREZAS_LOOT.reduce((acc, r) => ({ ...acc, [r]: 0 }), {} as Record<RarezaLoot, number>));

    return {
        totalZonas: zonas.length,
        totalItemsLoot,
        promedioItemsPorZona,
        totalHotDropsCount,
        porcentajeZonasHotDrop,
        itemMasValioso,
        zonaMasDensa,
        desglosePorCategoria,
        desglosePorRareza
    };
}

export class ServicioGestionMapaLoot {
    private readonly contenedor = new ContenedorZonasLoot<ZonaLoot>();

    public async procesarMapaAsync(mapaRaw: MapaBattleRoyaleRaw): Promise<ResumenMapaLoot> {
        const advertencias: string[] = [];
        const valRes = await validarMapaRawAsync(mapaRaw);

        if (!valRes.esValido) {
            advertencias.push(...valRes.errores);
        }

        const idsVistos = new Set<string>();
        const codigosVistos = new Set<string>();

        for (const rawZona of mapaRaw.zonas) {
            if (idsVistos.has(rawZona.id)) {
                advertencias.push(`Zona duplicada detectada por ID: ${rawZona.id} (${rawZona.nombreZona}).`);
            } else if (codigosVistos.has(rawZona.codigoZona)) {
                advertencias.push(`Codigo de zona duplicado detectado: ${rawZona.codigoZona}.`);
            } else {
                idsVistos.add(rawZona.id);
                codigosVistos.add(rawZona.codigoZona);
                this.contenedor.agregar(rawZona);
            }
        }

        const zonasValidas = this.contenedor.obtenerTodos();
        const metricas = calcularMetricasMapa(zonasValidas);

        const zonasExtremas = zonasValidas.filter((z) => z.nivelPeligro === 'Extremo' && !z.esZonaHotDrop);
        if (zonasExtremas.length > 0) {
            advertencias.push(
                `Alerta de balance: Se detectaron ${zonasExtremas.length} zona(s) de peligro Extremo sin clasificar como Hot Drop.`
            );
        }

        return {
            mapaId: mapaRaw.id,
            codigoMapa: mapaRaw.codigoMapa,
            nombreMapa: mapaRaw.nombreMapa,
            dimensionKM2: mapaRaw.dimensionKM2,
            totalZonasValidas: zonasValidas.length,
            metricas,
            zonasProcesadas: zonasValidas,
            advertencias
        };
    }
}

// 5. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenMapaLoot(resumen: ResumenMapaLoot, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` MAPA DE LOOT BATTLE ROYALE - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Mapa                : ${resumen.nombreMapa} (${resumen.dimensionKM2} km²)`);
    console.log(`Codigo Mapa         : ${resumen.codigoMapa}`);
    console.log(`Zonas Validadas     : ${resumen.totalZonasValidas}`);
    console.log(`Total Items Loot    : ${resumen.metricas.totalItemsLoot.toLocaleString()} unidades`);
    console.log(`Promedio Items/Zona : ${resumen.metricas.promedioItemsPorZona}`);
    console.log(`Zonas Hot Drop      : ${resumen.metricas.totalHotDropsCount} de ${resumen.metricas.totalZonas} (${resumen.metricas.porcentajeZonasHotDrop}%)`);
    console.log(`Zona Mas Densa      : ${resumen.metricas.zonaMasDensa ? `"${resumen.metricas.zonaMasDensa.nombreZona}" (${resumen.metricas.zonaMasDensa.densidadLootPct}% densidad)` : 'N/A'}`);
    console.log(`Item Mas Valioso    : ${resumen.metricas.itemMasValioso ? `"${resumen.metricas.itemMasValioso.nombre}" (${resumen.metricas.itemMasValioso.dpsOValor} valor/DPS - ${resumen.metricas.itemMasValioso.rareza})` : 'N/A'}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE CONFIGURACION (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`DESGLOSE DE LOOT POR CATEGORIA:`);
    Object.entries(resumen.metricas.desglosePorCategoria).forEach(([cat, cantidad]) => {
        console.log(`   - ${cat.padEnd(12)}: ${cantidad} items`);
    });
    console.log(`----------------------------------------------------------------------`);

    console.table(
        resumen.zonasProcesadas.map((z) => ({
            ID: z.id,
            Codigo: z.codigoZona,
            Zona: z.nombreZona,
            Coord: `(${z.coordenadas.x}, ${z.coordenadas.y})`,
            Peligro: z.nivelPeligro,
            Densidad: `${z.densidadLootPct}%`,
            Items: z.itemsDisponibles.length,
            HotDrop: z.esZonaHotDrop ? 'Si' : 'No'
        }))
    );
}

// 6. CASOS DE PRUEBA (Caso Normal y Caso Límite Async/Await)

const i1: ItemLoot = { id: 'it-01', nombre: 'Rifle de Asalto M4A1', categoria: 'Arma', rareza: 'Epico', cantidad: 4, dpsOValor: 240 };
const i2: ItemLoot = { id: 'it-02', nombre: 'Escudo Pesado Nivel 3', categoria: 'Escudo', rareza: 'Legendario', cantidad: 2, dpsOValor: 150 };
const i3: ItemLoot = { id: 'it-03', nombre: 'Kit Medico de Emergencia', categoria: 'Curacion', rareza: 'Raro', cantidad: 10, dpsOValor: 100 };
const i4: ItemLoot = { id: 'it-04', nombre: 'Francotirador Calibre 50', categoria: 'Arma', rareza: 'Mitico', cantidad: 1, dpsOValor: 450 };

const z1: ZonaLoot = {
    id: 'zn-01',
    codigoZona: 'ZON-MILITARY-01',
    nombreZona: 'Base Militar Central',
    coordenadas: { x: 450, y: 320 },
    nivelPeligro: 'Extremo',
    densidadLootPct: 92.5,
    itemsDisponibles: [i1, i2, i4],
    esZonaHotDrop: true
};

const z2: ZonaLoot = {
    id: 'zn-02',
    codigoZona: 'ZON-CITY-02',
    nombreZona: 'Ciudad Metropolis',
    coordenadas: { x: 120, y: 680 },
    nivelPeligro: 'Alto',
    densidadLootPct: 78.0,
    itemsDisponibles: [i1, i3],
    esZonaHotDrop: true
};

const z3: ZonaLoot = {
    id: 'zn-03',
    codigoZona: 'ZON-FARM-03',
    nombreZona: 'Granja del Sur',
    coordenadas: { x: 800, y: 150 },
    nivelPeligro: 'Bajo',
    densidadLootPct: 45.0,
    itemsDisponibles: [i3],
    esZonaHotDrop: false
};

// --- CASO 1: Mapa Islaria Battle Royale (Caso Normal) ---
const mapaNormal: MapaBattleRoyaleRaw = {
    id: 'MAP-BR-2026',
    codigoMapa: 'MAP-ISLARIA-01',
    nombreMapa: 'Isla de la Tormenta',
    dimensionKM2: 64,
    zonas: [z1, z2, z3]
};

// --- CASO 2: Coordenadas Negativas, Densidad Fuera de Rango y ID Duplicado (Caso Límite) ---
const itemCorrupto: ItemLoot = {
    id: 'it-99',
    nombre: 'Item Corrupto Error',
    categoria: 'Arma',
    rareza: 'Comun',
    cantidad: -5, // Cantidad negativa -> Invalido
    dpsOValor: -50 // Valor negativo -> Invalido
};

const zonaCorrupta: ZonaLoot = {
    id: 'zn-99',
    codigoZona: 'ZON-ERR-999',
    nombreZona: 'Zona Corrupta Subterranea',
    coordenadas: { x: -10, y: -50 }, // Coordenadas negativas -> Invalido
    nivelPeligro: 'Extremo',
    densidadLootPct: 150.0, // Densidad > 100% -> Invalido
    itemsDisponibles: [itemCorrupto],
    esZonaHotDrop: false // Alerta por ser Extremo pero no HotDrop
};

const mapaLimiteCorrupto: MapaBattleRoyaleRaw = {
    id: 'MAP-FAIL-02',
    codigoMapa: 'MAP-FAIL-02',
    nombreMapa: 'Mapa Con Errores de Configuracion',
    dimensionKM2: 0, // Dimension 0 -> Invalido
    zonas: [
        z1,
        zonaCorrupta,
        z1 // Zona duplicada
    ]
};

async function ejecutarPruebas(): Promise<void> {
    const servicio = new ServicioGestionMapaLoot();

    // Ejecución Caso 1
    const resumenNormal = await servicio.procesarMapaAsync(mapaNormal);
    mostrarResumenMapaLoot(resumenNormal, 'Caso Normal - Isla de la Tormenta');

    // Ejecución Caso 2
    const resumenLimite = await servicio.procesarMapaAsync(mapaLimiteCorrupto);
    mostrarResumenMapaLoot(resumenLimite, 'Caso Limite - Coordenadas Invalidas y Datos Corruptos');
}

ejecutarPruebas().catch((err) => console.error('Error durante la ejecucion:', err));

