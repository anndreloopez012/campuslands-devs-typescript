// 1. MODELADO DEL DOMINIO (Tipos, Interfaces y Discriminados)

export type ClasePersonaje = 'Guerrero' | 'Mago' | 'Arquero' | 'Paladin' | 'Nigromante';
export type SlotEquipamiento = 'Cabeza' | 'Pecho' | 'Manos' | 'Pies' | 'ArmaPrincipal' | 'ArmaSecundaria';

export interface AtributosBase {
    readonly fuerza: number;
    readonly agilidad: number;
    readonly inteligencia: number;
    readonly vitalidad: number;
}

export interface PiezaEquipamiento {
    readonly id: string;
    readonly nombre: string;
    readonly slot: SlotEquipamiento;
    readonly bonusAtributos: Partial<AtributosBase>;
    readonly nivelRequerido: number;
    readonly clasesPermitidas: readonly ClasePersonaje[];
}

export interface PersonajeRPG {
    readonly id: string;
    readonly nombre: string;
    readonly clase: ClasePersonaje;
    readonly nivel: number;
    readonly atributosBase: AtributosBase;
    readonly equipamiento: readonly PiezaEquipamiento[];
}

export interface EstadisticasCombateRPG {
    readonly vidaMaxima: number;
    readonly manaMaximo: number;
    readonly ataqueFisico: number;
    readonly ataqueMagico: number;
    readonly defensaFisica: number;
    readonly defensaMagica: number;
    readonly velocidadAtaque: number;
}

export interface BuildProcesado {
    readonly personaje: PersonajeRPG;
    readonly atributosTotales: AtributosBase;
    readonly estadisticas: EstadisticasCombateRPG;
    readonly esValido: boolean;
    readonly erroresValidacion: readonly string[];
}

export type ResultadoValidacion<T> =
    | { readonly esValido: true; readonly datos: T }
    | { readonly esValido: false; readonly errores: readonly string[] };

// 2. FUNCIONES DE VALIDACIÓN (Reglas de Negocio Puras)

export function validarPersonajeBase(personaje: PersonajeRPG): readonly string[] {
    const errores: string[] = [];

    if (personaje.nivel < 1 || personaje.nivel > 100) {
        errores.push(`Nivel invalido (${personaje.nivel}). Debe estar entre 1 y 100.`);
    }

    const { fuerza, agilidad, inteligencia, vitalidad } = personaje.atributosBase;
    if (fuerza < 0 || agilidad < 0 || inteligencia < 0 || vitalidad < 0) {
        errores.push('Los atributos base no pueden contener valores negativos.');
    }

    return errores;
}

export function validarEquipamiento(personaje: PersonajeRPG): readonly string[] {
    const errores: string[] = [];
    const slotsOcupados = new Set<SlotEquipamiento>();

    for (const item of personaje.equipamiento) {
        if (slotsOcupados.has(item.slot)) {
            errores.push(`Slot duplicado: Se intento equipar mas de un objeto en el slot ${item.slot}.`);
        }
        slotsOcupados.add(item.slot);

        if (personaje.nivel < item.nivelRequerido) {
            errores.push(
                `Nivel insuficiente para ${item.nombre}: Requiere nivel ${item.nivelRequerido} y el personaje es nivel ${personaje.nivel}.`
            );
        }

        if (!item.clasesPermitidas.includes(personaje.clase)) {
            errores.push(
                `Incompatibilidad de clase: ${item.nombre} no puede ser utilizado por la clase ${personaje.clase}.`
            );
        }
    }

    return errores;
}

export function validarBuild(personaje: PersonajeRPG): ResultadoValidacion<PersonajeRPG> {
    const erroresBase = validarPersonajeBase(personaje);
    const erroresEquipamiento = validarEquipamiento(personaje);
    const todosLosErrores = [...erroresBase, ...erroresEquipamiento];

    return todosLosErrores.length === 0
        ? { esValido: true, datos: personaje }
        : { esValido: false, errores: todosLosErrores };
}

