// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type RarezaItem = 'Común' | 'Raro' | 'Épico' | 'Legendario' | 'Mítico';
export type CategoriaItem = 'Arma' | 'Munición' | 'Curación' | 'Escudo' | 'Táctica';
export type CalibreArma = '5.56mm' | '7.62mm' | '9mm' | '.50 BMG' | 'Cartucho';

export interface BaseItem {
    readonly id: string;
    readonly nombre: string;
    readonly categoria: CategoriaItem;
    readonly rareza: RarezaItem;
    readonly pesoUnitario: number; // Peso en kilogramos o unidades de inventario
    readonly stackMaximo: number;
}

export interface ItemArma extends BaseItem {
    readonly categoria: 'Arma';
    readonly dps: number;
    readonly calibre: CalibreArma;
    readonly cargadorMaximo: number;
}

export interface ItemConsumable extends BaseItem {
    readonly categoria: 'Curación' | 'Escudo';
    readonly puntosRestaurados: number;
    readonly tiempoUsoSegundos: number;
    readonly cantidad: number;
}

export interface ItemMunicion extends BaseItem {
    readonly categoria: 'Munición';
    readonly calibre: CalibreArma;
    readonly cantidad: number;
}

export interface ItemTactica extends BaseItem {
    readonly categoria: 'Táctica';
    readonly alcanceMetros: number;
    readonly durabilidadUso: number;
    readonly cantidad: number;
}

// Unión discriminada por la propiedad estricta 'categoria'
export type ItemInventario = ItemArma | ItemConsumable | ItemMunicion | ItemTactica;

export interface MochilaTactica {
    readonly capacidadPesoMaximo: number;
    readonly limiteSlots: number;
    readonly items: readonly ItemInventario[];
}

export interface MetricasInventario {
    readonly pesoTotal: number;
    readonly pesoDisponible: number;
    readonly porcentajeCarga: number;
    readonly totalSlotsUsados: number;
    readonly slotsDisponibles: number;
    readonly armaPrincipal: ItemArma | null;
    readonly dpsTotalEquipado: number;
    readonly sobrecargado: boolean;
}