// 3. TRANSFORMACIÓN Y CÁLCULOS

export function calcularAtributosTotales(
    atributosBase: AtributosBase,
    equipamiento: readonly PiezaEquipamiento[]
): AtributosBase {
    return equipamiento.reduce<AtributosBase>(
        (acc, item) => ({
            fuerza: acc.fuerza + (item.bonusAtributos.fuerza ?? 0),
            agilidad: acc.agilidad + (item.bonusAtributos.agilidad ?? 0),
            inteligencia: acc.inteligencia + (item.bonusAtributos.inteligencia ?? 0),
            vitalidad: acc.vitalidad + (item.bonusAtributos.vitalidad ?? 0)
        }),
        { ...atributosBase }
    );
}

export function calcularEstadisticasCombate(atributos: AtributosBase, nivel: number): EstadisticasCombateRPG {
    const { fuerza, agilidad, inteligencia, vitalidad } = atributos;

    return {
        vidaMaxima: vitalidad * 12 + fuerza * 3 + nivel * 10,
        manaMaximo: inteligencia * 15 + nivel * 5,
        ataqueFisico: fuerza * 4 + agilidad * 2,
        ataqueMagico: inteligencia * 5,
        defensaFisica: vitalidad * 3 + fuerza * 1,
        defensaMagica: inteligencia * 2 + vitalidad * 2,
        velocidadAtaque: Number((1.0 + agilidad * 0.02).toFixed(2))
    };
}

export function procesarBuild(personaje: PersonajeRPG): BuildProcesado {
    const validacion = validarBuild(personaje);
    const atributosTotales = calcularAtributosTotales(personaje.atributosBase, personaje.equipamiento);
    const estadisticas = calcularEstadisticasCombate(atributosTotales, personaje.nivel);

    return {
        personaje,
        atributosTotales,
        estadisticas,
        esValido: validacion.esValido,
        erroresValidacion: validacion.esValido ? [] : validacion.errores
    };
}

// 4. PRESENTACIÓN Y SALIDA POR CONSOLA

export function mostrarResumenBuild(build: BuildProcesado, tituloCaso: string): void {
    console.log(`\n======================================================================`);
    console.log(` BUILDER DE PERSONAJE RPG - ${tituloCaso.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`Nombre              : ${build.personaje.nombre}`);
    console.log(`Clase               : ${build.personaje.clase}`);
    console.log(`Nivel               : ${build.personaje.nivel}`);
    console.log(`Estado de Build     : ${build.esValido ? 'VALIDO' : 'INVALIDO'}`);
    console.log(`----------------------------------------------------------------------`);

    if (!build.esValido) {
        console.log(`ERRORES DE VALIDACION (${build.erroresValidacion.length}):`);
        build.erroresValidacion.forEach((err) => console.log(`   - ${err}`));
        console.log(`----------------------------------------------------------------------`);
    }

    console.log(`ATRIBUTOS TOTALES (Base + Bonus Equipamiento):`);
    console.log(`   Fuerza       : ${build.atributosTotales.fuerza} (Base: ${build.personaje.atributosBase.fuerza})`);
    console.log(`   Agilidad     : ${build.atributosTotales.agilidad} (Base: ${build.personaje.atributosBase.agilidad})`);
    console.log(`   Inteligencia : ${build.atributosTotales.inteligencia} (Base: ${build.personaje.atributosBase.inteligencia})`);
    console.log(`   Vitalidad    : ${build.atributosTotales.vitalidad} (Base: ${build.personaje.atributosBase.vitalidad})`);
    console.log(`----------------------------------------------------------------------`);

    console.log(`ESTADISTICAS DE COMBATE CALCULADAS:`);
    console.log(`   Vida Maxima        : ${build.estadisticas.vidaMaxima}`);
    console.log(`   Mana Maximo        : ${build.estadisticas.manaMaximo}`);
    console.log(`   Ataque Fisico      : ${build.estadisticas.ataqueFisico}`);
    console.log(`   Ataque Magico      : ${build.estadisticas.ataqueMagico}`);
    console.log(`   Defensa Fisica     : ${build.estadisticas.defensaFisica}`);
    console.log(`   Defensa Magica     : ${build.estadisticas.defensaMagica}`);
    console.log(`   Velocidad Ataque   : ${build.estadisticas.velocidadAtaque}x`);
    console.log(`----------------------------------------------------------------------`);

    console.log(`EQUIPAMIENTO (${build.personaje.equipamiento.length} Piezas):`);
    console.table(
        build.personaje.equipamiento.map((item) => ({
            Nombre: item.nombre,
            Slot: item.slot,
            'Nivel Req': item.nivelRequerido,
            'Bonus Fuerza': item.bonusAtributos.fuerza ?? 0,
            'Bonus Agilidad': item.bonusAtributos.agilidad ?? 0,
            'Bonus Inteligencia': item.bonusAtributos.inteligencia ?? 0,
            'Bonus Vitalidad': item.bonusAtributos.vitalidad ?? 0
        }))
    );
}

// 5. CASOS DE PRUEBA (Caso Normal y Caso Límite)

// --- CASO 1: Paladín de Alto Nivel (Caso Normal) ---
const paladinNormal: PersonajeRPG = {
    id: 'char-101',
    nombre: 'Sir Galahad',
    clase: 'Paladin',
    nivel: 45,
    atributosBase: {
        fuerza: 50,
        agilidad: 20,
        inteligencia: 35,
        vitalidad: 60
    },
    equipamiento: [
        {
            id: 'eq-1',
            nombre: 'Casco del Devoto',
            slot: 'Cabeza',
            bonusAtributos: { vitalidad: 10, inteligencia: 5 },
            nivelRequerido: 40,
            clasesPermitidas: ['Paladin', 'Guerrero']
        },
        {
            id: 'eq-2',
            nombre: 'Peto de Placas Divinas',
            slot: 'Pecho',
            bonusAtributos: { vitalidad: 25, fuerza: 15 },
            nivelRequerido: 45,
            clasesPermitidas: ['Paladin']
        },
        {
            id: 'eq-3',
            nombre: 'Espada de Luz Sagrada',
            slot: 'ArmaPrincipal',
            bonusAtributos: { fuerza: 30, inteligencia: 15 },
            nivelRequerido: 42,
            clasesPermitidas: ['Paladin']
        }
    ]
};

// --- CASO 2: Mago Invalido (Nivel insuficiente, slot duplicado y clase incompatible) ---
const magoLimite: PersonajeRPG = {
    id: 'char-102',
    nombre: 'Merlin el Inexperto',
    clase: 'Mago',
    nivel: 15,
    atributosBase: {
        fuerza: 10,
        agilidad: 12,
        inteligencia: 40,
        vitalidad: 15
    },
    equipamiento: [
        {
            id: 'eq-4',
            nombre: 'Baston Archimago',
            slot: 'ArmaPrincipal',
            bonusAtributos: { inteligencia: 50 },
            nivelRequerido: 60, // Requiere nivel 60 (Personaje es nivel 15)
            clasesPermitidas: ['Mago']
        },
        {
            id: 'eq-5',
            nombre: 'Hacha de Guerra Orca',
            slot: 'ArmaPrincipal', // Slot duplicado con Baston Archimago
            bonusAtributos: { fuerza: 40 },
            nivelRequerido: 10,
            clasesPermitidas: ['Guerrero'] // Mago no puede usar Hacha de Guerra
        }
    ]
};

// Ejecución
const buildNormal = procesarBuild(paladinNormal);
mostrarResumenBuild(buildNormal, 'Caso Normal - Paladin de Nivel 45');

const buildLimite = procesarBuild(magoLimite);
mostrarResumenBuild(buildLimite, 'Caso Limite - Errores de Requisitos y Slot Duplicado');