export interface ResumenInventario {
    readonly idJugador: string;
    readonly mochila: MochilaTactica;
    readonly metricas: MetricasInventario;
    readonly advertencias: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. HELPER FUNCTIONS Y VALIDACIONES DE DOMINIO

export function obtenerCantidadItem(item: ItemInventario): number {
    return 'cantidad' in item ? item.cantidad : 1;
}

export function obtenerPesoTotalItem(item: ItemInventario): number {
    const cantidad = obtenerCantidadItem(item);
    return Number((item.pesoUnitario * cantidad).toFixed(2));
}

export function validarItem(item: ItemInventario): ResultadoValidacion<ItemInventario> {
    const errores: string[] = [];
    const cantidad = obtenerCantidadItem(item);

    if (item.pesoUnitario <= 0) {
        errores.push(`El ítem "${item.nombre}" contiene un peso unitario inválido (${item.pesoUnitario} kg).`);
    }

    if (cantidad <= 0) {
        errores.push(`El ítem "${item.nombre}" debe incluir una cantidad mayor a 0.`);
    }

    if (cantidad > item.stackMaximo) {
        errores.push(`El ítem "${item.nombre}" excede el stack máximo permitido (${cantidad}/${item.stackMaximo}).`);
    }

    if (item.categoria === 'Arma' && item.dps <= 0) {
        errores.push(`El arma "${item.nombre}" tiene un DPS no válido (${item.dps}).`);
    }

    return errores.length === 0
        ? { esValido: true, datos: item }
        : { esValido: false, errores };
}

export function validarMochila(mochila: MochilaTactica): ResultadoValidacion<MochilaTactica> {
    const errores: string[] = [];

    if (mochila.capacidadPesoMaximo <= 0) {
        errores.push('La capacidad límite de peso de la mochila debe ser estrictamente mayor a 0.');
    }

    if (mochila.limiteSlots <= 0) {
        errores.push('El límite total de slots debe ser mayor a 0.');
    }

    if (mochila.items.length > mochila.limiteSlots) {
        errores.push(`La cantidad de ítems (${mochila.items.length}) sobrepasa el límite de slots (${mochila.limiteSlots}).`);
    }

    return errores.length === 0
        ? { esValido: true, datos: mochila }
        : { esValido: false, errores };
}

// 3. TRANSFORMACIÓN Y CÁLCULOS TÁCTICOS

const JERARQUIA_RAREZA: Record<RarezaItem, number> = {
    'Común': 1,
    'Raro': 2,
    'Épico': 3,
    'Legendario': 4,
    'Mítico': 5
};

export function calcularMetricasInventario(mochila: MochilaTactica): MetricasInventario {
    const pesoTotal = Number(
        mochila.items.reduce((acc, item) => acc + obtenerPesoTotalItem(item), 0).toFixed(2)
    );

    const pesoDisponible = Number(Math.max(0, mochila.capacidadPesoMaximo - pesoTotal).toFixed(2));
    const porcentajeCarga = Number(Math.min(100, (pesoTotal / mochila.capacidadPesoMaximo) * 100).toFixed(1));
    const totalSlotsUsados = mochila.items.length;
    const slotsDisponibles = Math.max(0, mochila.limiteSlots - totalSlotsUsados);
    const sobrecargado = pesoTotal > mochila.capacidadPesoMaximo;

    // Filtrado con Type Guard estricto para extraer solo las armas
    const armas = mochila.items.filter((item): item is ItemArma => item.categoria === 'Arma');

    // Determinar el arma principal (Prioriza DPS; en caso de empate, la mayor rareza)
    const armaPrincipal = armas.length > 0
        ? [...armas].sort((a, b) => {
            if (b.dps !== a.dps) return b.dps - a.dps;
            return JERARQUIA_RAREZA[b.rareza] - JERARQUIA_RAREZA[a.rareza];
        })[0]
        : null;

    const dpsTotalEquipado = armas.reduce((acc, arma) => acc + arma.dps, 0);

    return {
        pesoTotal,
        pesoDisponible,
        porcentajeCarga,
        totalSlotsUsados,
        slotsDisponibles,
        armaPrincipal,
        dpsTotalEquipado,
        sobrecargado
    };
}

export function procesarInventario(idJugador: string, mochilaRaw: MochilaTactica): ResumenInventario {
    const advertencias: string[] = [];

    const validacionMochila = validarMochila(mochilaRaw);
    if (!validacionMochila.esValido) {
        advertencias.push(...validacionMochila.errores);
    }

    const itemsValidos: ItemInventario[] = [];
    for (const item of mochilaRaw.items) {
        const res = validarItem(item);
        if (res.esValido) {
            itemsValidos.push(res.datos);
        } else {
            advertencias.push(...res.errores);
        }
    }

    const mochilaFiltrada: MochilaTactica = {
        ...mochilaRaw,
        items: itemsValidos
    };

    const metricas = calcularMetricasInventario(mochilaFiltrada);

    if (metricas.sobrecargado) {
        advertencias.push(`¡ALERTA DE SOBRECARGA! El peso acumulado (${metricas.pesoTotal} kg) excede el límite máximo (${mochilaRaw.capacidadPesoMaximo} kg).`);
    }

    return {
        idJugador,
        mochila: mochilaFiltrada,
        metricas,
        advertencias
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenInventario(resumen: ResumenInventario, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` INVENTARIO TÁCTICO BATTLE ROYALE - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`ID Jugador          : ${resumen.idJugador}`);
    console.log(`Capacidad Carga     : ${resumen.metricas.pesoTotal} / ${resumen.mochila.capacidadPesoMaximo} kg (${resumen.metricas.porcentajeCarga}%)`);
    console.log(`Slots Utilizados    : ${resumen.metricas.totalSlotsUsados} / ${resumen.mochila.limiteSlots} (Libres: ${resumen.metricas.slotsDisponibles})`);
    console.log(`Estado Mochila      : ${resumen.metricas.sobrecargado ? ' SOBRECARGADO' : ' NORMAL'}`);
    console.log(`Arma Principal      : ${resumen.metricas.armaPrincipal ? `${resumen.metricas.armaPrincipal.nombre} [${resumen.metricas.armaPrincipal.rareza}] - DPS: ${resumen.metricas.armaPrincipal.dps}` : 'Sin armas'}`);
    console.log(`DPS Combinado       : ${resumen.metricas.dpsTotalEquipado}`);
    console.log(`----------------------------------------------------------------------`);

    if (resumen.advertencias.length > 0) {
        console.log(`ADVERTENCIAS DE INVENTARIO (${resumen.advertencias.length}):`);
        resumen.advertencias.forEach((adv) => console.log(`   - ${adv}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.table(
        resumen.mochila.items.map((item) => ({
            Nombre: item.nombre,
            Categoría: item.categoria,
            Rareza: item.rareza,
            Cantidad: obtenerCantidadItem(item),
            'Stack Máx': item.stackMaximo,
            'Peso Unit.': `${item.pesoUnitario} kg`,
            'Peso Total': `${obtenerPesoTotalItem(item)} kg`
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

// --- CASO 1: Loadout Competitivo Balanceado (Caso Normal) ---
const inventarioNormal: MochilaTactica = {
    capacidadPesoMaximo: 30.0,
    limiteSlots: 8,
    items: [
        {
            id: 'item-1',
            nombre: 'AK-47 Táctica',
            categoria: 'Arma',
            rareza: 'Legendario',
            pesoUnitario: 4.2,
            stackMaximo: 1,
            dps: 285,
            calibre: '7.62mm',
            cargadorMaximo: 30
        },
        {
            id: 'item-2',
            nombre: 'Sniper M40',
            categoria: 'Arma',
            rareza: 'Épico',
            pesoUnitario: 6.5,
            stackMaximo: 1,
            dps: 310,
            calibre: '.50 BMG',
            cargadorMaximo: 5
        },
        {
            id: 'item-3',
            nombre: 'Munición 7.62mm',
            categoria: 'Munición',
            rareza: 'Común',
            pesoUnitario: 0.05,
            stackMaximo: 120,
            calibre: '7.62mm',
            cantidad: 90
        },
        {
            id: 'item-4',
            nombre: 'Botiquín Médico',
            categoria: 'Curación',
            rareza: 'Raro',
            pesoUnitario: 1.5,
            stackMaximo: 3,
            puntosRestaurados: 75,
            tiempoUsoSegundos: 5,
            cantidad: 2
        },
        {
            id: 'item-5',
            nombre: 'Escudo de Plasma',
            categoria: 'Escudo',
            rareza: 'Épico',
            pesoUnitario: 1.0,
            stackMaximo: 4,
            puntosRestaurados: 100,
            tiempoUsoSegundos: 4,
            cantidad: 2
        }
    ]
};

// --- CASO 2: Sobrecarga, Ítem con Peso Negativo y Stack Excedido (Caso Límite) ---
const inventarioLimite: MochilaTactica = {
    capacidadPesoMaximo: 15.0, // Capacidad reducida
    limiteSlots: 4,
    items: [
        {
            id: 'item-6',
            nombre: 'Lanzacohetes Pesado',
            categoria: 'Arma',
            rareza: 'Mítico',
            pesoUnitario: 12.0,
            stackMaximo: 1,
            dps: 450,
            calibre: '.50 BMG',
            cargadorMaximo: 1
        },
        {
            id: 'item-7',
            nombre: 'Batería Pesada',
            categoria: 'Escudo',
            rareza: 'Legendario',
            pesoUnitario: 3.5,
            stackMaximo: 2,
            puntosRestaurados: 100,
            tiempoUsoSegundos: 6,
            cantidad: 2 // 7.0 kg extra (Suma 19.0 kg > 15.0 kg -> Sobrecargado)
        },
        {
            id: 'item-8',
            nombre: 'Munición Alterada',
            categoria: 'Munición',
            rareza: 'Común',
            pesoUnitario: 0.02,
            stackMaximo: 50,
            calibre: '9mm',
            cantidad: 150 // Supera el stack máximo de 50
        },
        {
            id: 'item-9',
            nombre: 'Granada Defectuosa',
            categoria: 'Táctica',
            rareza: 'Común',
            pesoUnitario: -1.0, // Peso negativo inválido
            stackMaximo: 5,
            alcanceMetros: 10,
            durabilidadUso: 1,
            cantidad: 1
        }
    ]
};

// Ejecución
const resumenNormal = procesarInventario('Player_Viper_97', inventarioNormal);
mostrarResumenInventario(resumenNormal, 'Caso Normal - Inventario Equilibrado');

const resumenLimite = procesarInventario('Player_Overloaded_01', inventarioLimite);
mostrarResumenInventario(resumenLimite, 'Caso Límite - Sobrecarga y Errores');